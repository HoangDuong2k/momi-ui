import type * as React from 'react'
import { cn } from '../lib/cn'

/** Placeholder shape shown while content loads. Size it with className. */
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

export interface SkeletonTextProps extends React.ComponentProps<'div'> {
  /** @default 3 */
  lines?: number
}

/** A paragraph of skeleton lines; the last one is shorter. */
export function SkeletonText({ lines = 3, className, ...props }: SkeletonTextProps) {
  return (
    <div data-slot="skeleton-text" aria-hidden className={cn('grid gap-2', className)} {...props}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3.5', i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  )
}
