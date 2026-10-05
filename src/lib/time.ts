/** A time of day as "HH:mm" (24-hour). */
export type TimeString = string

const pad = (n: number) => String(n).padStart(2, '0')

type Meridiem = 'am' | 'pm'

/** Day-period words understood in every locale: English and Vietnamese (SA / CH). */
const COMMON_MARKERS: [string, Meridiem][] = [
  ['am', 'am'],
  ['a', 'am'],
  ['sa', 'am'],
  ['pm', 'pm'],
  ['p', 'pm'],
  ['ch', 'pm'],
]

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** "a.m.", "a. m." and "am" all match the word "a.m.": dots and spaces are optional. */
function markerPattern(word: string) {
  const letters = [...word.toLowerCase().replace(/[.\s]/g, '')]
  return letters.map(escapeRegExp).join('[.\\s]*') + '\\.?'
}

interface MarkerMatchers {
  meridiem: Meridiem
  trailing: RegExp
  leading: RegExp
}

const markerCache = new Map<string, MarkerMatchers[]>()

/**
 * Matchers for the locale's own day-period words ("오후", "下午", "ص", "ip.") before or after the
 * time, then the common ones. Words a locale uses for both halves of the day are skipped.
 */
function dayPeriodMatchers(locale: string | undefined): MarkerMatchers[] {
  const key = locale ?? ''
  const cached = markerCache.get(key)
  if (cached) return cached
  const words: Record<Meridiem, Set<string>> = { am: new Set(), pm: new Set() }
  try {
    const format = new Intl.DateTimeFormat(locale, { hour: 'numeric', hourCycle: 'h12' })
    for (let hour = 0; hour < 24; hour++) {
      const part = format
        .formatToParts(new Date(2000, 0, 1, hour))
        .find((p) => p.type === 'dayPeriod')
      if (part) words[hour < 12 ? 'am' : 'pm'].add(part.value.toLowerCase().trim())
    }
  } catch {
    // Unknown locale: the common words still work.
  }
  const ambiguous = [...words.am].filter((w) => words.pm.has(w))
  const pairs: [string, Meridiem][] = [
    ...[...words.am].map((w): [string, Meridiem] => [w, 'am']),
    ...[...words.pm].map((w): [string, Meridiem] => [w, 'pm']),
    ...COMMON_MARKERS,
  ].filter(([w]) => w && !ambiguous.includes(w))
  const matchers = (['am', 'pm'] as const).map((meridiem) => {
    const alternatives = pairs
      .filter(([, m]) => m === meridiem)
      .map(([w]) => markerPattern(w))
      .join('|')
    return {
      meridiem,
      trailing: new RegExp(`^(.*\\d.*?)\\s*(?:${alternatives})$`, 'u'),
      leading: new RegExp(`^(?:${alternatives})\\s*(.*\\d.*)$`, 'u'),
    }
  })
  markerCache.set(key, matchers)
  return matchers
}

let digitMap: Map<string, string> | null = null

/** Native digits of every numbering system Intl knows (Arabic-Indic, Devanagari…) → ASCII. */
function nativeDigits() {
  if (digitMap) return digitMap
  digitMap = new Map()
  let systems: string[] = []
  try {
    systems = Intl.supportedValuesOf('numberingSystem')
  } catch {
    // Older engines: ASCII digits only.
  }
  for (const system of systems) {
    try {
      const format = new Intl.NumberFormat(`en-u-nu-${system}`, { useGrouping: false })
      for (let digit = 0; digit <= 9; digit++) {
        const glyph = format.format(digit)
        if ([...glyph].length === 1 && glyph !== String(digit)) digitMap.set(glyph, String(digit))
      }
    } catch {
      // Not supported by this engine.
    }
  }
  return digitMap
}

/** "830", "8:30", "8h", "20.00"… without a day period, as [hour, minute]. */
function parseClock(core: string): [number, number] | null {
  let match: RegExpExecArray | null
  if ((match = /^(\d{1,2})\s*[:.h]\s*(\d{2})$/.exec(core))) {
    return [Number(match[1]), Number(match[2])]
  }
  if ((match = /^(\d{1,2})\s*h$/.exec(core))) return [Number(match[1]), 0]
  if (/^\d{1,4}$/.test(core)) {
    if (core.length <= 2) return [Number(core), 0]
    return [Number(core.slice(0, core.length - 2)), Number(core.slice(-2))]
  }
  return null
}

function toTimeString(clock: [number, number] | null, meridiem: Meridiem | null) {
  if (!clock) return null
  let [hour] = clock
  const minute = clock[1]
  if (minute > 59) return null
  if (meridiem) {
    if (hour < 1 || hour > 12) return null
    if (meridiem === 'am') hour = hour === 12 ? 0 : hour
    else hour = hour === 12 ? 12 : hour + 12
  } else if (hour > 23) {
    return null
  }
  return `${pad(hour)}:${pad(minute)}`
}

/**
 * Read a typed time and return it as "HH:mm" (24-hour), or `null` when it isn't a time.
 * Accepts "830", "0830", "8", "8:30", "8.30", "20.00", "8h30", "8h", an am/pm marker ("8 pm",
 * "8:30PM", "12am", "8:30 CH"), and whatever `formatTime` shows in `locale` — day-period words
 * before or after the time ("오후 8:30", "下午8:30") and native digits ("٨:٣٠ م").
 */
export function parseTime(input: string, locale?: string): TimeString | null {
  const digits = nativeDigits()
  const text = input
    .replace(/[\u200e\u200f\u061c]/g, '')
    .replace(/\p{Nd}/gu, (d) => digits.get(d) ?? d)
    .trim()
    .toLowerCase()
    .replace(/[\s\u00a0\u202f]+/g, ' ')
  if (!text) return null

  const plain = toTimeString(parseClock(text), null)
  if (plain) return plain
  for (const { meridiem, trailing, leading } of dayPeriodMatchers(locale)) {
    for (const pattern of [trailing, leading]) {
      const match = pattern.exec(text)
      const time = match && toTimeString(parseClock(match[1].trim()), meridiem)
      if (time) return time
    }
  }
  return null
}

/**
 * Format "HH:mm" for display in a locale: "8:30 AM" in `en-US`, "08:30" in `vi-VN`.
 * `hourCycle` forces 12- (`'h12'`) or 24-hour (`'h23'`) display.
 */
export function formatTime(time: TimeString, locale?: string, hourCycle?: 'h12' | 'h23'): string {
  const [hour, minute] = time.split(':').map(Number)
  const at = new Date(2000, 0, 1, hour, minute)
  // 24-hour clocks read best zero-padded ("08:30"); 12-hour ones don't ("8:30 AM").
  const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric', hourCycle }).resolvedOptions()
    .hourCycle
  const twentyFour = cycle === 'h23' || cycle === 'h24'
  return new Intl.DateTimeFormat(locale, {
    hour: twentyFour ? '2-digit' : 'numeric',
    minute: '2-digit',
    hourCycle,
  }).format(at)
}
