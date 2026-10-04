import { AspectRatio as AspectRatioPrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../lib/cn'

export type AspectRatioProps = React.ComponentProps<typeof AspectRatioPrimitive.Root>

/** Keeps its content at a fixed width/height ratio, e.g. `ratio={16 / 9}`. */
export function AspectRatio({ className, ...props }: AspectRatioProps) {
  return (
    <AspectRatioPrimitive.Root
      data-slot="aspect-ratio"
      className={cn('overflow-hidden', className)}
      {...props}
    />
  )
}
