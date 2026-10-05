import { Select as SelectPrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../lib/cn'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '../lib/icons'
import { useFormControlProps } from './form-field'
import { useDefaultSize } from './density-provider'
import { controlSizeDefaults, inputVariants, type InputSize } from './input'
import {
  menuItemClass,
  menuLabelClass,
  menuSeparatorClass,
  popAnimationClass,
  surfaceClass,
} from './internal/overlay-styles'

/** Custom-styled select with keyboard support. For long lists on mobile, prefer NativeSelect. */
export function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

export function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

export function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

export interface SelectTriggerProps extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
  /** @default 'md' (`xs` inside a compact `DensityProvider`) */
  size?: InputSize
}

export function SelectTrigger(props: SelectTriggerProps) {
  const { size: sizeProp, className, children, ...rest } = useFormControlProps(props)
  const size = useDefaultSize<InputSize>(sizeProp, controlSizeDefaults)
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        inputVariants({ size }),
        'cursor-pointer items-center justify-between gap-2 text-start whitespace-nowrap',
        'data-[placeholder]:text-muted-foreground/70 *:data-[slot=select-value]:truncate',
        "[&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        size === 'xs' && "gap-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...rest}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="shrink-0 opacity-80" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectContent({
  position = 'popper',
  sideOffset = 6,
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  const popper = position === 'popper'
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={popper ? sideOffset : undefined}
        className={cn(
          surfaceClass,
          popAnimationClass,
          'relative max-h-(--radix-select-content-available-height) min-w-32 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto',
          popper && 'w-full min-w-(--radix-select-trigger-width)',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex h-6 cursor-default items-center justify-center text-muted-foreground">
          <ChevronUpIcon className="size-4" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex h-6 cursor-default items-center justify-center text-muted-foreground">
          <ChevronDownIcon className="size-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(menuItemClass, 'pe-8', className)}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute end-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-3.5 text-foreground" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
}

export function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(menuLabelClass, className)}
      {...props}
    />
  )
}

export function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(menuSeparatorClass, className)}
      {...props}
    />
  )
}
