import { describe, expect, it } from 'vitest'
import { addDays } from '../../lib/date'
import {
  eventDays,
  eventEnd,
  isSpanning,
  layoutDay,
  layoutRow,
  type CalendarEventLike,
} from '../internal/calendar-layout'

const at = (day: number, hour = 0, minute = 0) => new Date(2026, 9, day, hour, minute)
const ev = (id: string, start: Date, end?: Date, allDay?: boolean): CalendarEventLike => ({
  id,
  title: id,
  start,
  end,
  allDay,
})

describe('event days', () => {
  it('treats end as exclusive', () => {
    // An all-day event on Oct 5–7 ends at midnight on Oct 8.
    const trip = ev('trip', at(5), at(8), true)
    expect(eventDays(trip)).toEqual({ first: at(5), last: at(7) })
    // Without an end: one day.
    expect(eventDays(ev('day', at(5), undefined, true))).toEqual({ first: at(5), last: at(5) })
    expect(eventEnd(ev('day', at(5), undefined, true))).toEqual(at(6))
    // A timed event ending at midnight stays on its day.
    expect(eventDays(ev('late', at(5, 22), at(6)))).toEqual({ first: at(5), last: at(5) })
    // A point in time.
    expect(eventDays(ev('call', at(5, 9)))).toEqual({ first: at(5), last: at(5) })
  })

  it('spans when all-day or a day long', () => {
    expect(isSpanning(ev('a', at(5), undefined, true))).toBe(true)
    expect(isSpanning(ev('b', at(5, 9), at(6, 9)))).toBe(true)
    expect(isSpanning(ev('c', at(5, 22), at(6, 2)))).toBe(false)
  })
})

describe('layoutRow', () => {
  const week = Array.from({ length: 7 }, (_, i) => addDays(at(5), i)) // Mon 5 – Sun 11

  it('stacks overlapping bars into lanes and reuses free lanes', () => {
    const { segments, lanes, perDay } = layoutRow(
      [
        ev('long', at(5), at(9), true), // Mon–Thu
        ev('mid', at(7), at(12), true), // Wed–Sun
        ev('fri', at(9, 10), at(9, 11)), // Fri, timed
        ev('mon', at(5, 9), at(5, 10)), // Mon, timed
      ],
      week,
    )
    const byId = Object.fromEntries(segments.map((s) => [s.event.id, s]))
    expect(byId.long).toMatchObject({ startCol: 0, endCol: 3, lane: 0 })
    expect(byId.mid).toMatchObject({ startCol: 2, endCol: 6, lane: 1 })
    // Single-day events come after bars starting the same day, then take the first free lane.
    expect(byId.mon).toMatchObject({ startCol: 0, endCol: 0, lane: 1 })
    expect(byId.fri).toMatchObject({ startCol: 4, endCol: 4, lane: 0 })
    expect(lanes).toBe(2)
    expect(perDay[0].map((e) => e.id)).toEqual(['long', 'mon'])
    expect(perDay[3].map((e) => e.id)).toEqual(['long', 'mid'])
  })

  it('clips events to the row and flags continuation', () => {
    const { segments } = layoutRow([ev('conf', at(3), at(14), true)], week)
    expect(segments[0]).toMatchObject({
      startCol: 0,
      endCol: 6,
      continuesBefore: true,
      continuesAfter: true,
    })
  })

  it('ignores events outside the row', () => {
    expect(layoutRow([ev('next', at(12), undefined, true)], week).segments).toEqual([])
  })
})

describe('layoutDay', () => {
  it('places separate events in one full-width column', () => {
    const segments = layoutDay([ev('a', at(5, 9), at(5, 10)), ev('b', at(5, 10), at(5, 11))], at(5))
    expect(segments.map((s) => [s.event.id, s.start, s.end, s.column, s.columns])).toEqual([
      ['a', 540, 600, 0, 1],
      ['b', 600, 660, 0, 1],
    ])
  })

  it('shares the width between overlapping events and widens into free columns', () => {
    const segments = layoutDay(
      [
        ev('a', at(5, 9), at(5, 12)),
        ev('b', at(5, 9), at(5, 10)),
        ev('c', at(5, 9, 30), at(5, 10, 30)),
        ev('d', at(5, 10, 30), at(5, 11)),
      ],
      at(5),
    )
    const byId = Object.fromEntries(segments.map((s) => [s.event.id, s]))
    expect(byId.a).toMatchObject({ column: 0, columns: 3, span: 1 })
    expect(byId.b).toMatchObject({ column: 1, columns: 3, span: 1 })
    expect(byId.c).toMatchObject({ column: 2, columns: 3, span: 1 })
    // Starts after b and c end: back in column 1, widening over the free column 2.
    expect(byId.d).toMatchObject({ column: 1, columns: 3, span: 2 })
  })

  it('splits events across midnight and skips spanning ones', () => {
    const late = ev('late', at(5, 22), at(6, 2))
    expect(layoutDay([late], at(5))[0]).toMatchObject({
      start: 1320,
      end: 1440,
      continuesAfter: true,
    })
    expect(layoutDay([late], at(6))[0]).toMatchObject({ start: 0, end: 120, continuesBefore: true })
    expect(layoutDay([ev('trip', at(5), at(7), true)], at(5))).toEqual([])
  })

  it('draws point events with a minimum height and keeps midnight ones on their day', () => {
    const segments = layoutDay(
      [ev('call', at(5, 9)), ev('ping', at(5, 9, 10)), ev('midnight', at(5, 0))],
      at(5),
      30,
    )
    const byId = Object.fromEntries(segments.map((s) => [s.event.id, s]))
    expect(byId.midnight).toMatchObject({ start: 0, end: 0 })
    // 9:00 is drawn until 9:30, so 9:10 overlaps it.
    expect(byId.call).toMatchObject({ column: 0, columns: 2 })
    expect(byId.ping).toMatchObject({ column: 1, columns: 2 })
    expect(layoutDay([ev('prev', at(4, 22), at(5))], at(5))).toEqual([])
  })
})
