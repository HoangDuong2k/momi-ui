import type * as React from 'react'
import { cn } from '../lib/cn'
import { Reveal } from './reveal'

const gridColumns = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
} as const

export interface BentoGridProps extends React.ComponentProps<'div'> {
  /** @default 3 */
  columns?: keyof typeof gridColumns
}

/** Asymmetric grid of feature cards. Size cards with `colSpan` / `rowSpan` on `BentoCard`. */
export function BentoGrid({ columns = 3, className, ...props }: BentoGridProps) {
  return (
    <div
      data-slot="bento-grid"
      className={cn(
        'grid auto-rows-[minmax(15rem,auto)] grid-cols-1 gap-4',
        gridColumns[columns],
        className,
      )}
      {...props}
    />
  )
}

const colSpans = { 1: '', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'lg:col-span-4' } as const
const rowSpans = { 1: '', 2: 'md:row-span-2', 3: 'md:row-span-3' } as const

export interface BentoCardProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  /** Visual area above the text (illustration, mini UI, chart…). */
  visual?: React.ReactNode
  /** @default 1 */
  colSpan?: keyof typeof colSpans
  /** @default 1 */
  rowSpan?: keyof typeof rowSpans
  /** Delay of the reveal animation, in ms. */
  delay?: number
}

export function BentoCard({
  title,
  description,
  icon,
  visual,
  colSpan = 1,
  rowSpan = 1,
  delay = 0,
  className,
  children,
  ...props
}: BentoCardProps) {
  return (
    <Reveal
      delay={delay}
      data-slot="bento-card"
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xs',
        colSpans[colSpan],
        rowSpans[rowSpan],
        className,
      )}
      {...props}
    >
      {visual && (
        <div className="relative min-h-36 flex-1 overflow-hidden border-b bg-muted/30">
          {visual}
        </div>
      )}
      <div className={cn('flex flex-col gap-2 p-6', !visual && 'mt-auto')}>
        {icon && (
          <span className="mb-2 flex size-9 items-center justify-center rounded-lg border bg-background shadow-xs [&_svg]:size-4.5">
            {icon}
          </span>
        )}
        <h3 className="font-semibold tracking-tight">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {children}
      </div>
    </Reveal>
  )
}
