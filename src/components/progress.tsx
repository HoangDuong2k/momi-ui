import { Progress as ProgressPrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../lib/cn'
import { toneBg, type Tone } from '../lib/tones'

const trackSizes = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
} as const

export interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  /** 0–max. Leave `null`/`undefined` for an indeterminate bar. */
  value?: number | null
  /** @default 'md' */
  size?: keyof typeof trackSizes
  /** @default 'primary' */
  tone?: Tone
  /** Label shown above the bar. */
  label?: React.ReactNode
  /** Show the percentage above the bar. */
  showValue?: boolean
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  tone = 'primary',
  label,
  showValue = false,
  className,
  ...props
}: ProgressProps) {
  const indeterminate = value == null
  const percent = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100))

  const bar = (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={indeterminate ? null : value}
      max={max}
      className={cn(
        'relative w-full overflow-hidden rounded-full bg-muted',
        trackSizes[size],
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          'h-full rounded-full',
          toneBg[tone],
          indeterminate
            ? 'w-2/5 animate-progress'
            : 'w-full transition-transform duration-500 ease-out-soft',
        )}
        style={indeterminate ? undefined : { transform: `translateX(-${100 - percent}%)` }}
      />
    </ProgressPrimitive.Root>
  )

  if (!label && !showValue) return bar

  return (
    <div data-slot="progress-field" className="grid w-full gap-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium">{label}</span>
        {showValue && !indeterminate && (
          <span className="text-muted-foreground tabular-nums">{Math.round(percent)}%</span>
        )}
      </div>
      {bar}
    </div>
  )
}
