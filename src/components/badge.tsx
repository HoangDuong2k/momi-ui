import { Slot } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../lib/cn'
import { toneOutline, toneSoft, toneSolid, type Tone } from '../lib/tones'

const badgeVariantClasses = {
  solid: toneSolid,
  soft: toneSoft,
  outline: toneOutline,
} as const

const badgeSizes = {
  sm: 'h-5 px-1.5 text-[11px]',
  md: 'h-6 px-2.5 text-xs',
} as const

export interface BadgeProps extends React.ComponentProps<'span'> {
  /** @default 'soft' */
  variant?: keyof typeof badgeVariantClasses
  /** @default 'neutral' */
  tone?: Tone
  /** @default 'md' */
  size?: keyof typeof badgeSizes
  /** @default 'pill' */
  shape?: 'pill' | 'rounded'
  /** Show a small status dot before the text. */
  dot?: boolean
  asChild?: boolean
}

export function Badge({
  className,
  variant = 'soft',
  tone = 'neutral',
  size = 'md',
  shape = 'pill',
  dot = false,
  asChild = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : 'span'
  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-tone={tone}
      className={cn(
        'inline-flex w-fit shrink-0 items-center justify-center gap-1.5 border border-transparent font-medium whitespace-nowrap',
        'transition-colors [&>svg]:pointer-events-none [&>svg]:size-3',
        shape === 'pill' ? 'rounded-full' : 'rounded-md',
        badgeSizes[size],
        badgeVariantClasses[variant][tone],
        className,
      )}
      {...props}
    >
      {dot && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  )
}
