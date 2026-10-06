import * as React from 'react'
import { cn } from '../../lib/cn'
import {
  addDays,
  dayKey,
  isSameDay,
  isSameMonth,
  minutesOfDay,
  startOfDay,
  weekdayColumnLabels,
} from '../../lib/date'
import type { Tone } from '../../lib/tones'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { useCalendarContext, type CalendarEvent, type EventRenderContext } from './calendar-context'
import { eventDays, isSpanning, layoutDay, layoutRow, type RowLayout } from './calendar-layout'

/** Height of one event line in a row of days (20px bar + 2px gap). */
export const LANE_HEIGHT = 22
/** Space for the day number at the top of a month cell. */
export const MONTH_HEAD = 28
/** Days narrower than this (px) drop event times and shorten "+N more" to "+N". */
const NARROW_DAY = 90

const toneColor: Record<Tone, string> = {
  neutral: 'var(--color-muted-foreground)',
  primary: 'var(--color-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-destructive)',
  info: 'var(--color-info)',
}

export function eventColor(event: CalendarEvent) {
  return event.color ?? toneColor[event.tone ?? 'primary']
}

/* -------------------------------------------------------------------------------------------------
 * EventChip: one event (or one piece of a multi-day event)
 * -----------------------------------------------------------------------------------------------*/

export interface EventChipProps {
  event: CalendarEvent
  variant: EventRenderContext['variant']
  continuesBefore?: boolean
  continuesAfter?: boolean
  /** The piece that takes focus and is announced; continuation pieces are only drawn. */
  primary?: boolean
  /** Can be picked up here (not in the agenda or a "+N more" list). */
  movable?: boolean
  /** Overrides the default time label (agenda rows). */
  timeLabel?: string
  /** Short time-grid block (title and start time on one line), or a narrow month day (no time). */
  compact?: boolean
  style?: React.CSSProperties
  className?: string
}

const chipBase =
  // --event-text must be computed where --event-color is set.
  '[--event-text:color-mix(in_oklab,var(--event-color)_72%,var(--color-foreground))] group/event relative flex min-w-0 cursor-pointer items-center gap-1.5 overflow-hidden text-xs outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-[3px] focus-visible:ring-ring/50'

const chipVariant: Record<EventRenderContext['variant'], string> = {
  bar: 'h-5 rounded-[5px] bg-(color:--event-color)/15 px-1.5 font-medium text-(color:--event-text) hover:bg-(color:--event-color)/25 dark:bg-(color:--event-color)/25 dark:hover:bg-(color:--event-color)/35',
  dot: 'h-5 rounded-[5px] px-1.5 text-foreground hover:bg-accent',
  block:
    'flex-col items-stretch gap-0 rounded-md border-s-[3px] border-(color:--event-color) bg-(color:--event-color)/15 px-1.5 py-0.5 text-(color:--event-text) shadow-[0_0_0_1px_var(--color-background)] hover:bg-(color:--event-color)/25 dark:bg-(color:--event-color)/25 dark:hover:bg-(color:--event-color)/35',
  agenda:
    'min-h-8 flex-wrap gap-y-0.5 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent @md/agenda:flex-nowrap',
}

export function EventChip({
  event,
  variant,
  continuesBefore = false,
  continuesAfter = false,
  primary = true,
  movable = true,
  timeLabel: timeLabelProp,
  compact = false,
  style,
  className,
}: EventChipProps) {
  const ctx = useCalendarContext()
  const editable = movable && ctx.canEdit(event)
  const dragging = ctx.dragId === event.id && movable
  // Short blocks only have room for the start time; narrow month days for none.
  const timeLabel =
    timeLabelProp ??
    (compact && (variant === 'dot' || variant === 'bar')
      ? ''
      : ctx.timeLabel(event, variant === 'block' && compact ? 'dot' : variant))
  const context: EventRenderContext = {
    view: ctx.view,
    variant,
    timeLabel,
    continuesBefore,
    continuesAfter,
    dragging,
  }

  let content: React.ReactNode
  if (ctx.renderEvent) {
    content = ctx.renderEvent(event, context)
  } else if (variant === 'dot') {
    content = (
      <>
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-(color:--event-color)" />
        {timeLabel && (
          <span className="shrink-0 text-muted-foreground tabular-nums">{timeLabel}</span>
        )}
        <span className="truncate">{event.title}</span>
      </>
    )
  } else if (variant === 'block') {
    content = compact ? (
      <span className="truncate leading-4">
        <span className="font-medium">{event.title}</span>
        {timeLabel && <span className="tabular-nums opacity-75">, {timeLabel}</span>}
      </span>
    ) : (
      <>
        <span className="line-clamp-2 leading-4 font-medium">{event.title}</span>
        {timeLabel && (
          <span className="truncate leading-4 tabular-nums opacity-75">{timeLabel}</span>
        )}
      </>
    )
  } else if (variant === 'agenda') {
    content = (
      <>
        <span className="basis-full text-xs text-muted-foreground tabular-nums @md/agenda:w-40 @md/agenda:shrink-0 @md/agenda:basis-auto @md/agenda:text-sm">
          {timeLabel}
        </span>
        <span aria-hidden className="size-2 shrink-0 rounded-full bg-(color:--event-color)" />
        <span className="min-w-0 flex-1 truncate">{event.title}</span>
      </>
    )
  } else {
    content = (
      <>
        {timeLabel && !continuesBefore && (
          <span className="shrink-0 font-normal tabular-nums opacity-75">{timeLabel}</span>
        )}
        <span className="truncate">{event.title}</span>
      </>
    )
  }

  const resizable = editable && !continuesAfter && (variant === 'block' || variant === 'bar')

  return (
    <div
      role={primary ? 'button' : undefined}
      tabIndex={primary ? 0 : undefined}
      aria-hidden={primary ? undefined : true}
      aria-label={primary ? ctx.describe(event) : undefined}
      aria-roledescription={primary && editable ? ctx.t.eventRole : undefined}
      aria-describedby={primary && editable ? ctx.instructionsId : undefined}
      data-slot="event-calendar-event"
      data-ec-event={event.id}
      data-ec-primary={primary || undefined}
      data-variant={variant}
      data-dragging={dragging || undefined}
      data-blocked={(dragging && ctx.dragBlocked) || undefined}
      style={{ ...style, '--event-color': eventColor(event) } as React.CSSProperties}
      className={cn(
        chipBase,
        chipVariant[variant],
        variant === 'bar' && continuesBefore && 'rounded-s-none',
        variant === 'bar' && continuesAfter && 'rounded-e-none',
        editable && 'touch-manipulation',
        dragging && 'z-20 shadow-lg ring-1 ring-(color:--event-color)/50',
        dragging && !ctx.keyboardDrag && 'cursor-grabbing',
        dragging && ctx.keyboardDrag && 'ring-2 ring-ring',
        dragging && ctx.dragBlocked && 'opacity-60 ring-2 ring-destructive/70',
        className,
      )}
      onPointerDown={(e) => {
        if (editable) ctx.onEventPointerDown(e, event, 'move')
        else e.stopPropagation()
      }}
      onClick={(e) => ctx.onEventClick(e, event)}
      onKeyDown={primary ? (e) => ctx.onEventKeyDown(e, event, editable) : undefined}
    >
      {content}
      {resizable && (
        <span
          aria-hidden
          data-ec-resize=""
          className={cn(
            'absolute',
            variant === 'block'
              ? 'inset-x-0 bottom-0 h-2 cursor-ns-resize'
              : 'inset-y-0 end-0 w-2 cursor-ew-resize',
          )}
          onPointerDown={(e) => {
            e.stopPropagation()
            ctx.onEventPointerDown(e, event, 'resize')
          }}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * DayRow: a month week or the all-day lane — cells with bars stacked into lanes
 * -----------------------------------------------------------------------------------------------*/

interface DayRowProps {
  days: Date[]
  layout: RowLayout<CalendarEvent>
  /** Lanes drawn; anything below is counted in a "+N" button. */
  visibleLanes: number
  kind: 'month' | 'allDay'
  /** The view's first row: pieces of events that began earlier take focus here. */
  firstRow?: boolean
  /** Narrow days: titles only, "+N" instead of "+N more". */
  narrow?: boolean
  /** Month being shown: days outside it are dimmed. */
  month?: Date
  focusDay?: Date
  onCellKeyDown?: (event: React.KeyboardEvent<HTMLElement>, day: Date) => void
  dayLabel: (day: Date) => string
  className?: string
  style?: React.CSSProperties
}

export function DayRow({
  days,
  layout,
  visibleLanes,
  kind,
  firstRow = true,
  narrow = false,
  month,
  focusDay,
  onCellKeyDown,
  dayLabel,
  className,
  style,
}: DayRowProps) {
  const ctx = useCalendarContext()
  const head = kind === 'month' ? MONTH_HEAD : 2
  const selection = ctx.selection?.kind === 'days' ? ctx.selection : null

  return (
    <div
      role={kind === 'month' ? 'row' : undefined}
      className={cn('grid', className)}
      style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`, ...style }}
    >
      {days.map((day, col) => {
        const key = dayKey(day)
        const today = isSameDay(day, ctx.today)
        const outside = month !== undefined && !isSameMonth(day, month)
        const selected =
          selection !== null &&
          startOfDay(day) >= (selection.from < selection.to ? selection.from : selection.to) &&
          startOfDay(day) <= (selection.from < selection.to ? selection.to : selection.from)
        // The event being moved is always drawn, even in a full day.
        const segments = layout.segments.filter(
          (s) => s.startCol === col && (s.lane < visibleLanes || s.event.id === ctx.dragId),
        )
        const shown = layout.segments.filter(
          (s) => s.lane < visibleLanes && s.startCol <= col && col <= s.endCol,
        ).length
        const hidden = layout.perDay[col].length - shown
        const focusable = kind === 'month' && focusDay !== undefined
        return (
          <div
            key={key}
            role={kind === 'month' ? 'gridcell' : undefined}
            data-ec-day={key}
            data-ec-lane={kind}
            data-today={today || undefined}
            data-outside={outside || undefined}
            tabIndex={focusable ? (isSameDay(day, focusDay) ? 0 : -1) : undefined}
            aria-selected={kind === 'month' ? selected || undefined : undefined}
            onPointerDown={ctx.onSlotPointerDown}
            onKeyDown={onCellKeyDown ? (e) => onCellKeyDown(e, day) : undefined}
            className={cn(
              'relative min-w-0 border-e outline-none last:border-e-0',
              kind === 'month' &&
                'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset',
              outside && 'bg-muted/40',
              selected && 'bg-primary/10',
            )}
          >
            <span className="sr-only">{dayLabel(day)}</span>
            {kind === 'month' && (
              <div aria-hidden className="flex h-7 items-center px-1.5">
                {ctx.showDay ? (
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => ctx.showDay?.(day)}
                    className={cn(
                      'inline-flex size-6 items-center justify-center rounded-full text-xs font-medium tabular-nums transition-colors',
                      today
                        ? 'bg-primary text-primary-foreground'
                        : cn('hover:bg-accent', outside && 'text-muted-foreground'),
                    )}
                  >
                    {day.getDate()}
                  </button>
                ) : (
                  <span
                    className={cn(
                      'inline-flex size-6 items-center justify-center rounded-full text-xs font-medium tabular-nums',
                      today
                        ? 'bg-primary text-primary-foreground'
                        : outside && 'text-muted-foreground',
                    )}
                  >
                    {day.getDate()}
                  </span>
                )}
              </div>
            )}
            {segments.map((segment) => {
              const span = segment.endCol - segment.startCol + 1
              const { first, last } = eventDays(segment.event)
              const bar = isSpanning(segment.event) || first.getTime() !== last.getTime()
              return (
                <EventChip
                  key={segment.event.id}
                  event={segment.event}
                  variant={bar ? 'bar' : 'dot'}
                  continuesBefore={segment.continuesBefore}
                  continuesAfter={segment.continuesAfter}
                  primary={!segment.continuesBefore || firstRow}
                  compact={narrow}
                  className="absolute z-[1]"
                  style={{
                    top: head + segment.lane * LANE_HEIGHT,
                    insetInlineStart: 2,
                    width: `calc(${span} * 100% + ${span - 1}px - 4px)`,
                  }}
                />
              )
            })}
            {hidden > 0 && (
              <MoreEvents
                day={day}
                events={layout.perDay[col]}
                count={hidden}
                short={narrow}
                label={dayLabel(day)}
                style={{ top: head + visibleLanes * LANE_HEIGHT }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function MoreEvents({
  day,
  events,
  count,
  short,
  label,
  style,
}: {
  day: Date
  events: CalendarEvent[]
  count: number
  short: boolean
  label: string
  style: React.CSSProperties
}) {
  const ctx = useCalendarContext()
  const weekday = new Intl.DateTimeFormat(ctx.locale, { weekday: 'short' }).format(day)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="event-calendar-more"
          aria-label={short ? ctx.t.more(count) : undefined}
          className="absolute z-[1] inline-flex h-5 max-w-[calc(100%-4px)] items-center overflow-hidden rounded-[5px] px-1.5 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          style={{ ...style, insetInlineStart: 2 }}
        >
          {short ? `+${count}` : ctx.t.more(count)}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" aria-label={label} className="w-64 p-2">
        <div aria-hidden className="mb-1 flex items-baseline gap-1.5 px-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase">{weekday}</span>
          <span className="text-lg font-semibold tabular-nums">{day.getDate()}</span>
        </div>
        <div className="grid gap-0.5">
          {events.map((event) => {
            const { first, last } = eventDays(event)
            const bar = isSpanning(event) || first.getTime() !== last.getTime()
            return (
              <EventChip
                key={event.id}
                event={event}
                variant={bar ? 'bar' : 'dot'}
                continuesBefore={first < startOfDay(day)}
                continuesAfter={last > startOfDay(day)}
                movable={false}
              />
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Overflow rule shared by month rows and the all-day lane. */
export function visibleLaneCount(lanes: number, slots: number, reserveMore: boolean) {
  if (lanes <= slots) return lanes
  return reserveMore ? slots : Math.max(0, slots - 1)
}

/* -------------------------------------------------------------------------------------------------
 * MonthView
 * -----------------------------------------------------------------------------------------------*/

interface MonthViewProps {
  month: Date
  weeks: Date[][]
  events: CalendarEvent[]
  maxEventsPerDay?: number
  dayLabel: (day: Date) => string
  /** Keyboard focus moved to a day outside the shown month. */
  onDateChange: (date: Date) => void
}

export function MonthView({
  month,
  weeks,
  events,
  maxEventsPerDay,
  dayLabel,
  onDateChange,
}: MonthViewProps) {
  const ctx = useCalendarContext()
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const [measured, setMeasured] = React.useState<number | null>(null)
  const [narrow, setNarrow] = React.useState(false)
  const [focusDay, setFocusDay] = React.useState(() =>
    isSameMonth(ctx.today, month) ? ctx.today : month,
  )
  const shouldFocus = React.useRef(false)
  const visibleFocusDay = weeks.some((week) => week.some((d) => isSameDay(d, focusDay)))
    ? focusDay
    : month

  // Lanes that fit in a week row (unless the app fixed the number of events per day), and whether
  // the days are too narrow for times and "+N more".
  React.useLayoutEffect(() => {
    const row = bodyRef.current?.firstElementChild
    if (!row || typeof ResizeObserver === 'undefined') return
    const update = () => {
      const { width, height } = row.getBoundingClientRect()
      if (width > 0) setNarrow(width / weeks[0].length < NARROW_DAY)
      if (height > 0 && maxEventsPerDay === undefined) {
        setMeasured(Math.max(1, Math.floor((height - MONTH_HEAD - 2) / LANE_HEIGHT)))
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(row)
    return () => observer.disconnect()
  }, [maxEventsPerDay, weeks])

  React.useEffect(() => {
    if (!shouldFocus.current) return
    shouldFocus.current = false
    bodyRef.current
      ?.querySelector<HTMLElement>(`[data-ec-day="${dayKey(visibleFocusDay)}"]`)
      ?.focus()
  })

  const slots = maxEventsPerDay ?? measured ?? 3
  const weekdayFormat = new Intl.DateTimeFormat(ctx.locale, { weekday: 'short' })
  const narrowWeekdays = weekdayColumnLabels(weeks[0], ctx.locale)

  const onCellKeyDown = (event: React.KeyboardEvent<HTMLElement>, day: Date) => {
    if (event.target !== event.currentTarget) return
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'
    const moves: Record<string, number> = {
      ArrowLeft: rtl ? 1 : -1,
      ArrowRight: rtl ? -1 : 1,
      ArrowUp: -7,
      ArrowDown: 7,
    }
    let next: Date | null = null
    if (event.key in moves) next = addDays(day, moves[event.key])
    else if (event.key === 'Home')
      next = addDays(day, -weeks[0].findIndex((d) => d.getDay() === day.getDay()))
    else if (event.key === 'End')
      next = addDays(day, 6 - weeks[0].findIndex((d) => d.getDay() === day.getDay()))
    else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const target = new Date(
        day.getFullYear(),
        day.getMonth() + (event.key === 'PageUp' ? -1 : 1),
        1,
      )
      const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
      next = new Date(target.getFullYear(), target.getMonth(), Math.min(day.getDate(), lastDay))
    } else if ((event.key === 'Enter' || event.key === ' ') && ctx.canSelect) {
      event.preventDefault()
      ctx.onSelectDays(day, day)
      return
    }
    if (!next) return
    event.preventDefault()
    setFocusDay(next)
    shouldFocus.current = true
    if (!isSameMonth(next, month)) onDateChange(next)
  }

  return (
    <div
      role="grid"
      aria-readonly={!ctx.canSelect || undefined}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div
        role="row"
        className="grid shrink-0 border-b"
        style={{ gridTemplateColumns: `repeat(${weeks[0].length}, minmax(0, 1fr))` }}
      >
        {weeks[0].map((day) => (
          <div
            key={day.getDay()}
            role="columnheader"
            aria-label={new Intl.DateTimeFormat(ctx.locale, { weekday: 'long' }).format(day)}
            className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
          >
            {narrow ? narrowWeekdays[day.getDay()] : weekdayFormat.format(day)}
          </div>
        ))}
      </div>
      <div
        ref={bodyRef}
        className="grid min-h-0 flex-1"
        style={{ gridTemplateRows: `repeat(${weeks.length}, minmax(0, 1fr))` }}
      >
        {weeks.map((week, index) => {
          const layout = layoutRow(events, week, ctx.dragId)
          return (
            <DayRow
              key={dayKey(week[0])}
              kind="month"
              firstRow={index === 0}
              days={week}
              month={month}
              layout={layout}
              visibleLanes={visibleLaneCount(layout.lanes, slots, maxEventsPerDay !== undefined)}
              narrow={narrow}
              focusDay={visibleFocusDay}
              onCellKeyDown={onCellKeyDown}
              dayLabel={dayLabel}
              className="border-b last:border-b-0"
              style={{
                minHeight:
                  maxEventsPerDay !== undefined
                    ? MONTH_HEAD + (maxEventsPerDay + 1) * LANE_HEIGHT + 4
                    : MONTH_HEAD + 3 * LANE_HEIGHT + 4,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * TimeGridView: week and day
 * -----------------------------------------------------------------------------------------------*/

interface TimeGridViewProps {
  days: Date[]
  events: CalendarEvent[]
  maxAllDayEvents: number
  scrollToHour: number
  scrollRef: React.RefObject<HTMLDivElement | null>
  dayLabel: (day: Date) => string
  hourLabel: (hour: number) => string
}

/** Day columns narrower than this (px) stack their headers and slim the hour gutter. */
const NARROW_COLUMN = 80

export function TimeGridView({
  days,
  events,
  maxAllDayEvents,
  scrollToHour,
  scrollRef,
  dayLabel,
  hourLabel,
}: TimeGridViewProps) {
  const ctx = useCalendarContext()
  const { hourHeight, dayStartHour, dayEndHour } = ctx
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [narrow, setNarrow] = React.useState(false)
  React.useLayoutEffect(() => {
    const el = rootRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const update = () => {
      const width = el.getBoundingClientRect().width
      if (width > 0) setNarrow((width - 56) / days.length < NARROW_COLUMN)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [days.length])
  const gutter = narrow ? 'w-10' : 'w-14'
  const hours = dayEndHour - dayStartHour
  const gridStart = dayStartHour * 60
  const gridEnd = dayEndHour * 60
  const columns = { gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }

  React.useLayoutEffect(() => {
    const el = scrollRef.current
    // A little above the hour, so its label isn't cut off by the headers.
    if (el) el.scrollTop = Math.max(0, (scrollToHour - dayStartHour) * hourHeight - 12)
  }, [scrollRef, scrollToHour, dayStartHour, hourHeight])

  const spanning = events.filter(isSpanning)
  const allDay = layoutRow(spanning, days, ctx.dragId)
  const allDayLanes = visibleLaneCount(allDay.lanes, maxAllDayEvents, false)
  const weekdayFormat = new Intl.DateTimeFormat(ctx.locale, { weekday: 'short' })
  const narrowWeekdays = weekdayColumnLabels(days, ctx.locale)
  const selection = ctx.selection?.kind === 'time' ? ctx.selection : null
  const y = (minutes: number) => ((minutes - gridStart) / 60) * hourHeight

  return (
    <div ref={rootRef} data-narrow={narrow || undefined} className="flex min-h-0 flex-1 flex-col">
      {/* Day headers and the all-day lane; the stable gutter keeps columns aligned with the grid. */}
      <div className="flex shrink-0 [scrollbar-gutter:stable] overflow-hidden border-b">
        <div className={cn(gutter, 'shrink-0')} />
        <div className="grid flex-1" style={columns}>
          {days.map((day) => {
            const today = isSameDay(day, ctx.today)
            const inner = (
              <>
                <span
                  className={cn(
                    'font-medium text-muted-foreground',
                    narrow ? 'text-[11px] leading-4' : 'text-xs',
                  )}
                >
                  {narrow ? narrowWeekdays[day.getDay()] : weekdayFormat.format(day)}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center justify-center rounded-full font-semibold tabular-nums',
                    narrow ? 'size-6 text-sm' : 'size-7 text-base',
                    today && 'bg-primary text-primary-foreground',
                  )}
                >
                  {day.getDate()}
                </span>
              </>
            )
            return ctx.showDay && ctx.view !== 'day' ? (
              <button
                key={dayKey(day)}
                type="button"
                aria-label={dayLabel(day)}
                aria-current={today ? 'date' : undefined}
                onClick={() => ctx.showDay?.(day)}
                className={cn(
                  'flex min-w-0 items-center justify-center border-s transition-colors outline-none hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset',
                  narrow ? 'flex-col py-1' : 'gap-1.5 py-1.5',
                )}
              >
                {inner}
              </button>
            ) : (
              <div
                key={dayKey(day)}
                aria-label={dayLabel(day)}
                aria-current={today ? 'date' : undefined}
                className={cn(
                  'flex min-w-0 items-center justify-center border-s',
                  narrow ? 'flex-col py-1' : 'gap-1.5 py-1.5',
                )}
              >
                {inner}
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex shrink-0 [scrollbar-gutter:stable] overflow-hidden border-b">
        <div
          className={cn(
            'flex shrink-0 items-start justify-end pt-1 text-end text-muted-foreground',
            gutter,
            narrow ? 'pe-1 text-[10px] leading-3' : 'pe-2 text-[11px] leading-4',
          )}
        >
          {ctx.t.allDay}
        </div>
        <DayRow
          kind="allDay"
          days={days}
          layout={allDay}
          visibleLanes={allDayLanes}
          dayLabel={dayLabel}
          className="flex-1 [&>[data-ec-day]]:border-s [&>[data-ec-day]]:border-e-0"
          style={{
            minHeight:
              4 + Math.max(1, allDayLanes + (allDayLanes < allDay.lanes ? 1 : 0)) * LANE_HEIGHT,
          }}
        />
      </div>

      <div
        ref={scrollRef}
        data-slot="event-calendar-scroller"
        className="relative min-h-0 flex-1 [scrollbar-gutter:stable] overflow-y-auto"
      >
        <div className="relative flex" style={{ height: hours * hourHeight }}>
          <div aria-hidden className={cn('relative shrink-0', gutter)}>
            {Array.from({ length: hours - 1 }, (_, i) => dayStartHour + i + 1).map((hour) => (
              <span
                key={hour}
                className={cn(
                  'absolute -translate-y-1/2 leading-none whitespace-nowrap text-muted-foreground tabular-nums',
                  narrow ? 'end-1 text-[10px]' : 'end-2 text-[11px]',
                )}
                style={{ top: (hour - dayStartHour) * hourHeight }}
              >
                {hourLabel(hour)}
              </span>
            ))}
          </div>
          <div
            className="grid flex-1"
            style={{
              ...columns,
              backgroundImage:
                'linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)',
              backgroundSize: `100% ${hourHeight}px`,
            }}
          >
            {days.map((day) => {
              const key = dayKey(day)
              const today = isSameDay(day, ctx.today)
              const segments = layoutDay(events, day, ctx.minEventMinutes)
              const nowMinutes = minutesOfDay(ctx.now)
              return (
                <div
                  key={key}
                  role="group"
                  aria-label={dayLabel(day)}
                  data-ec-col={key}
                  data-today={today || undefined}
                  onPointerDown={ctx.onSlotPointerDown}
                  className={cn('relative min-w-0 border-s', today && 'bg-primary/[0.03]')}
                >
                  {selection && isSameDay(selection.day, day) && (
                    <div
                      aria-hidden
                      data-slot="event-calendar-selection"
                      className="absolute inset-x-1 rounded-md bg-primary/15 ring-1 ring-primary/40"
                      style={{
                        top: y(selection.start),
                        height: ((selection.end - selection.start) / 60) * hourHeight,
                      }}
                    />
                  )}
                  {segments.map((segment) => {
                    const drawnEnd = Math.max(segment.end, segment.start + ctx.minEventMinutes)
                    const top = Math.max(segment.start, gridStart)
                    const bottom = Math.min(drawnEnd, gridEnd)
                    if (bottom <= gridStart || top >= gridEnd) return null
                    const height = ((bottom - top) / 60) * hourHeight - 1
                    const last = segment.column + segment.span === segment.columns
                    return (
                      <EventChip
                        key={segment.event.id}
                        event={segment.event}
                        variant="block"
                        continuesBefore={segment.continuesBefore}
                        continuesAfter={segment.continuesAfter}
                        primary={!segment.continuesBefore || isSameDay(day, days[0])}
                        compact={height < 34}
                        className="absolute"
                        style={{
                          top: y(top),
                          height,
                          insetInlineStart: `calc(${(segment.column / segment.columns) * 100}% + 1px)`,
                          // Leave room on the right to click empty time — less in narrow columns.
                          width: `calc(${(segment.span / segment.columns) * 100}% - ${last && !narrow ? 8 : 2}px)`,
                        }}
                      />
                    )
                  })}
                  {today && nowMinutes >= gridStart && nowMinutes < gridEnd && (
                    <div
                      aria-hidden
                      data-slot="event-calendar-now"
                      className="pointer-events-none absolute inset-x-0 z-10 h-px bg-destructive"
                      style={{ top: y(nowMinutes) }}
                    >
                      <span className="absolute -start-1 -top-1 size-2 rounded-full bg-destructive" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Picks the agenda's time text for an event on one of its days. */
export function agendaTimeLabel(
  event: CalendarEvent,
  day: Date,
  end: Date,
  formatTime: (date: Date) => string,
  allDayLabel: string,
) {
  if (event.allDay) return allDayLabel
  const dayStart = startOfDay(day)
  const startsBefore = event.start < dayStart
  const endsAfter = end > addDays(dayStart, 1)
  if (startsBefore && endsAfter) return allDayLabel
  if (startsBefore) return `– ${formatTime(end)}`
  if (endsAfter) return `${formatTime(event.start)} –`
  if (end.getTime() === event.start.getTime()) return formatTime(event.start)
  return `${formatTime(event.start)} – ${formatTime(end)}`
}
