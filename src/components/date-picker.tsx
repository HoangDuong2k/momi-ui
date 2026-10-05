import { Popover as PopoverPrimitive } from 'radix-ui'
import * as React from 'react'
import { useLocale, useMessages } from '../i18n/locale-provider'
import type { MomiMessages } from '../i18n/messages'
import { cn } from '../lib/cn'
import { isSameDay, startOfDay, startOfMonth, type WeekStart } from '../lib/date'
import { useControllableState } from '../lib/use-controllable-state'
import { Calendar, type DateRange } from './calendar'
import { useDefaultSize } from './density-provider'
import { useFormControlProps } from './form-field'
import { controlSizeDefaults, type InputSize } from './input'
import {
  isDayDisabled,
  PickerContent,
  PickerTrigger,
  presetButtonClass,
  type PickerBaseProps,
} from './internal/picker'

/** Shared by the calendar panels. */
interface PanelBaseProps {
  /** BCP 47 locale for month and weekday names. Defaults to `LocaleProvider`'s. */
  locale?: string
  weekStartsOn?: WeekStart
  minDate?: Date
  maxDate?: Date
  isDateDisabled?: (date: Date) => boolean
  /** Focus the selected (or today's) day on mount. */
  autoFocus?: boolean
  /** Override built-in text for this instance. */
  labels?: Partial<MomiMessages['datePicker']>
  className?: string
}

/* -------------------------------------------------------------------------------------------------
 * DatePickerPanel
 * -----------------------------------------------------------------------------------------------*/

export interface DatePickerPreset {
  label: React.ReactNode
  /** `null` clears the date (e.g. "No date"). */
  date: Date | null
}

export interface DatePickerPanelProps extends PanelBaseProps {
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (date: Date | null) => void
  /** Quick picks shown above the calendar, e.g. Today / Tomorrow. The words come from your app. */
  presets?: DatePickerPreset[]
  /** Called when the user picks a day or a preset — also when it is already the value. */
  onPick?: (date: Date | null, via: 'calendar' | 'preset') => void
}

/**
 * The body of `DatePicker` — optional quick picks and a calendar — without a trigger or popover,
 * to place inline or in your own Popover.
 */
export function DatePickerPanel({
  value,
  defaultValue = null,
  onValueChange,
  presets,
  onPick,
  locale: localeProp,
  weekStartsOn,
  minDate,
  maxDate,
  isDateDisabled,
  autoFocus,
  labels,
  className,
}: DatePickerPanelProps) {
  const context = useLocale()
  const locale = localeProp ?? context.locale
  const t = useMessages('datePicker', labels)
  const [date, setDate] = useControllableState<Date | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  // Controlled here so a preset in another month brings that month into view.
  const [month, setMonth] = React.useState(() => startOfMonth(date ?? new Date()))
  const limits = { minDate, maxDate, isDateDisabled }

  return (
    <div data-slot="date-picker-panel" className={cn('flex w-min flex-col', className)}>
      {presets && presets.length > 0 && (
        <div role="group" aria-label={t.presets} className="flex flex-wrap gap-1.5 border-b p-3">
          {presets.map((preset, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={preset.date ? isSameDay(preset.date, date) : date === null}
              disabled={preset.date !== null && isDayDisabled(preset.date, limits)}
              onClick={() => {
                const next = preset.date && startOfDay(preset.date)
                setDate(next)
                if (next) setMonth(startOfMonth(next))
                onPick?.(next, 'preset')
              }}
              className={presetButtonClass}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
      <Calendar
        autoFocus={autoFocus}
        month={month}
        onMonthChange={setMonth}
        selected={date}
        onSelect={(d) => {
          setDate(d)
          onPick?.(d, 'calendar')
        }}
        locale={locale}
        weekStartsOn={weekStartsOn}
        minDate={minDate}
        maxDate={maxDate}
        isDateDisabled={isDateDisabled}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * DateRangePickerPanel
 * -----------------------------------------------------------------------------------------------*/

export interface DateRangePreset {
  label: React.ReactNode
  /** `{}` clears the range. */
  range: DateRange
}

export interface DateRangePickerPanelProps extends PanelBaseProps {
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (range: DateRange) => void
  /** Quick picks shown above the calendar, e.g. Last 7 days. The words come from your app. */
  presets?: DateRangePreset[]
  /** Called when the user picks a day or a preset. */
  onPick?: (range: DateRange, via: 'calendar' | 'preset') => void
  /** @default 2 */
  numberOfMonths?: 1 | 2
}

/** The body of `DateRangePicker` without a trigger or popover. */
export function DateRangePickerPanel({
  value,
  defaultValue = {},
  onValueChange,
  presets,
  onPick,
  numberOfMonths = 2,
  locale: localeProp,
  weekStartsOn,
  minDate,
  maxDate,
  isDateDisabled,
  autoFocus,
  labels,
  className,
}: DateRangePickerPanelProps) {
  const context = useLocale()
  const locale = localeProp ?? context.locale
  const t = useMessages('datePicker', labels)
  const [range, setRange] = useControllableState<DateRange>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [month, setMonth] = React.useState(() => startOfMonth(range.from ?? new Date()))
  const limits = { minDate, maxDate, isDateDisabled }

  return (
    <div data-slot="date-range-picker-panel" className={cn('flex w-min flex-col', className)}>
      {presets && presets.length > 0 && (
        <div role="group" aria-label={t.presets} className="flex flex-wrap gap-1.5 border-b p-3">
          {presets.map((preset, i) => {
            const { from, to } = preset.range
            return (
              <button
                key={i}
                type="button"
                aria-pressed={
                  from || to
                    ? isSameDay(from, range.from) && isSameDay(to, range.to)
                    : !range.from && !range.to
                }
                disabled={
                  (from !== undefined && isDayDisabled(from, limits)) ||
                  (to !== undefined && isDayDisabled(to, limits))
                }
                onClick={() => {
                  const next: DateRange = {
                    from: from && startOfDay(from),
                    to: to && startOfDay(to),
                  }
                  setRange(next)
                  if (next.from) setMonth(startOfMonth(next.from))
                  onPick?.(next, 'preset')
                }}
                className={presetButtonClass}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      )}
      <Calendar
        mode="range"
        autoFocus={autoFocus}
        numberOfMonths={numberOfMonths}
        month={month}
        onMonthChange={setMonth}
        selected={range}
        onSelect={(r) => {
          setRange(r)
          onPick?.(r, 'calendar')
        }}
        locale={locale}
        weekStartsOn={weekStartsOn}
        minDate={minDate}
        maxDate={maxDate}
        isDateDisabled={isDateDisabled}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * DatePicker
 * -----------------------------------------------------------------------------------------------*/

export interface DatePickerProps extends PickerBaseProps {
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (date: Date | null) => void
  /** Quick picks shown above the calendar. Picking one closes the popover. */
  presets?: DatePickerPreset[]
  /** @default messages.datePicker.placeholder */
  placeholder?: string
  /** Override built-in text for this instance. */
  labels?: Partial<MomiMessages['datePicker']>
}

export function DatePicker(props: DatePickerProps) {
  const {
    value,
    defaultValue = null,
    onValueChange,
    presets,
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
    container,
    collisionBoundary,
    collisionPadding,
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
      <PickerContent
        container={container}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
      >
        <DatePickerPanel
          autoFocus
          value={date}
          onValueChange={setDate}
          presets={presets}
          onPick={(d, via) => {
            if (d || via === 'preset') setOpen(false)
          }}
          locale={locale}
          weekStartsOn={weekStartsOn}
          minDate={minDate}
          maxDate={maxDate}
          isDateDisabled={isDateDisabled}
          labels={labels}
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
  /** Quick picks shown above the calendar. Picking one closes the popover. */
  presets?: DateRangePreset[]
  /** @default 2 */
  numberOfMonths?: 1 | 2
  /** @default messages.datePicker.rangePlaceholder */
  placeholder?: string
  /** Override built-in text for this instance. */
  labels?: Partial<MomiMessages['datePicker']>
}

export function DateRangePicker(props: DateRangePickerProps) {
  const {
    value,
    defaultValue = {},
    onValueChange,
    presets,
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
    container,
    collisionBoundary,
    collisionPadding,
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
      <PickerContent
        container={container}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
      >
        <DateRangePickerPanel
          autoFocus
          numberOfMonths={numberOfMonths}
          value={range}
          onValueChange={setRange}
          presets={presets}
          onPick={(r, via) => {
            if ((r.from && r.to) || via === 'preset') setOpen(false)
          }}
          locale={locale}
          weekStartsOn={weekStartsOn}
          minDate={minDate}
          maxDate={maxDate}
          isDateDisabled={isDateDisabled}
          labels={labels}
        />
      </PickerContent>
    </PopoverPrimitive.Root>
  )
}
