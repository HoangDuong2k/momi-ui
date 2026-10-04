import type * as React from 'react'
import { cn } from '../lib/cn'
import { NumberTicker } from './number-ticker'

export interface StatItem {
  /** Numbers count up when scrolled into view; strings are shown as-is. */
  value: number | React.ReactNode
  label: React.ReactNode
  description?: React.ReactNode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  /** Fraction digits for numeric values. */
  decimals?: number
}

const columnClasses = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const

export interface StatsProps extends React.ComponentProps<'dl'> {
  items: StatItem[]
  /** Defaults to the number of items (max 4). */
  columns?: keyof typeof columnClasses
  /** `plain` · `cards` · `divided` (hairlines between items). @default 'plain' */
  variant?: 'plain' | 'cards' | 'divided'
  /** @default 'center' */
  align?: 'center' | 'start'
}

/** Key numbers in a row — "10k teams · 99.99% uptime". */
export function Stats({
  items,
  columns,
  variant = 'plain',
  align = 'center',
  className,
  ...props
}: StatsProps) {
  const cols = columns ?? (Math.min(4, Math.max(2, items.length)) as keyof typeof columnClasses)
  return (
    <dl
      data-slot="stats"
      className={cn(
        'grid grid-cols-1',
        columnClasses[cols],
        variant === 'plain' && 'gap-10',
        variant === 'cards' && 'gap-4',
        variant === 'divided' && 'gap-px overflow-hidden rounded-xl border bg-border',
        className,
      )}
      {...props}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            'flex flex-col-reverse gap-2',
            align === 'center' ? 'items-center text-center' : 'items-start text-start',
            variant === 'cards' && 'rounded-xl border bg-card p-6 shadow-xs',
            variant === 'divided' && 'bg-background p-8',
          )}
        >
          <dt className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{item.label}</span>
            {item.description && <span className="mt-1 block">{item.description}</span>}
          </dt>
          <dd className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {typeof item.value === 'number' ? (
              <NumberTicker
                value={item.value}
                decimals={item.decimals}
                prefix={item.prefix}
                suffix={item.suffix}
              />
            ) : (
              <>
                {item.prefix}
                {item.value}
                {item.suffix}
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
