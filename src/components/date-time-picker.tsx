import { Popover as PopoverPrimitive } from 'radix-ui'
import * as React from 'react'
import { useLocale, useMessages } from '../i18n/locale-provider'
import type { MomiMessages } from '../i18n/messages'
import { cn } from '../lib/cn'
import { isSameDay, startOfDay, startOfMonth, type WeekStart } from '../lib/date'
import { formatTime, parseTime, type TimeString } from '../lib/time'
import { useControllableState } from '../lib/use-controllable-state'
import { useEscapeGuard } from '../lib/use-escape-guard'
import { Calendar } from './calendar'
import { useDefaultSize } from './density-provider'
import { useFormControlProps } from './form-field'
import { controlSizeDefaults, inputVariants, type InputSize } from './input'
import {
  ClockIcon,
  isDayDisabled,
  PickerContent,
  PickerTrigger,
  presetButtonClass,
  type PickerBaseProps,
} from './internal/picker'

/**
 * The day a time lands on when no date is set: today, or the first allowed day after it (within a
 * year), or `null` when none is allowed.
 */
function defaultDay(limits: Parameters<typeof isDayDisabled>[1]) {
  const today = startOfDay(new Date())
  const min = limits.minDate ? startOfDay(limits.minDate) : null
  const day = min && min > today ? min : today
  for (let i = 0; i < 366; i++) {
    if (!isDayDisabled(day, limits)) return day
    if (limits.maxDate && day > limits.maxDate) break
    day.setDate(day.getDate() + 1)
  }
  return null
}

/** A date with an optional time of day. `time: null` means no time (all day). */
export interface DateTimeValue {
  date: Date | null
  /** "HH:mm", 24-hour. */
  time: TimeString | null
}

export interface DateTimePreset {
  label: React.ReactNode
  /** `null` clears the value (e.g. "No date"). */
  date: Date | null
  /** Set the time too; `null` = all day. Leave it out to keep the current time. */
  time?: TimeString | null
}

const EMPTY: DateTimeValue = { date: null, time: null }

interface DateTimeOptions {
  /** Quick picks above the calendar, e.g. Today / Tomorrow / No date. The words come from your app. */
  presets?: DateTimePreset[]
  /** Times offered as one-click choices under the time input, e.g. `['09:00', '14:00']`. */
  timeSuggestions?: TimeString[]
  /** Offer an "All day" toggle that clears the time. */
  allowAllDay?: boolean
  /** Force 12-hour (`'h12'`) or 24-hour (`'h23'`) display. Defaults to the locale's convention. */
  hourCycle?: 'h12' | 'h23'
  /** Override built-in text for this instance. */
  labels?: Partial<MomiMessages['dateTimePicker']>
}

/* -------------------------------------------------------------------------------------------------
 * DateTimePickerPanel
 * -----------------------------------------------------------------------------------------------*/

export interface DateTimePickerPanelProps extends DateTimeOptions {
  value?: DateTimeValue
  defaultValue?: DateTimeValue
  onValueChange?: (value: DateTimeValue) => void
  /**
   * Called after a pick that usually ends the choice: a preset, a suggested time, or Enter in the
   * time input (`DateTimePicker` closes its popover then).
   */
  onPick?: (value: DateTimeValue, via: 'calendar' | 'preset' | 'time') => void
  /** BCP 47 locale. Defaults to `LocaleProvider`'s. */
  locale?: string
  weekStartsOn?: WeekStart
  minDate?: Date
  maxDate?: Date
  isDateDisabled?: (date: Date) => boolean
  /** Focus the selected (or today's) day on mount. */
  autoFocus?: boolean
  className?: string
}

/**
 * The body of `DateTimePicker` — quick picks, a calendar, a time input with suggestions and an
 * "All day" toggle — without a trigger or popover, to place inline or in your own Popover.
 * Typed times accept "830", "8h30", "20.00", "8 pm"…
 */
export function DateTimePickerPanel({
  value,
  defaultValue = EMPTY,
  onValueChange,
  onPick,
  presets,
  timeSuggestions,
  allowAllDay = false,
  hourCycle,
  labels,
  locale: localeProp,
  weekStartsOn,
  minDate,
  maxDate,
  isDateDisabled,
  autoFocus,
  className,
}: DateTimePickerPanelProps) {
  const context = useLocale()
  const locale = localeProp ?? context.locale
  const t = useMessages('dateTimePicker', labels)
  const timeInputId = React.useId()
  const [current, setCurrent] = useControllableState<DateTimeValue>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [month, setMonth] = React.useState(() => startOfMonth(current.date ?? new Date()))
  const [draft, setDraft] = React.useState<string | null>(null)
  // The time to bring back when "All day" is switched off again.
  const lastTimeRef = React.useRef<TimeString | null>(current.time)
  const limits = { minDate, maxDate, isDateDisabled }
  // While the time field holds an edit, Escape restores it instead of closing what's around it.
  const isGuardedEscape = useEscapeGuard(draft !== null)

  const suggestions = React.useMemo(
    () =>
      (timeSuggestions ?? []).map((s) => parseTime(s)).filter((s): s is TimeString => s !== null),
    [timeSuggestions],
  )

  const change = (next: DateTimeValue) => {
    if (next.time) lastTimeRef.current = next.time
    setCurrent(next)
    return next
  }

  /** A time needs a day: without one, it lands on today (or the first allowed day, if any). */
  const setTime = (time: TimeString | null) => {
    const date = current.date ?? (time ? defaultDay(limits) : null)
    if (time && !date) return current
    return change({ date, time })
  }

  function commitDraft() {
    if (draft === null) return current
    setDraft(null)
    const text = draft.trim()
    if (text === '') return allowAllDay && current.time !== null ? setTime(null) : current
    const parsed = parseTime(text, locale)
    // Not a time: the field goes back to the previous value.
    return parsed && parsed !== current.time ? setTime(parsed) : current
  }

  const allDay = current.date !== null && current.time === null
  const shownTime = draft ?? (current.time ? formatTime(current.time, locale, hourCycle) : '')

  return (
    <div data-slot="date-time-picker-panel" className={cn('flex w-min flex-col', className)}>
      {presets && presets.length > 0 && (
        <div role="group" aria-label={t.presets} className="flex flex-wrap gap-1.5 border-b p-3">
          {presets.map((preset, i) => {
            const pressed = preset.date
              ? isSameDay(preset.date, current.date) &&
                (preset.time === undefined || preset.time === current.time)
              : current.date === null
            return (
              <button
                key={i}
                type="button"
                aria-pressed={pressed}
                disabled={preset.date !== null && isDayDisabled(preset.date, limits)}
                onClick={() => {
                  const date = preset.date && startOfDay(preset.date)
                  const time =
                    date === null ? null : preset.time === undefined ? current.time : preset.time
                  setDraft(null)
                  const next = change({ date, time })
                  if (date) setMonth(startOfMonth(date))
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
        autoFocus={autoFocus}
        month={month}
        onMonthChange={setMonth}
        selected={current.date}
        onSelect={(date) => {
          const next = change({ date, time: date ? current.time : null })
          onPick?.(next, 'calendar')
        }}
        locale={locale}
        weekStartsOn={weekStartsOn}
        minDate={minDate}
        maxDate={maxDate}
        isDateDisabled={isDateDisabled}
      />

      <div data-slot="date-time-picker-time" className="grid gap-2 border-t p-3">
        <div className="flex items-center gap-2">
          <label htmlFor={timeInputId} className="sr-only">
            {t.time}
          </label>
          <div className="relative w-28">
            <ClockIcon className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              id={timeInputId}
              data-slot="date-time-picker-time-input"
              value={shownTime}
              placeholder={t.timePlaceholder}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={(e) => e.currentTarget.select()}
              onBlur={() => commitDraft()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  // Commit first: `onPick?.(commitDraft())` would skip the commit without onPick.
                  const next = commitDraft()
                  onPick?.(next, 'time')
                } else if (e.key === 'Escape' && isGuardedEscape(e.nativeEvent)) {
                  // Restore the field; the guard already kept the popover (or dialog) open.
                  setDraft(null)
                }
              }}
              className={cn(inputVariants({ size: 'sm' }), 'ps-8 tabular-nums')}
            />
          </div>
          {allowAllDay && (
            <button
              type="button"
              aria-pressed={allDay}
              onClick={() => {
                setDraft(null)
                if (allDay) setTime(lastTimeRef.current ?? suggestions[0] ?? '09:00')
                else {
                  const date = current.date ?? defaultDay(limits)
                  if (date) change({ date, time: null })
                }
              }}
              className={cn(presetButtonClass, 'ms-auto')}
            >
              {t.allDay}
            </button>
          )}
        </div>
        {suggestions.length > 0 && (
          <div role="group" aria-label={t.suggestions} className="flex flex-wrap gap-1">
            {suggestions.map((time) => (
              <button
                key={time}
                type="button"
                aria-pressed={current.time === time}
                onClick={() => {
                  setDraft(null)
                  const next = setTime(time)
                  onPick?.(next, 'time')
                }}
                className={cn(presetButtonClass, 'h-6 px-2 tabular-nums')}
              >
                {formatTime(time, locale, hourCycle)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * DateTimePicker
 * -----------------------------------------------------------------------------------------------*/

export interface DateTimePickerProps extends PickerBaseProps, DateTimeOptions {
  value?: DateTimeValue
  defaultValue?: DateTimeValue
  onValueChange?: (value: DateTimeValue) => void
  /** @default messages.dateTimePicker.placeholder */
  placeholder?: string
}

/** Trigger text: the date, plus the time when there is one, in the locale's own order. */
function formatDateTime(
  { date, time }: DateTimeValue,
  locale: string | undefined,
  formatOptions: Intl.DateTimeFormatOptions,
  hourCycle: 'h12' | 'h23' | undefined,
) {
  if (!date) return null
  if (!time) return new Intl.DateTimeFormat(locale, formatOptions).format(date)
  const [hour, minute] = time.split(':').map(Number)
  const at = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute)
  // `dateStyle` can't be mixed with `hour` / `minute`, only with `timeStyle`.
  const styled = formatOptions.dateStyle !== undefined || formatOptions.timeStyle !== undefined
  const options: Intl.DateTimeFormatOptions = styled
    ? { ...formatOptions, timeStyle: formatOptions.timeStyle ?? 'short', hourCycle }
    : { ...formatOptions, hour: 'numeric', minute: '2-digit', hourCycle }
  return new Intl.DateTimeFormat(locale, options).format(at)
}

/** A date and an optional time in one field — for due dates, reminders and events. */
export function DateTimePicker(props: DateTimePickerProps) {
  const {
    value,
    defaultValue = EMPTY,
    onValueChange,
    presets,
    timeSuggestions,
    allowAllDay,
    hourCycle,
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
  const t = useMessages('dateTimePicker', labels)
  const [current, setCurrent] = useControllableState<DateTimeValue>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const text = formatDateTime(current, locale, formatOptions, hourCycle)

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PickerTrigger
        size={size}
        text={text}
        placeholder={placeholder ?? t.placeholder}
        clearLabel={t.clear}
        open={open}
        onClear={clearable ? () => setCurrent(EMPTY) : undefined}
        {...triggerProps}
      />
      <PickerContent
        container={container}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
      >
        <DateTimePickerPanel
          autoFocus
          value={current}
          onValueChange={setCurrent}
          onPick={(_, via) => {
            if (via !== 'calendar') setOpen(false)
          }}
          presets={presets}
          timeSuggestions={timeSuggestions}
          allowAllDay={allowAllDay}
          hourCycle={hourCycle}
          labels={labels}
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
