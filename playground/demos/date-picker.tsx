import { useState } from 'react'
import {
  Calendar,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  DateTimePickerPanel,
  FormField,
  Text,
  type DateRange,
  type DateTimeValue,
} from '../../src'
import { Example } from '../components/demo'

const today = new Date()
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
/** The coming Monday (never today). */
const nextMonday = addDays(today, (8 - today.getDay()) % 7 || 7)

// Preset labels come from the app — the library has no built-in "Today" or "Tomorrow".
const datePresets = [
  { label: 'Today', date: today },
  { label: 'Tomorrow', date: addDays(today, 1) },
  { label: 'Next Monday', date: nextMonday },
  { label: 'No date', date: null },
]
const timeSuggestions = ['08:00', '09:00', '12:00', '14:00', '18:00', '20:00']

export default function DatePickerDemo() {
  const [date, setDate] = useState<Date | null>(today)
  const [range, setRange] = useState<DateRange>({})
  const [due, setDue] = useState<DateTimeValue>({ date: addDays(today, 1), time: '09:00' })
  const [reminder, setReminder] = useState<DateTimeValue>({ date: null, time: null })

  return (
    <div className="space-y-12">
      <Example
        title="Calendar"
        description="Arrow keys move by day/week, PageUp/PageDown by month (Shift for year), Home/End to week edges."
        pattern
      >
        <Calendar
          selected={date}
          onSelect={setDate}
          className="rounded-xl border bg-card shadow-xs"
        />
      </Example>

      <Example title="Range · two months · Vietnamese locale" pattern>
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={range}
          onSelect={setRange}
          locale="vi-VN"
          className="rounded-xl border bg-card shadow-xs"
        />
      </Example>

      <Example title="Date pickers" layout="stack" className="max-w-sm">
        <FormField label="Due date" description="Weekends are disabled.">
          <DatePicker isDateDisabled={isWeekend} minDate={today} />
        </FormField>
        <FormField label="Trip">
          <DateRangePicker />
        </FormField>
        <FormField label="Ngày sinh">
          <DatePicker
            locale="vi-VN"
            formatOptions={{ day: '2-digit', month: '2-digit', year: 'numeric' }}
            placeholder="dd/mm/yyyy"
            maxDate={today}
          />
        </FormField>
        <FormField label="Start" description="Quick picks close the popover.">
          <DatePicker presets={datePresets} />
        </FormField>
        <Text size="sm" tone="muted">
          Selected in the first calendar: {date ? date.toDateString() : 'none'}
        </Text>
      </Example>

      <Example
        title="Date & time"
        description='Quick picks, a calendar and a free-typed time: "830", "8h30", "20.00" and "8 pm" all work. Picking a day keeps it open; a quick pick, a suggested time or Enter closes it.'
        layout="stack"
        className="max-w-sm"
      >
        <FormField label="Due">
          <DateTimePicker
            value={due}
            onValueChange={setDue}
            presets={datePresets}
            timeSuggestions={timeSuggestions}
            allowAllDay
          />
        </FormField>
        <FormField label="Ngày hẹn" description="vi-VN: 24-hour times.">
          <DateTimePicker
            locale="vi-VN"
            timeSuggestions={['08:00', '13:30', '17:00']}
            allowAllDay
          />
        </FormField>
        <Text size="sm" tone="muted">
          Due value: {due.date ? due.date.toDateString() : 'none'} · {due.time ?? 'all day'}
        </Text>
      </Example>

      <Example
        title="Inline panel"
        description="DateTimePickerPanel (and DatePickerPanel / DateRangePickerPanel) is the picker without its trigger — put it in your own popover or straight in a page."
        pattern
      >
        <DateTimePickerPanel
          value={reminder}
          onValueChange={setReminder}
          presets={datePresets}
          timeSuggestions={timeSuggestions}
          allowAllDay
          className="rounded-xl border bg-card shadow-xs"
        />
      </Example>
    </div>
  )
}
