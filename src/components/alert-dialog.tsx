import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../lib/cn'
import {
  buttonVariants,
  defaultTone,
  type ButtonSize,
  type ButtonTone,
  type ButtonVariant,
} from './button'
import {
  modalContentClass,
  modalDescriptionClass,
  modalFooterClass,
  modalHeaderClass,
  modalTitleClass,
  overlayClass,
} from './internal/overlay-styles'

/** A modal that interrupts the user to confirm an important action. Closes only via its buttons. */
export function AlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

export function AlertDialogTrigger(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>,
) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

const alertDialogSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
} as const

export interface AlertDialogContentProps extends React.ComponentProps<
  typeof AlertDialogPrimitive.Content
> {
  /** @default 'md' */
  size?: keyof typeof alertDialogSizes
}

export function AlertDialogContent({ size = 'md', className, ...props }: AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={overlayClass} />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(modalContentClass, alertDialogSizes[size], className)}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  )
}

export function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="alert-dialog-header" className={cn(modalHeaderClass, className)} {...props} />
  )
}

export function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="alert-dialog-footer" className={cn(modalFooterClass, className)} {...props} />
  )
}

export function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(modalTitleClass, className)}
      {...props}
    />
  )
}

export function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(modalDescriptionClass, className)}
      {...props}
    />
  )
}

interface ActionButtonProps {
  variant?: ButtonVariant
  tone?: ButtonTone
  size?: ButtonSize
}

/** Confirms the action. Use `tone="danger"` for destructive actions. */
export function AlertDialogAction({
  variant = 'solid',
  tone,
  size = 'md',
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> & ActionButtonProps) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(
        buttonVariants({ variant, tone: tone ?? defaultTone(variant), size }),
        className,
      )}
      {...props}
    />
  )
}

export function AlertDialogCancel({
  variant = 'outline',
  tone,
  size = 'md',
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> & ActionButtonProps) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(
        buttonVariants({ variant, tone: tone ?? defaultTone(variant), size }),
        className,
      )}
      {...props}
    />
  )
}
