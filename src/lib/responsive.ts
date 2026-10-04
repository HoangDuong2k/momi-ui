import type * as React from 'react'

export const breakpoints = ['base', 'sm', 'md', 'lg', 'xl'] as const
export type Breakpoint = (typeof breakpoints)[number]

/** A value, or an object of values keyed by breakpoint: `{ base: 1, md: 2, lg: 3 }`. */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>

/** Spacing step on the Tailwind scale (1 step = 0.25rem). */
export type SpaceScale = 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24

export function toBreakpoints<T>(value: Responsive<T> | undefined): Partial<Record<Breakpoint, T>> {
  if (value === undefined) return {}
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Partial<Record<Breakpoint, T>>
  }
  return { base: value as T }
}

export const space = (step: number) => `${step * 0.25}rem`

/**
 * Resolve a responsive value into CSS custom properties + the static utility classes that read them.
 * `classes` must contain complete class names per breakpoint so Tailwind can generate them.
 */
export function responsiveVars<T>(
  name: string,
  value: Responsive<T> | undefined,
  classes: Record<Breakpoint, string>,
  toCss: (value: T) => string,
) {
  const style: Record<string, string> = {}
  const classNames: string[] = []
  const values = toBreakpoints(value)
  for (const bp of breakpoints) {
    const v = values[bp]
    if (v === undefined) continue
    style[bp === 'base' ? `--${name}` : `--${name}-${bp}`] = toCss(v)
    classNames.push(classes[bp])
  }
  return { style: style as React.CSSProperties, classNames }
}

export const gapClasses: Record<Breakpoint, string> = {
  base: 'gap-(--gap)',
  sm: 'sm:gap-(--gap-sm)',
  md: 'md:gap-(--gap-md)',
  lg: 'lg:gap-(--gap-lg)',
  xl: 'xl:gap-(--gap-xl)',
}
