/**
 * Pure layout for EventCalendar: which events cover which days, how bars stack into lanes in a
 * row of days, and how overlapping timed events share a day column.
 */
import { addDays, daysBetween, minutesOfDay, startOfDay } from '../../lib/date'

export interface CalendarEventLike {
  id: string
  title: string
  start: Date
  end?: Date
  allDay?: boolean
}

const DAY_MS = 86_400_000

/**
 * Exclusive end of an event: its `end` when after `start`; otherwise the next midnight for all-day
 * events and `start` itself (a point in time) for timed ones.
 */
export function eventEnd(event: CalendarEventLike): Date {
  if (event.end && event.end > event.start) return event.end
  return event.allDay ? addDays(startOfDay(event.start), 1) : event.start
}

/** First and last calendar day an event covers. */
export function eventDays(event: CalendarEventLike): { first: Date; last: Date } {
  const first = startOfDay(event.start)
  const end = eventEnd(event)
  if (end <= event.start) return { first, last: first }
  const last = startOfDay(new Date(end.getTime() - 1))
  return { first, last: last < first ? first : last }
}

/**
 * Drawn as a bar across days (month rows, the all-day lane) rather than as a block in the time
 * grid: all-day events and timed ones lasting a day or more.
 */
export function isSpanning(event: CalendarEventLike) {
  return Boolean(event.allDay) || eventEnd(event).getTime() - event.start.getTime() >= DAY_MS
}

export function coversDay(event: CalendarEventLike, day: Date) {
  const { first, last } = eventDays(event)
  return first <= day && day <= last
}

/** Display order inside a day: bars before single-day events, longer first, then by start. */
export function compareEvents(a: CalendarEventLike, b: CalendarEventLike) {
  const da = eventDays(a)
  const db = eventDays(b)
  const spanA = daysBetween(da.first, da.last)
  const spanB = daysBetween(db.first, db.last)
  const barA = isSpanning(a) || spanA > 0
  const barB = isSpanning(b) || spanB > 0
  return (
    da.first.getTime() - db.first.getTime() ||
    Number(barB) - Number(barA) ||
    spanB - spanA ||
    Number(Boolean(b.allDay)) - Number(Boolean(a.allDay)) ||
    a.start.getTime() - b.start.getTime() ||
    a.title.localeCompare(b.title)
  )
}

/* -------------------------------------------------------------------------------------------------
 * A row of days (a month week, the all-day lane)
 * -----------------------------------------------------------------------------------------------*/

export interface RowSegment<T> {
  event: T
  /** Column of the first and last covered day in the row (inclusive). */
  startCol: number
  endCol: number
  lane: number
  /** The event started before / goes on after this row. */
  continuesBefore: boolean
  continuesAfter: boolean
}

export interface RowLayout<T> {
  segments: RowSegment<T>[]
  /** Number of lanes used. */
  lanes: number
  /** Events covering each day, in display order. */
  perDay: T[][]
}

/**
 * Stack the events covering `days` (consecutive) into lanes, first free lane first. The `first`
 * event (the one being dragged) is placed before the others, so it lands in the top lane.
 */
export function layoutRow<T extends CalendarEventLike>(
  events: T[],
  days: Date[],
  first?: string | null,
): RowLayout<T> {
  const perDay: T[][] = days.map(() => [])
  if (days.length === 0) return { segments: [], lanes: 0, perDay }
  const rowFirst = days[0]
  const rowLast = days[days.length - 1]
  const inRow = events
    .filter((event) => {
      const { first, last } = eventDays(event)
      return first <= rowLast && last >= rowFirst
    })
    .sort((a, b) => Number(b.id === first) - Number(a.id === first) || compareEvents(a, b))

  const laneEnds: number[] = [] // last occupied column per lane
  const segments: RowSegment<T>[] = []
  for (const event of inRow) {
    const { first, last } = eventDays(event)
    const startCol = Math.max(0, daysBetween(rowFirst, first))
    const endCol = Math.min(days.length - 1, daysBetween(rowFirst, last))
    let lane = laneEnds.findIndex((end) => end < startCol)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = endCol
    segments.push({
      event,
      startCol,
      endCol,
      lane,
      continuesBefore: first < rowFirst,
      continuesAfter: last > rowLast,
    })
    for (let col = startCol; col <= endCol; col++) perDay[col].push(event)
  }
  return { segments, lanes: laneEnds.length, perDay }
}

/* -------------------------------------------------------------------------------------------------
 * A day column of the time grid
 * -----------------------------------------------------------------------------------------------*/

export interface TimeSegment<T> {
  event: T
  /** Minutes past midnight, clipped to the day. */
  start: number
  end: number
  /** Column among overlapping events, how many columns they share, and how many it spans. */
  column: number
  columns: number
  span: number
  continuesBefore: boolean
  continuesAfter: boolean
}

/**
 * Lay out the timed (non-spanning) events on `day`. Overlapping events share the width: each gets
 * the first free column, then widens into free columns to its right. `minDuration` (minutes) is the
 * shortest an event is drawn, so point-in-time events still get a block.
 */
export function layoutDay<T extends CalendarEventLike>(
  events: T[],
  day: Date,
  minDuration = 0,
): TimeSegment<T>[] {
  const dayStart = startOfDay(day)
  const nextDay = addDays(dayStart, 1)
  const items = events
    .filter((event) => !isSpanning(event))
    .flatMap((event) => {
      const end = eventEnd(event)
      const point = end.getTime() === event.start.getTime()
      // Ending exactly at midnight is not on that day — unless it is a point in time at midnight.
      if (event.start >= nextDay || (point ? event.start < dayStart : end <= dayStart)) return []
      const startsBefore = event.start < dayStart
      const endsAfter = end > nextDay
      const start = startsBefore ? 0 : minutesOfDay(event.start)
      let stop = endsAfter || end.getTime() === nextDay.getTime() ? 1440 : minutesOfDay(end)
      if (stop < start) stop = 1440
      return [
        {
          event,
          start,
          end: stop,
          drawnEnd: Math.min(1440, Math.max(stop, start + minDuration)),
          continuesBefore: startsBefore,
          continuesAfter: endsAfter,
        },
      ]
    })
    .sort((a, b) => a.start - b.start || b.drawnEnd - a.drawnEnd)

  const result: TimeSegment<T>[] = []
  let cluster: (typeof items)[number][] = []
  let columnsOf: number[] = []
  let clusterEnd = -1

  const flush = () => {
    if (cluster.length === 0) return
    const columnEnds: number[] = []
    columnsOf = cluster.map((item) => {
      let column = columnEnds.findIndex((end) => end <= item.start)
      if (column === -1) column = columnEnds.length
      columnEnds[column] = item.drawnEnd
      return column
    })
    const columns = columnEnds.length
    cluster.forEach((item, i) => {
      const column = columnsOf[i]
      // Widen into the columns to the right while nothing there overlaps.
      let span = 1
      while (
        column + span < columns &&
        !cluster.some(
          (other, j) =>
            columnsOf[j] === column + span &&
            other.start < item.drawnEnd &&
            item.start < other.drawnEnd,
        )
      ) {
        span++
      }
      result.push({
        event: item.event,
        start: item.start,
        end: item.end,
        column,
        columns,
        span,
        continuesBefore: item.continuesBefore,
        continuesAfter: item.continuesAfter,
      })
    })
    cluster = []
  }

  for (const item of items) {
    if (item.start >= clusterEnd) {
      flush()
      clusterEnd = item.drawnEnd
    } else {
      clusterEnd = Math.max(clusterEnd, item.drawnEnd)
    }
    cluster.push(item)
  }
  flush()
  return result
}
