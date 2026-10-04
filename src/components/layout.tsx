import { cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../lib/cn'
import {
  breakpoints,
  gapClasses,
  responsiveVars,
  space,
  toBreakpoints,
  type Breakpoint,
  type Responsive,
  type SpaceScale,
} from '../lib/responsive'

/* -------------------------------------------------------------------------------------------------
 * Container
 * -----------------------------------------------------------------------------------------------*/

const containerSizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
} as const

export interface ContainerProps extends React.ComponentProps<'div'> {
  /** Max width: sm 42rem · md 56rem · lg 72rem · xl 80rem. @default 'lg' */
  size?: keyof typeof containerSizes
  asChild?: boolean
}

/** Centered, horizontally padded page column. */
export function Container({ size = 'lg', asChild, className, ...props }: ContainerProps) {
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <Comp
      data-slot="container"
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', containerSizes[size], className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * Stack
 * -----------------------------------------------------------------------------------------------*/

type Direction = 'row' | 'column' | 'row-reverse' | 'column-reverse'

const directionClasses: Record<Breakpoint, Record<Direction, string>> = {
  base: {
    row: 'flex-row',
    column: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse',
  },
  sm: {
    row: 'sm:flex-row',
    column: 'sm:flex-col',
    'row-reverse': 'sm:flex-row-reverse',
    'column-reverse': 'sm:flex-col-reverse',
  },
  md: {
    row: 'md:flex-row',
    column: 'md:flex-col',
    'row-reverse': 'md:flex-row-reverse',
    'column-reverse': 'md:flex-col-reverse',
  },
  lg: {
    row: 'lg:flex-row',
    column: 'lg:flex-col',
    'row-reverse': 'lg:flex-row-reverse',
    'column-reverse': 'lg:flex-col-reverse',
  },
  xl: {
    row: 'xl:flex-row',
    column: 'xl:flex-col',
    'row-reverse': 'xl:flex-row-reverse',
    'column-reverse': 'xl:flex-col-reverse',
  },
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
} as const

export interface StackProps extends React.ComponentProps<'div'> {
  /** Responsive, e.g. `{ base: 'column', md: 'row' }`. @default 'column' */
  direction?: Responsive<Direction>
  /** Spacing step (1 = 0.25rem). Responsive. @default 4 */
  gap?: Responsive<SpaceScale>
  align?: keyof typeof alignClasses
  justify?: keyof typeof justifyClasses
  wrap?: boolean
  asChild?: boolean
}

export function Stack({
  direction = 'column',
  gap = 4,
  align,
  justify,
  wrap,
  asChild,
  className,
  style,
  ...props
}: StackProps) {
  const Comp = asChild ? Slot.Root : 'div'
  const gapVars = responsiveVars('gap', gap, gapClasses, space)
  const directions = toBreakpoints(direction)
  return (
    <Comp
      data-slot="stack"
      className={cn(
        'flex',
        breakpoints.map((bp) => {
          const value = directions[bp]
          return value && directionClasses[bp][value]
        }),
        gapVars.classNames,
        align && alignClasses[align],
        justify && justifyClasses[justify],
        wrap && 'flex-wrap',
        className,
      )}
      style={{ ...gapVars.style, ...style }}
      {...props}
    />
  )
}

/** Horizontal stack, vertically centered. */
export function HStack(props: Omit<StackProps, 'direction'>) {
  return <Stack direction="row" align="center" {...props} />
}

/** Vertical stack. */
export function VStack(props: Omit<StackProps, 'direction'>) {
  return <Stack direction="column" {...props} />
}

/* -------------------------------------------------------------------------------------------------
 * Grid
 * -----------------------------------------------------------------------------------------------*/

const columnClasses: Record<Breakpoint, string> = {
  base: 'grid-cols-(--cols)',
  sm: 'sm:grid-cols-(--cols-sm)',
  md: 'md:grid-cols-(--cols-md)',
  lg: 'lg:grid-cols-(--cols-lg)',
  xl: 'xl:grid-cols-(--cols-xl)',
}

export interface GridProps extends React.ComponentProps<'div'> {
  /** Number of equal columns. Responsive: `{ base: 1, md: 2, lg: 3 }`. @default 1 */
  columns?: Responsive<number>
  /** Auto-fit as many columns as fit, each at least this wide (e.g. `'16rem'`). Overrides `columns`. */
  minChildWidth?: string
  /** Spacing step (1 = 0.25rem). Responsive. @default 4 */
  gap?: Responsive<SpaceScale>
  asChild?: boolean
}

export function Grid({
  columns = 1,
  minChildWidth,
  gap = 4,
  asChild,
  className,
  style,
  ...props
}: GridProps) {
  const Comp = asChild ? Slot.Root : 'div'
  const gapVars = responsiveVars('gap', gap, gapClasses, space)
  const colVars = minChildWidth
    ? {
        style: { '--cols': `repeat(auto-fill, minmax(min(${minChildWidth}, 100%), 1fr))` },
        classNames: [columnClasses.base],
      }
    : responsiveVars('cols', columns, columnClasses, (n) => `repeat(${n}, minmax(0, 1fr))`)

  return (
    <Comp
      data-slot="grid"
      className={cn('grid', colVars.classNames, gapVars.classNames, className)}
      style={{ ...colVars.style, ...gapVars.style, ...style } as React.CSSProperties}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * Section
 * -----------------------------------------------------------------------------------------------*/

export const sectionVariants = cva('relative w-full', {
  variants: {
    spacing: {
      none: '',
      sm: 'py-10 md:py-14',
      md: 'py-16 md:py-24',
      lg: 'py-20 md:py-32',
    },
    tone: {
      default: '',
      muted: 'bg-muted/50',
    },
    bordered: {
      true: 'border-y',
    },
  },
  defaultVariants: {
    spacing: 'md',
    tone: 'default',
  },
})

export interface SectionProps extends React.ComponentProps<'section'> {
  /** Vertical rhythm for landing-page sections. @default 'md' */
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  /** @default 'default' */
  tone?: 'default' | 'muted'
  bordered?: boolean
  asChild?: boolean
}

export function Section({ spacing, tone, bordered, asChild, className, ...props }: SectionProps) {
  const Comp = asChild ? Slot.Root : 'section'
  return (
    <Comp
      data-slot="section"
      className={cn(sectionVariants({ spacing, tone, bordered }), className)}
      {...props}
    />
  )
}
