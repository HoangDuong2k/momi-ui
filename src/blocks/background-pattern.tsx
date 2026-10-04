import type * as React from 'react'
import { cn } from '../lib/cn'

export type BackgroundVariant = 'grid' | 'dots' | 'glow' | 'gradient'
export type BackgroundFade = 'none' | 'radial' | 'top' | 'bottom' | 'edges'

export interface BackgroundPatternProps extends React.ComponentProps<'div'> {
  /** @default 'grid' */
  variant?: BackgroundVariant
  /** Mask that fades the pattern out. @default 'radial' */
  fade?: BackgroundFade
  /** Grid cell / dot spacing in px. */
  size?: number
}

const line = 'color-mix(in oklab, var(--foreground) 7%, transparent)'
const dot = 'color-mix(in oklab, var(--foreground) 16%, transparent)'
const glow = 'color-mix(in oklab, var(--primary) 22%, transparent)'

function backgroundFor(variant: BackgroundVariant, size: number): React.CSSProperties {
  switch (variant) {
    case 'grid':
      return {
        backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      }
    case 'dots':
      return {
        backgroundImage: `radial-gradient(${dot} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      }
    case 'glow':
      return {
        backgroundImage: `radial-gradient(60% 50% at 50% 0%, ${glow}, transparent 70%)`,
      }
    case 'gradient':
      return {
        backgroundImage:
          'linear-gradient(to bottom, color-mix(in oklab, var(--primary) 7%, var(--background)), var(--background) 70%)',
      }
  }
}

const masks: Record<BackgroundFade, string | undefined> = {
  none: undefined,
  radial: 'radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 75%)',
  top: 'linear-gradient(to top, #000 40%, transparent)',
  bottom: 'linear-gradient(to bottom, #000 40%, transparent)',
  edges: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 50%, transparent 100%)',
}

/** Decorative background layer. Place inside a `relative` parent. */
export function BackgroundPattern({
  variant = 'grid',
  fade = 'radial',
  size,
  className,
  style,
  ...props
}: BackgroundPatternProps) {
  const mask = masks[fade]
  return (
    <div
      aria-hidden
      data-slot="background-pattern"
      data-variant={variant}
      className={cn('pointer-events-none absolute inset-0 -z-10', className)}
      style={{
        ...backgroundFor(variant, size ?? (variant === 'dots' ? 18 : 40)),
        maskImage: mask,
        WebkitMaskImage: mask,
        ...style,
      }}
      {...props}
    />
  )
}
