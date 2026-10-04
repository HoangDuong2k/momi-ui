import { Collapsible as CollapsiblePrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../lib/cn'

/** Show and hide a region with an animated height. Unstyled — bring your own trigger. */
export function Collapsible(props: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

export function CollapsibleTrigger(
  props: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>,
) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
}

export function CollapsibleContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      className={cn(
        'overflow-hidden [--momi-collapse-height:var(--radix-collapsible-content-height)]',
        'data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down',
        className,
      )}
      {...props}
    />
  )
}
