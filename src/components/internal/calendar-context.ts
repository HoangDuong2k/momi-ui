import * as React from 'react'
import type { MomiMessages } from '../../i18n/messages'
import type { Tone } from '../../lib/tones'

export type EventCalendarView = 'month' | 'week' | 'day' | 'agenda'

/** One event. Extend it with your own fields; callbacks hand your objects back. */
export interface CalendarEvent {
  id: string
  /** Plain text: also used for the accessible name and announcements. */
  title: string
  start: Date
  /**
   * Exclusive end, like iCalendar: an all-day event on Oct 5–7 ends at midnight on Oct 8. Without
   * it, an all-day event lasts one day and a timed one is a point in time.
   */
  end?: Date
  allDay?: boolean
  /** @default 'primary' */
  tone?: Tone
  /** Any CSS color; wins over `tone` (e.g. a user-picked calendar color). */
  color?: string
  /** `false`: can't be dragged, resized or moved with the keyboard. */
  editable?: boolean
}

export interface EventRenderContext {
  view: EventCalendarView
  /**
   * How the event is drawn: a bar across days, a line with a colored dot (a timed event in the
   * month view), a block in the time grid, or a row of the agenda.
   */
  variant: 'bar' | 'dot' | 'block' | 'agenda'
  /** The time as shown by default ("9:00 AM", "9:00 AM – 10:30 AM"), empty for all-day events. */
  timeLabel: string
  continuesBefore: boolean
  continuesAfter: boolean
  /** The copy following a drag or keyboard move. */
  dragging: boolean
}

/** What the user is dragging over: a day (month view, all-day lane) or a time on a day. */
export type CalendarTarget =
  | { kind: 'day'; day: Date; lane: 'month' | 'allDay' }
  | { kind: 'time'; day: Date; minutes: number }

export type CalendarSelection =
  { kind: 'days'; from: Date; to: Date } | { kind: 'time'; day: Date; start: number; end: number }

export interface CalendarContextValue {
  view: EventCalendarView
  locale: string | undefined
  hourCycle: 'h12' | 'h23' | undefined
  t: MomiMessages['eventCalendar']
  today: Date
  now: Date
  hourHeight: number
  dayStartHour: number
  dayEndHour: number
  /** Shortest an event is drawn in the time grid, in minutes. */
  minEventMinutes: number
  renderEvent?: (event: CalendarEvent, context: EventRenderContext) => React.ReactNode
  canEdit: (event: CalendarEvent) => boolean
  canSelect: boolean
  /** The event being moved (pointer or keyboard), whether it may go there, and how. */
  dragId: string | null
  dragBlocked: boolean
  keyboardDrag: boolean
  selection: CalendarSelection | null
  instructionsId: string
  formatTime: (date: Date) => string
  timeLabel: (event: CalendarEvent, variant: EventRenderContext['variant']) => string
  describe: (event: CalendarEvent) => string
  onEventPointerDown: (
    event: React.PointerEvent<HTMLElement>,
    item: CalendarEvent,
    mode: 'move' | 'resize',
  ) => void
  onEventKeyDown: (
    event: React.KeyboardEvent<HTMLElement>,
    item: CalendarEvent,
    movable: boolean,
  ) => void
  onEventClick: (event: React.MouseEvent<HTMLElement>, item: CalendarEvent) => void
  onSlotPointerDown: (event: React.PointerEvent<HTMLElement>) => void
  onSelectDays: (from: Date, to: Date) => void
  /** Open the day view for a day, when the calendar offers one. */
  showDay?: (day: Date) => void
}

export const CalendarContext = React.createContext<CalendarContextValue | null>(null)

export function useCalendarContext() {
  const context = React.useContext(CalendarContext)
  if (!context) throw new Error('EventCalendar parts must be used inside EventCalendar.')
  return context
}
