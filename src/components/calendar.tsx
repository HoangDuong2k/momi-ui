import * as React from 'react'
import { cn } from '../lib/cn'
import {
  addDays,
  addMonths,
  compareDays,
  isBetween,
  isSameDay,
  isSameMonth,
  monthGrid,
  startOfDay,
  startOfMonth,
  startOfWeek,
  type WeekStart,
} from '../lib/date'
import { ChevronLeftIcon, ChevronRightIcon } from '../lib/icons'
import { useControllableState } from '../lib/use-controllable-state'

export interface DateRange {
  from?: Date
  to?: Date
}

interface CalendarBaseProps extends Omit<React.ComponentProps<'div'>, 'onSelect' | 'defaultValue'> {
  /** Visible month (controlled). */
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  /** @default 1 */
  numberOfMonths?: 1 | 2
  /** 0 = Sunday, 1 = Monday… @default 1 */
  weekStartsOn?: WeekStart
  /** BCP 47 locale for month and weekday names, e.g. `vi-VN`. */
  locale?: string
  minDate?: Date
  maxDate?: Date
  /** Return true to disable a day. */
  isDateDisabled?: (date: Date) => boolean
  /** @default true */
  showOutsideDays?: boolean
  /** Focus the selected (or today's) day on mount. */
  autoFocus?: boolean
}

export interface CalendarSingleProps extends CalendarBaseProps {
  mode?: 'single'
  selected?: Date | null
  defaultSelected?: Date | null
  onSelect?: (date: Date | null) => void
}

export interface CalendarRangeProps extends CalendarBaseProps {
  mode: 'range'
  selected?: DateRange
  defaultSelected?: DateRange
  onSelect?: (range: DateRange) => void
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps

/** Month grid date picker with keyboard navigation, ranges, min/max and locale support. */
export function Calendar(props: CalendarProps) {
  const {
    month: monthProp,
    defaultMonth,
    onMonthChange,
    numberOfMonths = 1,
    weekStartsOn = 1,
    locale,
    minDate,
    maxDate,
    isDateDisabled,
    showOutsideDays = true,
    autoFocus,
    className,
    // Remove mode-specific props from the DOM spread.
    mode: _mode,
    selected: _selected,
    defaultSelected: _defaultSelected,
    onSelect: _onSelect,
    ...rest
  } = props as CalendarBaseProps & {
    mode?: string
    selected?: unknown
    defaultSelected?: unknown
    onSelect?: unknown
  }
  void _mode
  void _selected
  void _defaultSelected
  void _onSelect

  const isRange = props.mode === 'range'
  const today = React.useMemo(() => startOfDay(new Date()), [])

  const [single, setSingle] = useControllableState<Date | null>({
    value: isRange ? undefined : (props as CalendarSingleProps).selected,
    defaultValue: isRange ? null : ((props as CalendarSingleProps).defaultSelected ?? null),
    onChange: isRange ? undefined : (props as CalendarSingleProps).onSelect,
  })
  const [range, setRange] = useControllableState<DateRange>({
    value: isRange ? (props as CalendarRangeProps).selected : undefined,
    defaultValue: isRange ? ((props as CalendarRangeProps).defaultSelected ?? {}) : {},
    onChange: isRange ? (props as CalendarRangeProps).onSelect : undefined,
  })

  const anchor = isRange ? range.from : single
  const [month, setMonthState] = useControllableState<Date>({
    value: monthProp,
    defaultValue: startOfMonth(defaultMonth ?? anchor ?? today),
    onChange: onMonthChange,
  })
  const [focusDay, setFocusDay] = React.useState<Date>(() => anchor ?? today)
  const [hoverDay, setHoverDay] = React.useState<Date | null>(null)
  const gridRef = React.useRef<HTMLDivElement>(null)
  const shouldFocus = React.useRef(Boolean(autoFocus))

  const isDisabled = (day: Date) =>
    (minDate !== undefined && compareDays(day, minDate) < 0) ||
    (maxDate !== undefined && compareDays(day, maxDate) > 0) ||
    Boolean(isDateDisabled?.(day))

  const setMonth = (m: Date) => setMonthState(startOfMonth(m))

  const monthFormat = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
    [locale],
  )
  const weekdayFormat = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'short' }),
    [locale],
  )
  const dayLabelFormat = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [locale],
  )
  const weekdays = React.useMemo(() => {
    const start = startOfWeek(new Date(2024, 0, 7), weekStartsOn)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [weekStartsOn])

  // Move DOM focus to the focused day after keyboard navigation.
  React.useEffect(() => {
    if (!shouldFocus.current) return
    shouldFocus.current = false
    const key = focusDay.toDateString()
    gridRef.current
      ?.querySelectorAll<HTMLButtonElement>('button[data-day]')
      .forEach((btn) => btn.dataset.day === key && btn.focus())
  })

  const selectDay = (day: Date) => {
    if (isDisabled(day)) return
    setFocusDay(day)
    if (!isRange) {
      setSingle(isSameDay(single, day) ? null : day)
      return
    }
    const { from, to } = range
    if (!from || to) setRange({ from: day, to: undefined })
    else if (compareDays(day, from) < 0) setRange({ from: day, to: from })
    else setRange({ from, to: day })
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const moves: Record<string, (d: Date) => Date> = {
      ArrowLeft: (d) => addDays(d, -1),
      ArrowRight: (d) => addDays(d, 1),
      ArrowUp: (d) => addDays(d, -7),
      ArrowDown: (d) => addDays(d, 7),
      Home: (d) => startOfWeek(d, weekStartsOn),
      End: (d) => addDays(startOfWeek(d, weekStartsOn), 6),
      PageUp: (d) => addMonths(d, event.shiftKey ? -12 : -1),
      PageDown: (d) => addMonths(d, event.shiftKey ? 12 : 1),
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'
    const next =
      rtl && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
        ? addDays(focusDay, event.key === 'ArrowLeft' ? 1 : -1)
        : move(focusDay)
    setFocusDay(next)
    const lastVisible = addMonths(month, numberOfMonths - 1)
    if (compareDays(next, startOfMonth(month)) < 0) setMonth(next)
    else if (compareDays(next, addMonths(startOfMonth(lastVisible), 1)) >= 0)
      setMonth(addMonths(next, -(numberOfMonths - 1)))
    shouldFocus.current = true
  }

  const previewTo = isRange && range.from && !range.to ? hoverDay : null
  const months = Array.from({ length: numberOfMonths }, (_, i) => addMonths(month, i))
  const focusInView = months.some((m) => isSameMonth(m, focusDay))
  const tabbableDay = focusInView
    ? focusDay
    : anchor && months.some((m) => isSameMonth(m, anchor))
      ? anchor
      : startOfMonth(month)

  return (
    <div
      ref={gridRef}
      data-slot="calendar"
      className={cn('inline-block p-3', className)}
      onKeyDown={onKeyDown}
      {...rest}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        {months.map((m, index) => {
          const grid = monthGrid(m, weekStartsOn)
          return (
            <div key={m.toISOString()} className="flex flex-col gap-3">
              <div className="relative flex h-8 items-center justify-center">
                {index === 0 && (
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => setMonth(addMonths(month, -1))}
                    disabled={
                      minDate !== undefined && compareDays(startOfMonth(month), minDate) <= 0
                    }
                    className="absolute start-0 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-40"
                  >
                    <ChevronLeftIcon className="size-4 rtl:rotate-180" />
                  </button>
                )}
                <div aria-live="polite" className="text-sm font-medium capitalize">
                  {monthFormat.format(m)}
                </div>
                {index === months.length - 1 && (
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => setMonth(addMonths(month, 1))}
                    disabled={
                      maxDate !== undefined &&
                      compareDays(addMonths(startOfMonth(m), 1), maxDate) > 0
                    }
                    className="absolute end-0 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-40"
                  >
                    <ChevronRightIcon className="size-4 rtl:rotate-180" />
                  </button>
                )}
              </div>
              <table role="grid" aria-label={monthFormat.format(m)} className="border-collapse">
                <thead>
                  <tr>
                    {weekdays.map((w) => (
                      <th
                        key={w.getDay()}
                        scope="col"
                        abbr={new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(w)}
                        className="size-9 text-xs font-normal text-muted-foreground"
                      >
                        {weekdayFormat.format(w).slice(0, 2)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.map((week, w) => (
                    <tr key={w}>
                      {week.map((day) => {
                        const outside = !isSameMonth(day, m)
                        if (outside && !showOutsideDays)
                          return <td key={day.toISOString()} className="size-9" />
                        const disabled = isDisabled(day)
                        const from = range.from
                        const to = range.to ?? previewTo ?? undefined
                        const selected = isRange
                          ? isSameDay(day, from) || isSameDay(day, to)
                          : isSameDay(day, single)
                        const inRange = isRange && from && to ? isBetween(day, from, to) : false
                        const rangeStart =
                          isRange &&
                          from &&
                          to &&
                          isSameDay(day, compareDays(from, to) <= 0 ? from : to)
                        const rangeEnd =
                          isRange &&
                          from &&
                          to &&
                          isSameDay(day, compareDays(from, to) <= 0 ? to : from)
                        const isToday = isSameDay(day, today)
                        const tabbable = isSameDay(day, tabbableDay) && !outside
                        return (
                          <td
                            key={day.toISOString()}
                            role="gridcell"
                            aria-selected={selected || inRange || undefined}
                            className={cn(
                              'relative p-0 text-center',
                              inRange && 'bg-accent',
                              rangeStart &&
                                !rangeEnd &&
                                'rounded-s-md bg-linear-to-r from-transparent from-50% to-accent to-50% rtl:bg-linear-to-l',
                              rangeEnd &&
                                !rangeStart &&
                                'rounded-e-md bg-linear-to-l from-transparent from-50% to-accent to-50% rtl:bg-linear-to-r',
                            )}
                          >
                            <button
                              type="button"
                              data-day={day.toDateString()}
                              tabIndex={tabbable ? 0 : -1}
                              disabled={disabled}
                              aria-label={dayLabelFormat.format(day)}
                              aria-current={isToday ? 'date' : undefined}
                              aria-pressed={selected}
                              onClick={() => selectDay(day)}
                              onFocus={() => setFocusDay(day)}
                              onPointerEnter={() => isRange && setHoverDay(day)}
                              onPointerLeave={() => isRange && setHoverDay(null)}
                              className={cn(
                                'relative inline-flex size-9 items-center justify-center rounded-md text-sm tabular-nums transition-colors outline-none',
                                'hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40',
                                outside && 'text-muted-foreground/50',
                                isToday && !selected && 'font-semibold text-primary',
                                inRange && 'rounded-none hover:bg-foreground/10',
                                selected &&
                                  'bg-primary text-primary-foreground hover:bg-primary/90',
                                disabled &&
                                  'pointer-events-none text-muted-foreground/40 line-through',
                              )}
                            >
                              {day.getDate()}
                              {isToday && (
                                <span
                                  aria-hidden
                                  className={cn(
                                    'absolute bottom-1 size-1 rounded-full',
                                    selected ? 'bg-primary-foreground' : 'bg-primary',
                                  )}
                                />
                              )}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </div>
  )
}
