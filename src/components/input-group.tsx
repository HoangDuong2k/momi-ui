import type * as React from 'react'
import { cn } from '../lib/cn'

export type InputGroupProps = React.ComponentProps<'div'>

/**
 * Attaches addons and buttons to an input: `https://` [ input ] [ Copy ].
 * Put `Input`, `InputAddon` and `Button` as direct children (inputs without sections).
 */
export function InputGroup({ className, ...props }: InputGroupProps) {
  return (
    <div
      role="group"
      data-slot="input-group"
      className={cn(
        'flex w-full items-stretch',
        '[&>*:active]:scale-100 [&>*:focus-visible]:relative [&>*:focus-visible]:z-10',
        '[&>*:not(:first-child)]:-ms-px [&>*:not(:first-child)]:rounded-s-none [&>*:not(:last-child)]:rounded-e-none',
        '[&>button]:h-auto',
        className,
      )}
      {...props}
    />
  )
}

export type InputAddonProps = React.ComponentProps<'span'>

export function InputAddon({ className, ...props }: InputAddonProps) {
  return (
    <span
      data-slot="input-addon"
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-md border border-input bg-muted/60 px-3 text-sm whitespace-nowrap text-muted-foreground shadow-xs',
        "[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}
