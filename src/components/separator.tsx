import { Separator as SeparatorPrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../lib/cn'

export interface SeparatorProps extends React.ComponentProps<typeof SeparatorPrimitive.Root> {
  /** Text shown in the middle of a horizontal separator ("or continue with"). */
  label?: React.ReactNode
}

export function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  label,
  asChild,
  ...props
}: SeparatorProps) {
  if (label != null && orientation === 'horizontal') {
    return (
      <div
        data-slot="separator"
        role={decorative ? 'none' : 'separator'}
        className={cn('flex w-full items-center gap-3 text-xs text-muted-foreground', className)}
        {...props}
      >
        <span className="h-px flex-1 bg-border" />
        <span className="shrink-0">{label}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    )
  }

  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      asChild={asChild}
      className={cn(
        'shrink-0 bg-border',
        'data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full',
        'data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch',
        className,
      )}
      {...props}
    />
  )
}
