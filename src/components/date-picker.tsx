import { Popover as PopoverPrimitive } from 'radix-ui'
import * as React from 'react'
import { useLocale, useMessages } from '../i18n/locale-provider'
import type { MomiMessages } from '../i18n/messages'
import { cn } from '../lib/cn'
import type { WeekStart } from '../lib/date'
import { XIcon } from '../lib/icons'
import { useControllableState } from '../lib/use-controllable-state'
import { Calendar, type DateRange } from './calendar'
import { useFormControlProps } from './form-field'
import { useDefaultSize } from './density-provider'
import { controlSizeDefaults, inputVariants, type InputSize } from './input'
import { popAnimationClass, surfaceClass } from './internal/overlay-styles'

function CalendarIcon(props: React.ComponentProps<'svg'>) {
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

interface PickerBaseProps {
  /** @default messages.datePicker.placeholder / rangePlaceholder */
  placeholder?: string
  /** Override built-in text for this instance. */
  labels?: Partial<MomiMessages['datePicker']>
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

function PickerTrigger({
  size,
  text,
  placeholder,
  clearLabel,
  onClear,
  open,
  ...props
}: {
  size: InputSize
  text: string | null
  placeholder: string
  clearLabel: string
  onClear?: () => void
  open: boolean
} & Pick<
  PickerBaseProps,
  'id' | 'disabled' | 'className' | 'aria-label' | 'aria-invalid' | 'aria-describedby' | 'required'
>) {
  const { className, required, ...rest } = props
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
          <CalendarIcon
            className={cn('shrink-0 text-muted-foreground', size === 'xs' ? 'size-3.5' : 'size-4')}
          />
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

function PickerContent({ children }: { children: React.ReactNode }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align="start"
        sideOffset={6}
        collisionPadding={8}
        className={cn(
          surfaceClass,
          popAnimationClass,
          'w-auto origin-(--radix-popover-content-transform-origin) p-0',
        )}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

/* -------------------------------------------------------------------------------------------------
 * DatePicker
 * -----------------------------------------------------------------------------------------------*/

export interface DatePickerProps extends PickerBaseProps {
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (date: Date | null) => void
}

export function DatePicker(props: DatePickerProps) {
  const {
    value,
    defaultValue = null,
    onValueChange,
    placeholder,
    labels,
    size: sizeProp,
    locale: localeProp,
    formatOptions = { dateStyle: 'medium' },
    weekStartsOn,
    minDate,
    maxDate,
    isDateDisabled,
    clearable = true,
    ...triggerProps
  } = useFormControlProps(props)
  const [open, setOpen] = React.useState(false)
  const context = useLocale()
  const locale = localeProp ?? context.locale
  const size = useDefaultSize<InputSize>(sizeProp, controlSizeDefaults)
  const t = useMessages('datePicker', labels)
  const [date, setDate] = useControllableState<Date | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const text = date ? new Intl.DateTimeFormat(locale, formatOptions).format(date) : null

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PickerTrigger
        size={size}
        text={text}
        placeholder={placeholder ?? t.placeholder}
        clearLabel={t.clear}
        open={open}
        onClear={clearable ? () => setDate(null) : undefined}
        {...triggerProps}
      />
      <PickerContent>
        <Calendar
          autoFocus
          selected={date}
          onSelect={(d) => {
            setDate(d)
            if (d) setOpen(false)
          }}
          locale={locale}
          weekStartsOn={weekStartsOn}
          minDate={minDate}
          maxDate={maxDate}
          isDateDisabled={isDateDisabled}
        />
      </PickerContent>
    </PopoverPrimitive.Root>
  )
}

/* -------------------------------------------------------------------------------------------------
 * DateRangePicker
 * -----------------------------------------------------------------------------------------------*/

export interface DateRangePickerProps extends PickerBaseProps {
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (range: DateRange) => void
  /** @default 2 */
  numberOfMonths?: 1 | 2
}

export function DateRangePicker(props: DateRangePickerProps) {
  const {
    value,
    defaultValue = {},
    onValueChange,
    placeholder,
    labels,
    size: sizeProp,
    locale: localeProp,
    formatOptions = { dateStyle: 'medium' },
    weekStartsOn,
    minDate,
    maxDate,
    isDateDisabled,
    clearable = true,
    numberOfMonths = 2,
    ...triggerProps
  } = useFormControlProps(props)
  const [open, setOpen] = React.useState(false)
  const context = useLocale()
  const locale = localeProp ?? context.locale
  const size = useDefaultSize<InputSize>(sizeProp, controlSizeDefaults)
  const t = useMessages('datePicker', labels)
  const [range, setRange] = useControllableState<DateRange>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const format = new Intl.DateTimeFormat(locale, formatOptions)
  const text = range.from
    ? range.to
      ? `${format.format(range.from)} – ${format.format(range.to)}`
      : `${format.format(range.from)} – …`
    : null

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PickerTrigger
        size={size}
        text={text}
        placeholder={placeholder ?? t.rangePlaceholder}
        clearLabel={t.clear}
        open={open}
        onClear={clearable ? () => setRange({}) : undefined}
        {...triggerProps}
      />
      <PickerContent>
        <Calendar
          mode="range"
          autoFocus
          numberOfMonths={numberOfMonths}
          selected={range}
          onSelect={(r) => {
            setRange(r)
            if (r.from && r.to) setOpen(false)
          }}
          locale={locale}
          weekStartsOn={weekStartsOn}
          minDate={minDate}
          maxDate={maxDate}
          isDateDisabled={isDateDisabled}
        />
      </PickerContent>
    </PopoverPrimitive.Root>
  )
}
