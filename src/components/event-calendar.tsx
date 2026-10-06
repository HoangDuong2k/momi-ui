import * as React from 'react'
import { useLocale, useMessages } from '../i18n/locale-provider'
import type { MomiMessages } from '../i18n/messages'
import { cn } from '../lib/cn'
import {
  addDays,
  addMinutes,
  addMonths,
  atMinutes,
  dayKey,
  daysBetween,
  isSameDay,
  minutesOfDay,
  shiftDays,
  startOfDay,
  startOfMonth,
  startOfWeek,
  type WeekStart,
} from '../lib/date'
import { ChevronLeftIcon, ChevronRightIcon } from '../lib/icons'
import { mergeRefs } from '../lib/merge-refs'
import { formatTime as formatTimeString } from '../lib/time'
import { useControllableState } from '../lib/use-controllable-state'
import { Button } from './button'
import { IconButton } from './icon-button'
import {
  CalendarContext,
  type CalendarContextValue,
  type CalendarEvent,
  type CalendarSelection,
  type CalendarTarget,
  type EventCalendarView,
  type EventRenderContext,
} from './internal/calendar-context'
import {
  compareEvents,
  coversDay,
  eventDays,
  eventEnd,
  isSpanning,
} from './internal/calendar-layout'
import { agendaTimeLabel, EventChip, MonthView, TimeGridView } from './internal/calendar-views'
import { scrollNearEdge } from './internal/sortable-drag'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

export type { CalendarEvent, EventCalendarView, EventRenderContext }

/** A new time for an event, from a drag, a resize or a keyboard move. `end` is exclusive. */
export interface EventCalendarChange<T extends CalendarEvent = CalendarEvent> {
  event: T
  start: Date
  end: Date
  allDay: boolean
}

/** Empty time the user picked: a click, a drag across slots, or Enter on a day. */
export interface EventCalendarRange {
  start: Date
  /** Exclusive. */
  end: Date
  allDay: boolean
}

export interface EventCalendarToolbarApi {
  /** "October 2026", "Oct 5 – 11, 2026"… */
  title: string
  view: EventCalendarView
  views: EventCalendarView[]
  date: Date
  setView: (view: EventCalendarView) => void
  goToday: () => void
  goPrevious: () => void
  goNext: () => void
  labels: MomiMessages['eventCalendar']
}

export interface EventCalendarProps<T extends CalendarEvent = CalendarEvent> extends Omit<
  React.ComponentProps<'div'>,
  'children' | 'defaultValue' | 'onChange'
> {
  events: T[]
  view?: EventCalendarView
  /** @default the first of `views` */
  defaultView?: EventCalendarView
  onViewChange?: (view: EventCalendarView) => void
  /** Views offered in the toolbar. @default ['month', 'week', 'day', 'agenda'] */
  views?: EventCalendarView[]
  /** Any day inside the period shown. Defaults to today. */
  date?: Date
  defaultDate?: Date
  onDateChange?: (date: Date) => void
  /** The days on screen changed (also called on mount) — load events for them here. */
  onRangeChange?: (range: { start: Date; end: Date; view: EventCalendarView }) => void
  /** Content of an event; the colored surface, focus ring and dragging are provided. */
  renderEvent?: (event: T, context: EventRenderContext) => React.ReactNode
  /** Click, or Enter on a focused event. */
  onEventClick?: (event: T) => void
  /** Click or drag over empty time (or Enter on a day in the month view) — e.g. to create an event. */
  onSelectRange?: (range: EventCalendarRange) => void
  /** Turns on dragging, resizing and keyboard moves. Update `events` with the new times. */
  onEventChange?: (change: EventCalendarChange<T>) => void
  /** Return false to forbid a change (shown as not allowed while dragging). */
  canChange?: (change: EventCalendarChange<T>) => boolean
  /** Replace the toolbar; return `null` to hide it. */
  renderToolbar?: (api: EventCalendarToolbarApi) => React.ReactNode
  /** Extra controls at the end of the built-in toolbar, e.g. a "New event" button. */
  toolbarActions?: React.ReactNode
  /** 0 = Sunday, 1 = Monday… @default 1 */
  weekStartsOn?: WeekStart
  /** BCP 47 locale for dates and times. Defaults to `LocaleProvider`'s. */
  locale?: string
  /** Force 12-hour (`'h12'`) or 24-hour (`'h23'`) times. Defaults to the locale's. */
  hourCycle?: 'h12' | 'h23'
  /** Override built-in text for this instance. */
  labels?: Partial<MomiMessages['eventCalendar']>
  /** First and last hour of the week and day views. @default 0 and 24 */
  dayStartHour?: number
  dayEndHour?: number
  /** Hour scrolled into view when the week or day view opens. @default 8 */
  scrollToHour?: number
  /** Height of an hour in the week and day views, in px. @default 48 */
  hourHeight?: number
  /** Minutes that drags, resizes and keyboard moves snap to. @default 15 */
  step?: number
  /** Length of an event made by a click, or dragged out of the all-day lane, in minutes. @default 60 */
  defaultEventDuration?: number
  /** Events listed per day in the month view before "+N more". Defaults to what fits. */
  maxEventsPerDay?: number
  /** Rows of the all-day lane in the week and day views before "+N more". @default 3 */
  maxAllDayEvents?: number
  /** Days listed by the agenda view. @default 30 */
  agendaDays?: number
}

const DEFAULT_VIEWS: EventCalendarView[] = ['month', 'week', 'day', 'agenda']
const TOUCH_DELAY = 300

type Change = { start: Date; end: Date; allDay: boolean }

type Session =
  | {
      type: 'event'
      item: CalendarEvent
      mode: 'move' | 'resize'
      pointerId: number
      x0: number
      y0: number
      x: number
      y: number
      touch: boolean
      active: boolean
      timer: number
      origin: CalendarTarget | null
      change: Change | null
      blocked: boolean
    }
  | {
      type: 'select'
      pointerId: number
      x0: number
      y0: number
      x: number
      y: number
      touch: boolean
      anchor: CalendarTarget
      current: CalendarTarget
      moved: boolean
    }

interface DragState {
  id: string
  change: Change
  blocked: boolean
  keyboard: boolean
}

const sameChange = (a: Change, b: Change) =>
  a.start.getTime() === b.start.getTime() &&
  a.end.getTime() === b.end.getTime() &&
  a.allDay === b.allDay

const parseDayKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** The days on screen for a view: [start, end) and, for the grids, the days or weeks. */
function viewRange(
  view: EventCalendarView,
  date: Date,
  weekStartsOn: WeekStart,
  agendaDays: number,
) {
  if (view === 'month') {
    const start = startOfWeek(startOfMonth(date), weekStartsOn)
    const lastOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    const end = addDays(startOfWeek(lastOfMonth, weekStartsOn), 7)
    const weeks = Array.from({ length: daysBetween(start, end) / 7 }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)),
    )
    return { start, end, days: weeks.flat(), weeks }
  }
  const start = view === 'week' ? startOfWeek(date, weekStartsOn) : startOfDay(date)
  const count = view === 'week' ? 7 : view === 'day' ? 1 : agendaDays
  const days = Array.from({ length: count }, (_, i) => addDays(start, i))
  return { start, end: addDays(start, count), days, weeks: [] as Date[][] }
}

/**
 * Month, week, day and agenda views of events, with dragging and resizing, keyboard moves,
 * selecting empty time to create events, and locale-aware dates and times.
 */
export function EventCalendar<T extends CalendarEvent = CalendarEvent>({
  events,
  view: viewProp,
  defaultView,
  onViewChange,
  views = DEFAULT_VIEWS,
  date: dateProp,
  defaultDate,
  onDateChange,
  onRangeChange,
  renderEvent,
  onEventClick,
  onSelectRange,
  onEventChange,
  canChange,
  renderToolbar,
  toolbarActions,
  weekStartsOn = 1,
  locale: localeProp,
  hourCycle,
  labels,
  dayStartHour = 0,
  dayEndHour = 24,
  scrollToHour = 8,
  hourHeight = 48,
  step = 15,
  defaultEventDuration = 60,
  maxEventsPerDay,
  maxAllDayEvents = 3,
  agendaDays = 30,
  className,
  'aria-label': ariaLabel,
  ref,
  ...props
}: EventCalendarProps<T>) {
  const context = useLocale()
  const locale = localeProp ?? context.locale
  const t = useMessages('eventCalendar', labels)
  const instructionsId = React.useId()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const mergedRef = React.useMemo(() => mergeRefs(rootRef, ref), [ref])
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const [now, setNow] = React.useState(() => new Date())
  const todayKey = dayKey(now)
  const today = React.useMemo(() => parseDayKey(todayKey), [todayKey])

  const [view, setViewState] = useControllableState<EventCalendarView>({
    value: viewProp,
    defaultValue: defaultView && views.includes(defaultView) ? defaultView : (views[0] ?? 'month'),
    onChange: onViewChange,
  })
  const [date, setDate] = useControllableState<Date>({
    value: dateProp,
    defaultValue: defaultDate ?? today,
    onChange: onDateChange,
  })
  const setView = (next: EventCalendarView) => {
    if (next !== view) setViewState(next)
  }

  const range = React.useMemo(
    () => viewRange(view, date, weekStartsOn, agendaDays),
    [view, date, weekStartsOn, agendaDays],
  )

  // The current time line moves every minute in the week and day views.
  React.useEffect(() => {
    if (view !== 'week' && view !== 'day') return
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [view])

  const latest = React.useRef({
    onRangeChange,
    onEventChange,
    onSelectRange,
    onEventClick,
    canChange,
  })
  React.useEffect(() => {
    latest.current = { onRangeChange, onEventChange, onSelectRange, onEventClick, canChange }
  })
  const rangeKey = `${view}:${range.start.getTime()}:${range.end.getTime()}`
  React.useEffect(() => {
    latest.current.onRangeChange?.({ start: range.start, end: range.end, view })
    // Keyed on the range itself, not on the identity of the objects describing it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeKey])

  /* Formatting ---------------------------------------------------------------------------------- */
  const formats = React.useMemo(() => {
    const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric', hourCycle }).resolvedOptions()
      .hourCycle
    const twentyFour = cycle === 'h23' || cycle === 'h24'
    return {
      twentyFour,
      hour: new Intl.DateTimeFormat(locale, { hour: 'numeric', hourCycle: 'h12' }),
      day: new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric' }),
      fullDay: new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      month: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      span: new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      monthShort: new Intl.DateTimeFormat(locale, { month: 'short' }),
    }
  }, [locale, hourCycle])

  const formatTime = React.useCallback(
    (d: Date) =>
      formatTimeString(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        locale,
        hourCycle,
      ),
    [locale, hourCycle],
  )
  const hourLabel = (hour: number) =>
    formats.twentyFour
      ? `${String(hour).padStart(2, '0')}:00`
      : formats.hour.format(new Date(2000, 0, 1, hour))
  const dayLabel = (day: Date) => formats.fullDay.format(day)

  const describeChange = React.useCallback(
    ({ start, end, allDay }: Change) => {
      if (allDay) {
        const last = end > start ? startOfDay(new Date(end.getTime() - 1)) : startOfDay(start)
        const days = isSameDay(start, last)
          ? formats.day.format(start)
          : formats.day.formatRange(start, last)
        return `${days}, ${t.allDay}`
      }
      if (end.getTime() === start.getTime())
        return `${formats.day.format(start)}, ${formatTime(start)}`
      if (isSameDay(start, new Date(end.getTime() - 1))) {
        return `${formats.day.format(start)}, ${formatTime(start)} – ${formatTime(end)}`
      }
      return `${formats.day.format(start)}, ${formatTime(start)} – ${formats.day.format(end)}, ${formatTime(end)}`
    },
    [formats, formatTime, t.allDay],
  )

  const title = React.useMemo(() => {
    if (view === 'month') return formats.month.format(date)
    if (view === 'day') return formats.fullDay.format(date)
    return formats.span.formatRange(range.start, addDays(range.end, -1))
  }, [view, date, range, formats])

  /* Navigation ---------------------------------------------------------------------------------- */
  const move = (direction: 1 | -1) => {
    if (view === 'month') setDate(addMonths(date, direction))
    else if (view === 'week') setDate(addDays(date, 7 * direction))
    else if (view === 'day') setDate(addDays(date, direction))
    else setDate(addDays(date, agendaDays * direction))
  }
  const showDay = views.includes('day')
    ? (day: Date) => {
        setDate(day)
        setView('day')
      }
    : undefined

  /* Dragging, resizing, selecting --------------------------------------------------------------- */
  const [drag, setDragState] = React.useState<DragState | null>(null)
  const dragRef = React.useRef<DragState | null>(null)
  const setDrag = (next: DragState | null) => {
    dragRef.current = next
    setDragState(next)
  }
  const [selection, setSelectionState] = React.useState<CalendarSelection | null>(null)
  const [announcement, setAnnouncement] = React.useState('')
  const sessionRef = React.useRef<Session | null>(null)
  const suppressClick = React.useRef(false)
  const refocusId = React.useRef<string | null>(null)
  const canEdit = (event: CalendarEvent) => Boolean(onEventChange) && event.editable !== false
  // Chips show a moved copy while dragging; callbacks always get the app's own object.
  const eventsById = React.useMemo(() => new Map(events.map((e) => [e.id, e])), [events])
  const source = (item: CalendarEvent): CalendarEvent => eventsById.get(item.id) ?? item

  const hitTest = (x: number, y: number): CalendarTarget | null => {
    const root = rootRef.current
    if (!root) return null
    const inside = (r: DOMRect) => x >= r.left && x < r.right && y >= r.top && y < r.bottom
    for (const el of root.querySelectorAll<HTMLElement>('[data-ec-day]')) {
      if (!inside(el.getBoundingClientRect())) continue
      return {
        kind: 'day',
        day: parseDayKey(el.dataset.ecDay!),
        lane: el.dataset.ecLane === 'allDay' ? 'allDay' : 'month',
      }
    }
    // Time columns run under the headers when scrolled: only their visible part counts.
    const scroller = scrollRef.current
    if (!scroller || !inside(scroller.getBoundingClientRect())) return null
    for (const el of root.querySelectorAll<HTMLElement>('[data-ec-col]')) {
      const r = el.getBoundingClientRect()
      if (x < r.left || x >= r.right) continue
      const minutes = dayStartHour * 60 + ((y - r.top) / hourHeight) * 60
      return {
        kind: 'time',
        day: parseDayKey(el.dataset.ecCol!),
        minutes: clamp(minutes, dayStartHour * 60, dayEndHour * 60),
      }
    }
    return null
  }

  const snap = (minutes: number) => Math.round(minutes / step) * step

  /** Where `item` lands when the pointer moves from `origin` to `target`. */
  /** Wall-clock minutes from the start of `from`'s day to `day` at `minutes` (DST-proof). */
  const wallMinutes = (from: Date, day: Date, minutes: number) =>
    daysBetween(from, day) * 1440 + minutes - minutesOfDay(from)
  /** `date` plus wall-clock minutes. */
  const plusWall = (date: Date, minutes: number) =>
    atMinutes(startOfDay(date), minutesOfDay(date) + minutes)

  const computeChange = (
    item: CalendarEvent,
    mode: 'move' | 'resize',
    origin: CalendarTarget | null,
    target: CalendarTarget,
  ): Change | null => {
    const start = item.start
    const end = eventEnd(item)
    const allDay = Boolean(item.allDay)
    const spanning = isSpanning(item)
    if (mode === 'resize') {
      if (target.kind === 'time' && !spanning && origin?.kind === 'time') {
        // The edge follows the pointer from where it was grabbed, in steps.
        const moved = daysBetween(origin.day, target.day) * 1440 + target.minutes - origin.minutes
        const stop = plusWall(end, snap(moved))
        const shortest = addMinutes(start, step)
        return { start, end: stop > shortest ? stop : shortest, allDay }
      }
      // Bars resize by whole days; time-grid blocks ignore the all-day lane.
      if (target.kind === 'day' && (spanning || origin?.kind === 'day')) {
        const { first, last } = eventDays(item)
        const delta = Math.max(daysBetween(last, target.day), daysBetween(last, first))
        if (allDay) return { start, end: addDays(addDays(last, delta), 1), allDay }
        const stop = shiftDays(end, delta)
        return { start, end: stop > start ? stop : addMinutes(start, step), allDay }
      }
      return null
    }
    if (target.kind === 'day') {
      // Out of the time grid into the all-day lane: becomes an all-day event on that day.
      if (target.lane === 'allDay' && !spanning) {
        return { start: target.day, end: addDays(target.day, 1), allDay: true }
      }
      const delta = origin ? daysBetween(origin.day, target.day) : 0
      return { start: shiftDays(start, delta), end: shiftDays(end, delta), allDay }
    }
    if (!spanning && origin?.kind === 'time') {
      const grab = wallMinutes(start, origin.day, origin.minutes)
      const next = atMinutes(target.day, snap(target.minutes - grab))
      return {
        start: next,
        end: plusWall(next, wallMinutes(start, end, minutesOfDay(end))),
        allDay: false,
      }
    }
    // Out of the all-day lane into the time grid: a timed event at that time.
    const next = atMinutes(target.day, snap(target.minutes))
    return { start: next, end: addMinutes(next, defaultEventDuration), allDay: false }
  }

  const isBlocked = (item: CalendarEvent, change: Change) => {
    const check = latest.current.canChange
    return check ? !check({ event: item as T, ...change }) : false
  }

  const timeSelection = (
    from: number,
    to: number,
    day: Date,
    moved: boolean,
  ): CalendarSelection => {
    const floor = (m: number) => Math.floor(m / step) * step
    const a = floor(from)
    if (!moved) {
      return {
        kind: 'time',
        day,
        start: a,
        end: Math.min(a + defaultEventDuration, dayEndHour * 60),
      }
    }
    const b = floor(to)
    return {
      kind: 'time',
      day,
      start: Math.min(a, b),
      end: Math.min(Math.max(a, b) + step, dayEndHour * 60),
    }
  }

  const update = (session: Session) => {
    const target = hitTest(session.x, session.y)
    if (!target) return
    if (session.type === 'event') {
      const change = computeChange(session.item, session.mode, session.origin, target)
      if (!change) return
      if (session.change && sameChange(change, session.change)) return
      session.change = change
      session.blocked = isBlocked(session.item, change)
      setDrag({ id: session.item.id, change, blocked: session.blocked, keyboard: false })
      return
    }
    const { anchor } = session
    if (anchor.kind === 'day' && target.kind === 'day' && target.lane === anchor.lane) {
      session.current = target
      setSelectionState({ kind: 'days', from: anchor.day, to: target.day })
    } else if (anchor.kind === 'time' && target.kind === 'time') {
      session.current = { kind: 'time', day: anchor.day, minutes: target.minutes }
      setSelectionState(timeSelection(anchor.minutes, target.minutes, anchor.day, true))
    }
  }

  // Window listeners for the session in progress; auto-scroll the time grid near its edges.
  const listenersRef = React.useRef<(() => void) | null>(null)
  // Cancels the session in progress, restoring everything it changed (also on unmount).
  const abortRef = React.useRef<(() => void) | null>(null)
  React.useEffect(() => () => abortRef.current?.(), [])

  const endSession = () => {
    listenersRef.current?.()
    const session = sessionRef.current
    if (session?.type === 'event') window.clearTimeout(session.timer)
    sessionRef.current = null
  }

  const startSession = (session: Session) => {
    endSession()
    sessionRef.current = session
    let frame = 0
    const body = document.body
    const previous = { userSelect: body.style.userSelect, cursor: body.style.cursor }

    const activate = () => {
      const s = sessionRef.current
      if (!s || s.type !== 'event' || s.active) return
      s.active = true
      body.style.userSelect = 'none'
      if (!s.touch) body.style.cursor = s.mode === 'resize' ? 'ns-resize' : 'grabbing'
      setDrag({
        id: s.item.id,
        change: { start: s.item.start, end: eventEnd(s.item), allDay: Boolean(s.item.allDay) },
        blocked: false,
        keyboard: false,
      })
      update(s)
      tick()
    }
    const tick = () => {
      cancelAnimationFrame(frame)
      const loop = () => {
        const s = sessionRef.current
        if (!s) return
        if (scrollNearEdge(scrollRef.current, s.x, s.y, 'y')) update(s)
        frame = requestAnimationFrame(loop)
      }
      frame = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      const s = sessionRef.current
      if (!s || e.pointerId !== s.pointerId) return
      s.x = e.clientX
      s.y = e.clientY
      const distance = Math.hypot(s.x - s.x0, s.y - s.y0)
      if (s.type === 'event') {
        if (!s.active) {
          // Touch: moving before the hold completes is a scroll, not a drag.
          if (s.touch) {
            if (distance > 8) finish(true)
          } else if (distance >= 4) {
            activate()
          }
          return
        }
        update(s)
        return
      }
      if (s.touch) {
        if (distance > 8) finish(true)
        return
      }
      if (!s.moved && distance >= 4) {
        s.moved = true
        body.style.userSelect = 'none'
        tick()
      }
      if (s.moved) update(s)
    }

    const finish = (cancelled: boolean) => {
      const s = sessionRef.current
      cancelAnimationFrame(frame)
      body.style.userSelect = previous.userSelect
      body.style.cursor = previous.cursor
      abortRef.current = null
      endSession()
      if (!s) return
      if (s.type === 'event') {
        if (!s.active) return
        // Swallow the click this release produces — but only that one: a touch drag or a drop on
        // another element produces none.
        suppressClick.current = true
        window.setTimeout(() => {
          suppressClick.current = false
        })
        setDrag(null)
        const original = {
          start: s.item.start,
          end: eventEnd(s.item),
          allDay: Boolean(s.item.allDay),
        }
        if (!cancelled && s.change && !s.blocked && !sameChange(s.change, original)) {
          latest.current.onEventChange?.({ event: s.item as T, ...s.change })
        }
        return
      }
      setSelectionState(null)
      if (cancelled) return
      const { anchor, current, moved } = s
      if (anchor.kind === 'day' && current.kind === 'day') {
        selectDays(anchor.day, moved ? current.day : anchor.day)
      } else if (anchor.kind === 'time' && current.kind === 'time') {
        const sel = timeSelection(anchor.minutes, current.minutes, anchor.day, moved)
        if (sel.kind === 'time') {
          latest.current.onSelectRange?.({
            start: atMinutes(sel.day, sel.start),
            end: atMinutes(sel.day, sel.end),
            allDay: false,
          })
        }
      }
    }

    const onUp = (e: PointerEvent) => {
      const s = sessionRef.current
      if (s && e.pointerId === s.pointerId) finish(false)
    }
    const onCancel = () => finish(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const s = sessionRef.current
      if (s?.type === 'event' && !s.active) return
      e.preventDefault()
      e.stopPropagation()
      finish(true)
    }
    const onTouchMove = (e: TouchEvent) => {
      const s = sessionRef.current
      if (s?.type === 'event' && s.active) e.preventDefault()
    }
    const onContextMenu = (e: Event) => {
      if (sessionRef.current?.type === 'event') e.preventDefault()
    }

    abortRef.current = () => finish(true)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('contextmenu', onContextMenu)
    listenersRef.current = () => {
      listenersRef.current = null
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('contextmenu', onContextMenu)
    }
    if (session.type === 'event' && session.touch) {
      session.timer = window.setTimeout(activate, TOUCH_DELAY)
    }
  }

  const selectDays = (from: Date, to: Date) => {
    const [a, b] = from <= to ? [from, to] : [to, from]
    latest.current.onSelectRange?.({
      start: startOfDay(a),
      end: addDays(startOfDay(b), 1),
      allDay: true,
    })
  }

  const onEventPointerDown: CalendarContextValue['onEventPointerDown'] = (e, shown, mode) => {
    e.stopPropagation()
    const item = source(shown)
    // One pointer at a time.
    if (e.button !== 0 || !canEdit(item) || sessionRef.current) return
    if (dragRef.current?.keyboard) {
      cancelKeyboard(false)
      return
    }
    startSession({
      type: 'event',
      item,
      mode,
      pointerId: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      x: e.clientX,
      y: e.clientY,
      touch: e.pointerType === 'touch',
      active: false,
      timer: 0,
      origin: hitTest(e.clientX, e.clientY),
      change: null,
      blocked: false,
    })
  }

  const onSlotPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || !onSelectRange || sessionRef.current) return
    if ((e.target as Element).closest('button, a, [role="button"], [data-ec-event]')) return
    const anchor = hitTest(e.clientX, e.clientY)
    if (!anchor) return
    startSession({
      type: 'select',
      pointerId: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      x: e.clientX,
      y: e.clientY,
      touch: e.pointerType === 'touch',
      anchor,
      current: anchor,
      moved: false,
    })
  }

  const onEventClickInternal: CalendarContextValue['onEventClick'] = (e, item) => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    e.stopPropagation()
    latest.current.onEventClick?.(source(item) as T)
  }

  /* Keyboard moves ------------------------------------------------------------------------------ */
  const keyboardItem = React.useRef<CalendarEvent | null>(null)

  const announceMove = (item: CalendarEvent, change: Change, blocked: boolean) =>
    `${t.moved(item.title, describeChange(change))}${blocked ? ` ${t.notAllowed}` : ''}`

  /** End a keyboard move without saving; focus follows the event back unless Tab moves it on. */
  const cancelKeyboard = (refocus = true) => {
    const item = keyboardItem.current
    keyboardItem.current = null
    setDrag(null)
    if (!item) return
    if (refocus) refocusId.current = item.id
    setAnnouncement(t.cancelled(item.title))
  }

  const onEventKeyDown: CalendarContextValue['onEventKeyDown'] = (e, shown, movable) => {
    const item = source(shown)
    const current = dragRef.current
    const lifted = current?.keyboard && keyboardItem.current?.id === item.id ? current : null
    if (!lifted) {
      if (e.key === 'Enter') {
        e.preventDefault()
        latest.current.onEventClick?.(item as T)
      } else if (e.key === ' ' && movable && canEdit(item) && view !== 'agenda') {
        e.preventDefault()
        const change = { start: item.start, end: eventEnd(item), allDay: Boolean(item.allDay) }
        keyboardItem.current = item
        setDrag({ id: item.id, change, blocked: false, keyboard: true })
        setAnnouncement(t.pickedUp(item.title, describeChange(change)))
      }
      return
    }
    if (e.key === 'Tab') {
      cancelKeyboard(false)
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      cancelKeyboard()
      return
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      keyboardItem.current = null
      setDrag(null)
      if (lifted.blocked) {
        refocusId.current = item.id
        setAnnouncement(`${t.notAllowed} ${t.cancelled(item.title)}`)
        return
      }
      const original = { start: item.start, end: eventEnd(item), allDay: Boolean(item.allDay) }
      if (!sameChange(lifted.change, original)) {
        refocusId.current = item.id
        latest.current.onEventChange?.({ event: item as T, ...lifted.change })
      }
      setAnnouncement(t.dropped(item.title, describeChange(lifted.change)))
      return
    }
    const rtl = rootRef.current ? getComputedStyle(rootRef.current).direction === 'rtl' : false
    const { start, end, allDay } = lifted.change
    const inGrid =
      (view === 'week' || view === 'day') && !isSpanning({ ...item, start, end, allDay })
    let next: Change | null = null
    const days = (n: number) => ({ start: shiftDays(start, n), end: shiftDays(end, n), allDay })
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      next = days((e.key === 'ArrowRight') !== rtl ? 1 : -1)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const sign = e.key === 'ArrowDown' ? 1 : -1
      if (e.shiftKey) {
        // Change the length: by a step in the time grid, by a day for bars.
        if (inGrid) {
          const stop = addMinutes(end, sign * step)
          if (stop >= addMinutes(start, step)) next = { start, end: stop, allDay }
        } else {
          const stop = shiftDays(end, sign)
          if (stop > start) next = { start, end: stop, allDay }
        }
      } else if (view === 'month') {
        next = days(7 * sign)
      } else if (inGrid) {
        next = { start: addMinutes(start, sign * step), end: addMinutes(end, sign * step), allDay }
      }
    }
    if (!next) return
    e.preventDefault()
    // In the time grid the event stays within the hours shown, where it can be seen.
    if (inGrid) {
      const startsAt = minutesOfDay(next.start)
      if (startsAt < dayStartHour * 60 || startsAt >= dayEndHour * 60) return
    }
    const blocked = isBlocked(item, next)
    setDrag({ id: item.id, change: next, blocked, keyboard: true })
    setAnnouncement(announceMove(item, next, blocked))
    // Follow the event once it has left the days on screen.
    const { first, last } = eventDays({ ...item, ...next })
    if (last < range.start) setDate(last)
    else if (first >= range.end) setDate(first)
  }

  // A click anywhere ends a keyboard move.
  const keyboardActive = drag?.keyboard ?? false
  React.useEffect(() => {
    if (!keyboardActive) return
    const onPointerDown = () => {
      if (!keyboardItem.current) return
      keyboardItem.current = null
      setDrag(null)
    }
    // Escape ends the move only — Radix layers around the calendar (Dialog, Popover) listen on
    // the document in the capture phase and skip default-prevented events.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') event.preventDefault()
    }
    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [keyboardActive])

  // Keep focus on the event while it moves between rows and columns (it remounts there), and once
  // the app has saved the move.
  React.useLayoutEffect(() => {
    const id = drag?.keyboard ? drag.id : refocusId.current
    if (!id) return
    const el = rootRef.current?.querySelector<HTMLElement>(
      `[data-ec-event="${id.replace(/["\\]/g, '\\$&')}"][data-ec-primary]`,
    )
    if (!el) return
    if (!drag) refocusId.current = null
    if (document.activeElement !== el) el.focus({ preventScroll: false })
  })

  /* Rendering ----------------------------------------------------------------------------------- */
  const displayEvents = React.useMemo(() => {
    const list: CalendarEvent[] = drag
      ? events.map((event) => (event.id === drag.id ? { ...event, ...drag.change } : event))
      : events
    return list.filter((event) => {
      const { first, last } = eventDays(event)
      return first < range.end && last >= range.start
    })
  }, [events, drag, range])

  const timeLabel: CalendarContextValue['timeLabel'] = (event, variant) => {
    if (event.allDay) return ''
    const end = eventEnd(event)
    if (variant === 'block' && end > event.start)
      return `${formatTime(event.start)} – ${formatTime(end)}`
    return formatTime(event.start)
  }

  const contextValue: CalendarContextValue = {
    view,
    locale,
    hourCycle,
    t,
    today,
    now,
    hourHeight,
    dayStartHour,
    dayEndHour,
    minEventMinutes: Math.max(15, Math.ceil((20 / hourHeight) * 60)),
    renderEvent: renderEvent as CalendarContextValue['renderEvent'],
    canEdit,
    canSelect: Boolean(onSelectRange),
    dragId: drag?.id ?? null,
    dragBlocked: drag?.blocked ?? false,
    keyboardDrag: drag?.keyboard ?? false,
    selection,
    instructionsId,
    formatTime,
    timeLabel,
    describe: (event) =>
      `${event.title}, ${describeChange({ start: event.start, end: eventEnd(event), allDay: Boolean(event.allDay) })}`,
    onEventPointerDown,
    onEventKeyDown,
    onEventClick: onEventClickInternal,
    onSlotPointerDown,
    onSelectDays: selectDays,
    showDay,
  }

  const toolbarApi: EventCalendarToolbarApi = {
    title,
    view,
    views,
    date,
    setView,
    goToday: () => setDate(today),
    goPrevious: () => move(-1),
    goNext: () => move(1),
    labels: t,
  }

  return (
    <CalendarContext value={contextValue}>
      <div
        ref={mergedRef}
        data-slot="event-calendar"
        data-view={view}
        aria-label={ariaLabel ?? t.calendar}
        role="region"
        className={cn(
          'flex h-[40rem] min-h-0 flex-col overflow-hidden rounded-xl border bg-background text-sm',
          className,
        )}
        {...props}
      >
        {renderToolbar ? (
          renderToolbar(toolbarApi)
        ) : (
          <Toolbar api={toolbarApi} actions={toolbarActions} />
        )}
        {view === 'month' && (
          <MonthView
            month={startOfMonth(date)}
            weeks={range.weeks}
            events={displayEvents}
            maxEventsPerDay={maxEventsPerDay}
            dayLabel={dayLabel}
            onDateChange={setDate}
          />
        )}
        {(view === 'week' || view === 'day') && (
          <TimeGridView
            days={range.days}
            events={displayEvents}
            maxAllDayEvents={maxAllDayEvents}
            scrollToHour={scrollToHour}
            scrollRef={scrollRef}
            dayLabel={dayLabel}
            hourLabel={hourLabel}
          />
        )}
        {view === 'agenda' && (
          <AgendaView
            days={range.days}
            events={displayEvents}
            formatTime={formatTime}
            formats={formats}
            dayLabel={dayLabel}
          />
        )}
        {onEventChange && (
          <span id={instructionsId} className="sr-only">
            {t.instructions}
          </span>
        )}
        <div aria-live="assertive" aria-atomic className="sr-only">
          {announcement}
        </div>
      </div>
    </CalendarContext>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Toolbar
 * -----------------------------------------------------------------------------------------------*/

function Toolbar({ api, actions }: { api: EventCalendarToolbarApi; actions?: React.ReactNode }) {
  const { labels: t } = api
  return (
    <div
      data-slot="event-calendar-toolbar"
      className="flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2"
    >
      <Button variant="outline" size="sm" onClick={api.goToday}>
        {t.today}
      </Button>
      <div className="flex items-center">
        <IconButton size="sm" aria-label={t.previous} onClick={api.goPrevious}>
          <ChevronLeftIcon className="rtl:rotate-180" />
        </IconButton>
        <IconButton size="sm" aria-label={t.next} onClick={api.goNext}>
          <ChevronRightIcon className="rtl:rotate-180" />
        </IconButton>
      </div>
      <h2 aria-live="polite" className="me-auto text-base font-semibold tracking-tight">
        {api.title}
      </h2>
      {api.views.length > 1 && (
        <ToggleGroup
          type="single"
          variant="segmented"
          size="sm"
          aria-label={t.views}
          value={api.view}
          onValueChange={(value) => value && api.setView(value as EventCalendarView)}
          className="rounded-lg bg-muted p-0.5"
        >
          {api.views.map((v) => (
            <ToggleGroupItem key={v} value={v}>
              {t[v]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
      {actions}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Agenda
 * -----------------------------------------------------------------------------------------------*/

function AgendaView({
  days,
  events,
  formatTime,
  formats,
  dayLabel,
}: {
  days: Date[]
  events: CalendarEvent[]
  formatTime: (date: Date) => string
  formats: { weekdayShort: Intl.DateTimeFormat; monthShort: Intl.DateTimeFormat }
  dayLabel: (day: Date) => string
}) {
  const ctx = React.useContext(CalendarContext)!
  const groups = days
    .map((day) => ({ day, items: events.filter((e) => coversDay(e, day)).sort(compareEvents) }))
    .filter((group) => group.items.length > 0)

  if (groups.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
        {ctx.t.noEvents}
      </div>
    )
  }
  return (
    <div
      data-slot="event-calendar-agenda"
      // Sized by the calendar, not the window: rows adapt to a narrow panel on a wide screen.
      className="@container/agenda min-h-0 flex-1 overflow-y-auto"
    >
      {groups.map(({ day, items }) => {
        const today = isSameDay(day, ctx.today)
        return (
          <section
            key={dayKey(day)}
            aria-label={dayLabel(day)}
            className="flex gap-3 border-b px-3 py-2.5 last:border-b-0 @md/agenda:gap-5 @md/agenda:px-4"
          >
            <div aria-hidden className="w-12 shrink-0 pt-1 @md/agenda:w-16">
              <div
                className={cn(
                  'text-2xl leading-none font-semibold tabular-nums',
                  today && 'text-primary',
                )}
              >
                {day.getDate()}
              </div>
              <div className="mt-1 text-xs text-muted-foreground uppercase">
                {formats.weekdayShort.format(day)}, {formats.monthShort.format(day)}
              </div>
            </div>
            <ul className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-0.5">
              {items.map((event) => (
                <li key={event.id}>
                  <EventChip
                    event={event}
                    variant="agenda"
                    movable={false}
                    timeLabel={agendaTimeLabel(
                      event,
                      day,
                      eventEnd(event),
                      formatTime,
                      ctx.t.allDay,
                    )}
                  />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
