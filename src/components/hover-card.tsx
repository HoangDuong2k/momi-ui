import { HoverCard as HoverCardPrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../lib/cn'
import { useCollisionProps, usePortalContainer } from './portal-provider'
import { popAnimationClass, surfaceClass } from './internal/overlay-styles'

/** Rich preview shown when hovering a link (for sighted mouse users; not a replacement for content). */
export function HoverCard({
  openDelay = 300,
  closeDelay = 150,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return (
    <HoverCardPrimitive.Root
      data-slot="hover-card"
      openDelay={openDelay}
      closeDelay={closeDelay}
      {...props}
    />
  )
}

export function HoverCardTrigger(props: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
}

export interface HoverCardContentProps extends React.ComponentProps<
  typeof HoverCardPrimitive.Content
> {
  /** Mount it here instead of `PortalProvider`'s container (or `document.body`). */
  container?: Element | DocumentFragment | null
}

export function HoverCardContent({
  align = 'center',
  sideOffset = 6,
  collisionBoundary,
  collisionPadding,
  container,
  className,
  ...props
}: HoverCardContentProps) {
  const portalContainer = usePortalContainer(container)
  const collision = useCollisionProps({ collisionBoundary, collisionPadding })
  return (
    <HoverCardPrimitive.Portal container={portalContainer}>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        {...collision}
        className={cn(
          surfaceClass,
          popAnimationClass,
          'w-72 origin-(--radix-hover-card-content-transform-origin) p-4',
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}
