/** Small, dependency-free date helpers (local time, day precision). */

export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)

export const addDays = (d: Date, days: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)

/** Adds months, clamping the day (Jan 31 + 1 month → Feb 28/29). */
export function addMonths(d: Date, months: number) {
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), lastDay))
}

export const isSameDay = (a?: Date | null, b?: Date | null) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

export const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

export const compareDays = (a: Date, b: Date) => startOfDay(a).getTime() - startOfDay(b).getTime()

export function startOfWeek(d: Date, weekStartsOn: WeekStart) {
  const diff = (d.getDay() - weekStartsOn + 7) % 7
  return addDays(d, -diff)
}

/** Six weeks of days covering the month (stable height). */
export function monthGrid(month: Date, weekStartsOn: WeekStart): Date[][] {
  const start = startOfWeek(startOfMonth(month), weekStartsOn)
  return Array.from({ length: 6 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)),
  )
}

export function isBetween(day: Date, from: Date, to: Date) {
  const [a, b] = compareDays(from, to) <= 0 ? [from, to] : [to, from]
  return compareDays(day, a) > 0 && compareDays(day, b) < 0
}

const MINUTE = 60_000

export const addMinutes = (d: Date, minutes: number) => new Date(d.getTime() + minutes * MINUTE)

/** Same wall-clock time `days` later (keeps 09:00 at 09:00 across daylight-saving changes). */
export const shiftDays = (d: Date, days: number) =>
  new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate() + days,
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds(),
  )

/** Whole calendar days from `a` to `b` (daylight-saving safe). */
export const daysBetween = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000)

/** Minutes since midnight on the wall clock. */
export const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes()

/** `day` at `minutes` past midnight (1440 = the next midnight). */
export const atMinutes = (day: Date, minutes: number) =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes)

/** "2026-10-05": a stable key for a calendar day. */
export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/**
 * Weekday labels short enough for a day column, indexed by `getDay()`: the locale's narrow names
 * when they tell all seven days apart ("T2"…"CN" in Vietnamese), else the short names cut to two
 * characters when those still do ("Mo", "Tu"), else the short names as they are.
 */
export function weekdayColumnLabels(days: Date[], locale: string | undefined) {
  const names = (weekday: 'narrow' | 'short') => {
    const format = new Intl.DateTimeFormat(locale, { weekday })
    return days.map((day) => format.format(day))
  }
  const distinct = (labels: string[]) => new Set(labels).size === labels.length
  const short = names('short')
  const narrow = names('narrow')
  const cut = short.map((name) => Array.from(name).slice(0, 2).join(''))
  const labels = distinct(narrow) ? narrow : distinct(cut) ? cut : short
  const byDay: string[] = []
  days.forEach((day, i) => (byDay[day.getDay()] = labels[i]))
  return byDay
}
