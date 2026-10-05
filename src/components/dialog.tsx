import { Dialog as DialogPrimitive } from 'radix-ui'
import type * as React from 'react'
import { useMessages } from '../i18n/locale-provider'
import { cn } from '../lib/cn'
import { usePortalContainer } from './portal-provider'
import { XIcon } from '../lib/icons'
import { IconButton } from './icon-button'
import {
  modalContentClass,
  modalDescriptionClass,
  modalFooterClass,
  modalHeaderClass,
  modalTitleClass,
  overlayClass,
} from './internal/overlay-styles'

export function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

export function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

export function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

export function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(overlayClass, className)}
      {...props}
    />
  )
}

const dialogSizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'h-[calc(100%-2rem)] max-w-[calc(100%-2rem)]',
} as const

export interface DialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  /** @default 'md' */
  size?: keyof typeof dialogSizes
  /** Show the close button in the top corner. @default true */
  showClose?: boolean
  /** Accessible label of the close button. @default messages.common.close */
  closeLabel?: string
  /** Props for the portal (e.g. a custom `container`). */
  portalProps?: React.ComponentProps<typeof DialogPrimitive.Portal>
  /** Mount it here instead of `PortalProvider`'s container (or `document.body`). */
  container?: Element | DocumentFragment | null
}

export function DialogContent({
  size = 'md',
  showClose = true,
  closeLabel,
  portalProps,
  container,
  className,
  children,
  ...props
}: DialogContentProps) {
  const t = useMessages('common')
  const portalContainer = usePortalContainer(
    container !== undefined ? container : portalProps?.container,
  )
  return (
    <DialogPrimitive.Portal {...portalProps} container={portalContainer}>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(modalContentClass, dialogSizes[size], className)}
        {...props}
      >
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

export function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="dialog-header" className={cn(modalHeaderClass, 'pe-8', className)} {...props} />
  )
}

export function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-footer" className={cn(modalFooterClass, className)} {...props} />
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(modalTitleClass, className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(modalDescriptionClass, className)}
      {...props}
    />
  )
}
