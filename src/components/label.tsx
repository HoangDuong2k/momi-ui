import { Label as LabelPrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../lib/cn'

export interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  /** Shows a required marker after the text. */
  required?: boolean
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'inline-flex items-center gap-1 text-sm leading-none font-medium text-foreground select-none',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden className="text-destructive">
          *
        </span>
      )}
    </LabelPrimitive.Root>
  )
}
