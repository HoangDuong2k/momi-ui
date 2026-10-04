import { useState } from 'react'
import { Calendar, DatePicker, DateRangePicker, FormField, Text, type DateRange } from '../../src'
import { Example } from '../components/demo'

const today = new Date()
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6

export default function DatePickerDemo() {
  const [date, setDate] = useState<Date | null>(today)
  const [range, setRange] = useState<DateRange>({})

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
        <Text size="sm" tone="muted">
          Selected in the first calendar: {date ? date.toDateString() : 'none'}
        </Text>
      </Example>
    </div>
  )
}
