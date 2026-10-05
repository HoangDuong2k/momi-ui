/** Red, green, blue (0–255) and alpha (0–1). */
export interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

/** Hue (0–360), saturation and value/brightness (0–1), alpha (0–1). */
export interface Hsva {
  h: number
  s: number
  v: number
  a: number
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

function channel(token: string, max: number) {
  const value = token.endsWith('%') ? (parseFloat(token) / 100) * max : parseFloat(token)
  return Number.isFinite(value) ? clamp(value, 0, max) : NaN
}

/**
 * Parse `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()` and `rgba()` (comma or space syntax).
 * A missing `#` is accepted for hex. Returns `null` for anything else.
 */
export function parseColor(input: string): Rgba | null {
  const text = input.trim().toLowerCase()
  const hex = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(text)
  if (hex) {
    let digits = hex[1]
    if (digits.length <= 4) digits = [...digits].map((d) => d + d).join('')
    const n = (i: number) => parseInt(digits.slice(i, i + 2), 16)
    return { r: n(0), g: n(2), b: n(4), a: digits.length === 8 ? round(n(6) / 255, 3) : 1 }
  }
  const fn = /^rgba?\((.*)\)$/.exec(text)
  if (!fn) return null
  const parts = fn[1]
    .replace(/\s*\/\s*/, ' / ')
    .split(/[\s,]+/)
    .filter((p) => p && p !== '/')
  if (parts.length !== 3 && parts.length !== 4) return null
  const [r, g, b] = parts.slice(0, 3).map((p) => channel(p, 255))
  const a = parts[3] === undefined ? 1 : channel(parts[3], 1)
  if ([r, g, b, a].some(Number.isNaN)) return null
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a: round(a, 3) }
}

const round = (n: number, digits: number) => Math.round(n * 10 ** digits) / 10 ** digits
const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, '0')

export function toHex({ r, g, b }: Rgba): string {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`
}

/** `#rrggbb` when opaque, `rgba(r,g,b,a)` when alpha is below 1. */
export function formatColor(color: Rgba): string {
  const a = round(clamp(color.a, 0, 1), 2)
  if (a >= 1) return toHex(color)
  const { r, g, b } = color
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`
}

export function rgbaToHsva({ r, g, b, a }: Rgba): Hsva {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const delta = max - Math.min(rn, gn, bn)
  let h = 0
  if (delta) {
    if (max === rn) h = ((gn - bn) / delta) % 6
    else if (max === gn) h = (bn - rn) / delta + 2
    else h = (rn - gn) / delta + 4
  }
  return { h: (h * 60 + 360) % 360, s: max ? delta / max : 0, v: max, a }
}

export function hsvaToRgba({ h, s, v, a }: Hsva): Rgba {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255
  }
  return { r: Math.round(f(5)), g: Math.round(f(3)), b: Math.round(f(1)), a }
}
