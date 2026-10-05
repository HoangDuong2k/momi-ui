import { Popover as PopoverPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../../lib/cn'
import type { WeekStart } from '../../lib/date'
import { XIcon } from '../../lib/icons'
import { inputVariants, type InputSize } from '../input'
import { useOverlayPlacement, type OverlayPlacementProps } from '../portal-provider'
import { popAnimationClass, surfaceClass } from './overlay-styles'

/** Props shared by the popover pickers (DatePicker, DateRangePicker, DateTimePicker). */
export interface PickerBaseProps extends OverlayPlacementProps {
  /** @default 'md' (`xs` inside a compact `DensityProvider`) */
  size?: InputSize
  /** BCP 47 locale for the calendar and trigger text. Defaults to `LocaleProvider`'s. */
  locale?: string
  /** Intl options for the trigger text. @default { dateStyle: 'medium' } */
  formatOptions?: Intl.DateTimeFormatOptions
  weekStartsOn?: WeekStart
  minDate?: Date
  maxDate?: Date
  isDateDisabled?: (date: Date) => boolean
  /** Show a clear button when a value is set. @default true */
  clearable?: boolean
  disabled?: boolean
  id?: string
  className?: string
  'aria-label'?: string
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
  'aria-describedby'?: string
  required?: boolean
}

export function CalendarIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <path d="M8 2.5v4M16 2.5v4M3 10h18" />
    </svg>
  )
}

export function ClockIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

/** Whether a day can't be picked (outside min/max or rejected by `isDateDisabled`). */
export function isDayDisabled(
  day: Date,
  {
    minDate,
    maxDate,
    isDateDisabled,
  }: Pick<PickerBaseProps, 'minDate' | 'maxDate' | 'isDateDisabled'>,
) {
  const time = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime()
  const floor = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return (
    (minDate !== undefined && time < floor(minDate)) ||
    (maxDate !== undefined && time > floor(maxDate)) ||
    Boolean(isDateDisabled?.(day))
  )
}

/** Quick-pick button above a calendar panel. */
export const presetButtonClass =
  'inline-flex h-7 items-center rounded-md border border-input bg-background px-2.5 text-xs font-medium whitespace-nowrap text-foreground shadow-xs transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 aria-pressed:border-primary/40 aria-pressed:bg-primary/10 aria-pressed:text-primary dark:bg-transparent'

export function PickerTrigger({
  size,
  text,
  placeholder,
  clearLabel,
  onClear,
  open,
  icon,
  ...props
}: {
  size: InputSize
  text: string | null
  placeholder: string
  clearLabel: string
  onClear?: () => void
  open: boolean
  icon?: React.ReactNode
} & Pick<
  PickerBaseProps,
  'id' | 'disabled' | 'className' | 'aria-label' | 'aria-invalid' | 'aria-describedby' | 'required'
>) {
  const { className, required, ...rest } = props
  const iconClass = cn('shrink-0 text-muted-foreground', size === 'xs' ? 'size-3.5' : 'size-4')
  return (
    <PopoverPrimitive.Trigger asChild disabled={props.disabled}>
      <button
        type="button"
        data-slot="date-picker-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-required={required || undefined}
        className={cn(
          inputVariants({ size }),
          'cursor-pointer items-center justify-between gap-2 text-start',
          !text && 'text-muted-foreground/70',
          className,
        )}
        {...rest}
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon ?? <CalendarIcon className={iconClass} />}
          <span className="truncate">{text ?? placeholder}</span>
        </span>
        {text && onClear && (
          <span
            role="button"
            tabIndex={-1}
            aria-label={clearLabel}
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClear()
            }}
            className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </span>
        )}
      </button>
    </PopoverPrimitive.Trigger>
  )
}

export function PickerContent({
  children,
  ...placementProps
}: { children: React.ReactNode } & OverlayPlacementProps) {
  const placement = useOverlayPlacement(placementProps)
  return (
    <PopoverPrimitive.Portal container={placement.container}>
      <PopoverPrimitive.Content
        align="start"
        sideOffset={6}
        {...placement.collision}
        className={cn(
          surfaceClass,
          popAnimationClass,
          'max-h-(--radix-popover-content-available-height) w-auto origin-(--radix-popover-content-transform-origin) overflow-y-auto p-0',
        )}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}
