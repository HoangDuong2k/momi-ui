import { Dialog as DialogPrimitive } from 'radix-ui'
import type * as React from 'react'
import { useMessages } from '../i18n/locale-provider'
import { cn } from '../lib/cn'
import { usePortalContainer } from './portal-provider'
import { XIcon } from '../lib/icons'
import { IconButton } from './icon-button'
import { modalDescriptionClass, modalTitleClass, overlayClass } from './internal/overlay-styles'

/**
 * A panel that slides in from an edge of the screen (a.k.a. sheet). `modal={false}` keeps the page
 * usable: no overlay, no focus trap, no blocked pointer events.
 */
export function Drawer(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="drawer" {...props} />
}

export function DrawerTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

export function DrawerClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="drawer-close" {...props} />
}

const drawerSides = {
  right:
    'inset-y-0 end-0 w-[min(calc(100%-2.5rem),var(--drawer-size))] border-s [--momi-slide-x:100%] rtl:[--momi-slide-x:-100%]',
  left: 'inset-y-0 start-0 w-[min(calc(100%-2.5rem),var(--drawer-size))] border-e [--momi-slide-x:-100%] rtl:[--momi-slide-x:100%]',
  top: 'inset-x-0 top-0 max-h-[85%] rounded-b-2xl border-b [--momi-slide-y:-100%]',
  bottom: 'inset-x-0 bottom-0 max-h-[85%] rounded-t-2xl border-t [--momi-slide-y:100%]',
} as const

const drawerSizes = {
  sm: '[--drawer-size:20rem]',
  md: '[--drawer-size:26rem]',
  lg: '[--drawer-size:36rem]',
  xl: '[--drawer-size:48rem]',
} as const

export interface DrawerContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  /** Edge the drawer slides from. @default 'right' */
  side?: keyof typeof drawerSides
  /** Width for left/right drawers. @default 'md' */
  size?: keyof typeof drawerSizes
  /** @default true */
  showClose?: boolean
  /** Accessible label of the close button. @default messages.common.close */
  closeLabel?: string
  /**
   * Close when the user presses or moves focus outside the drawer. Turn it off for a non-modal
   * drawer that should stay open while people work next to it. @default true
   */
  closeOnInteractOutside?: boolean
  /** Mount it here instead of `PortalProvider`'s container (or `document.body`). */
  container?: Element | DocumentFragment | null
}

/**
 * The panel. To leave room for an app bar, offset its edge with `style`, e.g.
 * `style={{ top: 48 }}` on a right drawer.
 */
export function DrawerContent({
  side = 'right',
  size = 'md',
  showClose = true,
  closeLabel,
  closeOnInteractOutside = true,
  onInteractOutside,
  container,
  className,
  children,
  ...props
}: DrawerContentProps) {
  const t = useMessages('common')
  const portalContainer = usePortalContainer(container)
  return (
    <DialogPrimitive.Portal container={portalContainer}>
      <DialogPrimitive.Overlay data-slot="drawer-overlay" className={overlayClass} />
      <DialogPrimitive.Content
        data-slot="drawer-content"
        data-side={side}
        className={cn(
          'fixed z-50 flex flex-col bg-surface-modal shadow-xl outline-none',
          'data-[state=closed]:animate-slide-out data-[state=open]:animate-slide-in',
          drawerSides[side],
          drawerSizes[size],
          className,
        )}
        onInteractOutside={(event) => {
          onInteractOutside?.(event)
          if (!closeOnInteractOutside) event.preventDefault()
        }}
        {...props}
      >
        {side === 'bottom' && (
          <div aria-hidden className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted" />
        )}
        {children}
        {showClose && (
          <DialogPrimitive.Close asChild>
            <IconButton
              aria-label={closeLabel ?? t.close}
              size="sm"
              className="absolute end-3 top-3 text-muted-foreground"
            >
              <XIcon />
            </IconButton>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn('flex flex-col gap-1.5 p-6 pe-12 pb-4', className)}
      {...props}
    />
  )
}

export function DrawerBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-body"
      className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-2', className)}
      {...props}
    />
  )
}

export function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        'mt-auto flex flex-col-reverse gap-2 p-6 pt-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

export function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="drawer-title"
      className={cn(modalTitleClass, className)}
      {...props}
    />
  )
}

export function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="drawer-description"
      className={cn(modalDescriptionClass, className)}
      {...props}
    />
  )
}
