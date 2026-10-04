import type * as React from 'react'
import { cn } from '../lib/cn'

export interface MarqueeProps extends React.ComponentProps<'div'> {
  /** Seconds for one full loop. @default 40 */
  duration?: number
  /** Space between items, any CSS length. @default '2.5rem' */
  gap?: string
  reverse?: boolean
  /** @default true */
  pauseOnHover?: boolean
  /** Fade the edges. @default true */
  fade?: boolean
  /** Copies of the content — raise it when items are narrower than the container. @default 2 */
  repeat?: number
}

/** Infinitely scrolling row of items (logos, testimonials…). Pauses for reduced motion. */
export function Marquee({
  duration = 40,
  gap = '2.5rem',
  reverse = false,
  pauseOnHover = true,
  fade = true,
  repeat = 2,
  className,
  style,
  children,
  ...props
}: MarqueeProps) {
  const mask = 'linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)'
  return (
    <div
      data-slot="marquee"
      className={cn('group/marquee flex w-full gap-(--marquee-gap) overflow-hidden', className)}
      style={
        {
          '--marquee-duration': `${duration}s`,
          '--marquee-gap': gap,
          maskImage: fade ? mask : undefined,
          WebkitMaskImage: fade ? mask : undefined,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {Array.from({ length: Math.max(2, repeat) }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 || undefined}
          className={cn(
            'flex shrink-0 animate-marquee items-center gap-(--marquee-gap)',
            reverse && '[animation-direction:reverse]',
            pauseOnHover && 'group-hover/marquee:[animation-play-state:paused]',
            'motion-reduce:[animation-play-state:paused]',
          )}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
