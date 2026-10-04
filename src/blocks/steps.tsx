import type * as React from 'react'
import { cn } from '../lib/cn'
import { Reveal } from './reveal'

export interface StepItem {
  title: React.ReactNode
  description?: React.ReactNode
  /** Replaces the step number. */
  icon?: React.ReactNode
}

export interface StepsProps extends React.ComponentProps<'ol'> {
  items: StepItem[]
  /** @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
}

const horizontalColumns: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
}

/** Numbered "how it works" sequence with connecting lines. */
export function Steps({ items, orientation = 'horizontal', className, ...props }: StepsProps) {
  const horizontal = orientation === 'horizontal'
  return (
    <ol
      data-slot="steps"
      data-orientation={orientation}
      className={cn(
        'grid gap-8',
        horizontal && (horizontalColumns[items.length] ?? 'md:grid-cols-3'),
        className,
      )}
      {...props}
    >
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <Reveal asChild key={i} delay={i * 100}>
            <li
              className={cn(
                'relative flex gap-4',
                horizontal ? 'flex-row md:flex-col' : 'flex-row',
              )}
            >
              <div
                className={cn(
                  'relative flex shrink-0',
                  horizontal ? 'md:w-full' : 'flex-col items-center',
                )}
              >
                <span className="relative z-10 flex size-10 items-center justify-center rounded-full border bg-background text-sm font-semibold shadow-xs [&_svg]:size-4.5">
                  {item.icon ?? i + 1}
                </span>
                {!last && (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute bg-border',
                      horizontal
                        ? 'top-12 bottom-[-2rem] left-5 w-px md:top-5 md:right-[-2rem] md:bottom-auto md:left-14 md:h-px md:w-auto'
                        : 'top-12 bottom-[-2rem] left-5 w-px',
                    )}
                  />
                )}
              </div>
              <div className="grid gap-1.5 pb-2">
                <h3 className="font-semibold tracking-tight">{item.title}</h3>
                {item.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </li>
          </Reveal>
        )
      })}
    </ol>
  )
}
