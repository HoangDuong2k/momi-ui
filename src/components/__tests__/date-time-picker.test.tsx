import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/locale-provider'
import { vi as viMessages } from '../../i18n/vi'
import { formatTime, parseTime } from '../../lib/time'
import { DatePicker, DatePickerPanel, DateRangePickerPanel } from '../date-picker'
import { DateTimePicker, DateTimePickerPanel, type DateTimeValue } from '../date-time-picker'
import { Dialog, DialogContent, DialogTitle } from '../dialog'
import { FormField } from '../form-field'

describe('parseTime', () => {
  it('reads back what formatTime shows, in any locale and hour cycle', () => {
    const locales = [
      'en-US',
      'vi-VN',
      'ko-KR',
      'zh-TW',
      'zh-CN',
      'ja-JP',
      'tr-TR',
      'ar-EG',
      'fa-IR',
    ]
    const more = ['bn-BD', 'sv-SE', 'fi-FI', 'es-ES', 'fr-CA', 'my-MM', 'ne-NP', 'el-GR', 'am-ET']
    const wrong: string[] = []
    for (const locale of [...locales, ...more]) {
      for (const cycle of [undefined, 'h12', 'h23'] as const) {
        for (const time of ['00:05', '08:30', '12:00', '20:30', '23:59']) {
          const shown = formatTime(time, locale, cycle)
          if (parseTime(shown, locale) !== time) wrong.push(`${locale} ${cycle}: ${shown}`)
        }
      }
    }
    expect(wrong).toEqual([])
  })

  it.each([
    ['830', '08:30'],
    ['0830', '08:30'],
    ['8', '08:00'],
    ['20', '20:00'],
    ['8:30', '08:30'],
    ['8.30', '08:30'],
    ['20.00', '20:00'],
    ['8h30', '08:30'],
    ['8h', '08:00'],
    ['  2000 ', '20:00'],
    ['8 pm', '20:00'],
    ['8:30PM', '20:30'],
    ['8:30 p.m.', '20:30'],
    ['12am', '00:00'],
    ['12 pm', '12:00'],
    ['7a', '07:00'],
    ['8:30 CH', '20:30'],
    ['9 SA', '09:00'],
    ['0:05', '00:05'],
    ['23:59', '23:59'],
  ])('reads %j as %s', (input, expected) => {
    expect(parseTime(input)).toBe(expected)
  })

  it.each(['', 'abc', '24:00', '8:60', '13pm', '0am', '8:3', '12345', '8:30:00', 'h30', 'pm'])(
    'rejects %j',
    (input) => {
      expect(parseTime(input)).toBeNull()
    },
  )

  it('round-trips locale formatting', () => {
    for (const locale of ['en-US', 'vi-VN', 'de-DE']) {
      expect(parseTime(formatTime('20:30', locale))).toBe('20:30')
    }
  })

  it('formats with the locale convention or a forced hour cycle', () => {
    expect(formatTime('08:30', 'vi-VN')).toBe('08:30')
    expect(formatTime('20:30', 'en-US', 'h23')).toBe('20:30')
    expect(formatTime('20:30', 'en-US').replace(/\s/g, ' ')).toBe('8:30 PM')
  })
})

describe('DatePickerPanel', () => {
  it('picks presets and brings their month into view', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onPick = vi.fn()
    render(
      <DatePickerPanel
        locale="en-US"
        defaultValue={new Date(2026, 9, 5)}
        onValueChange={onValueChange}
        onPick={onPick}
        presets={[
          { label: 'New year', date: new Date(2027, 0, 1) },
          { label: 'No date', date: null },
        ]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'New year' }))
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2027, 0, 1))
    expect(onPick).toHaveBeenLastCalledWith(new Date(2027, 0, 1), 'preset')
    expect(screen.getByRole('grid', { name: 'January 2027' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New year' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'No date' }))
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })

  it('disables presets outside the allowed range', () => {
    render(
      <DatePickerPanel
        minDate={new Date(2026, 9, 5)}
        presets={[{ label: 'Yesterday', date: new Date(2026, 9, 4) }]}
      />,
    )
    expect(screen.getByRole('button', { name: 'Yesterday' })).toBeDisabled()
  })

  it('closes DatePicker after a preset', async () => {
    const user = userEvent.setup()
    render(
      <DatePicker
        aria-label="Due"
        locale="en-US"
        presets={[{ label: 'Launch', date: new Date(2026, 10, 2) }]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Due' }))
    await user.click(screen.getByRole('button', { name: 'Launch' }))
    expect(screen.getByRole('button', { name: 'Due' })).toHaveTextContent('Nov 2, 2026')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('range presets set both ends', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateRangePickerPanel
        numberOfMonths={1}
        onValueChange={onValueChange}
        presets={[
          { label: 'First week', range: { from: new Date(2026, 9, 1), to: new Date(2026, 9, 7) } },
        ]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'First week' }))
    expect(onValueChange).toHaveBeenCalledWith({
      from: new Date(2026, 9, 1),
      to: new Date(2026, 9, 7),
    })
  })
})

const today = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

describe('DateTimePickerPanel', () => {
  it('normalizes typed times on Enter and blur, and restores invalid input', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onPick = vi.fn()
    render(
      <DateTimePickerPanel
        locale="vi-VN"
        defaultValue={{ date: new Date(2026, 9, 5), time: null }}
        onValueChange={onValueChange}
        onPick={onPick}
      />,
    )
    const input = screen.getByLabelText('Time')
    await user.click(input)
    await user.keyboard('8h30{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith({ date: new Date(2026, 9, 5), time: '08:30' })
    expect(onPick).toHaveBeenLastCalledWith({ date: new Date(2026, 9, 5), time: '08:30' }, 'time')
    expect(input).toHaveValue('08:30')

    await user.clear(input)
    await user.type(input, '2000')
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith({ date: new Date(2026, 9, 5), time: '20:00' })

    await user.clear(input)
    await user.type(input, 'soon')
    await user.tab()
    expect(input).toHaveValue('20:00')
    expect(onValueChange).toHaveBeenCalledTimes(2)
  })

  it('suggested times, all day, and a time without a date lands on today', async () => {
    const user = userEvent.setup()
    const values: DateTimeValue[] = []
    render(
      <DateTimePickerPanel
        locale="en-GB"
        timeSuggestions={['9:00', '14:00']}
        allowAllDay
        onValueChange={(v) => values.push(v)}
      />,
    )
    await user.click(screen.getByRole('button', { name: '14:00' }))
    expect(values.at(-1)).toEqual({ date: today(), time: '14:00' })
    expect(screen.getByRole('button', { name: '14:00' })).toHaveAttribute('aria-pressed', 'true')

    const allDay = screen.getByRole('button', { name: 'All day' })
    await user.click(allDay)
    expect(values.at(-1)).toEqual({ date: today(), time: null })
    expect(allDay).toHaveAttribute('aria-pressed', 'true')
    // Switching it off brings the last time back.
    await user.click(allDay)
    expect(values.at(-1)).toEqual({ date: today(), time: '14:00' })
  })

  it('presets can set the time or keep it; clearing the date clears the time', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateTimePickerPanel
        defaultValue={{ date: new Date(2026, 9, 5), time: '10:00' }}
        onValueChange={onValueChange}
        presets={[
          { label: 'Keep time', date: new Date(2026, 9, 6) },
          { label: 'Evening', date: new Date(2026, 9, 6), time: '19:00' },
          { label: 'Clear', date: null },
        ]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Keep time' }))
    expect(onValueChange).toHaveBeenLastCalledWith({ date: new Date(2026, 9, 6), time: '10:00' })
    await user.click(screen.getByRole('button', { name: 'Evening' }))
    expect(onValueChange).toHaveBeenLastCalledWith({ date: new Date(2026, 9, 6), time: '19:00' })
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onValueChange).toHaveBeenLastCalledWith({ date: null, time: null })
  })

  it('keeps the calendar keyboard navigation', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateTimePickerPanel
        locale="en-US"
        autoFocus
        defaultValue={{ date: new Date(2026, 9, 5), time: '09:00' }}
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('button', { name: 'Monday, October 5, 2026' })).toHaveFocus()
    await user.keyboard('{ArrowRight}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith({ date: new Date(2026, 9, 6), time: '09:00' })
  })

  it('Escape in the time input restores the field', async () => {
    const user = userEvent.setup()
    render(<DateTimePickerPanel defaultValue={{ date: new Date(2026, 9, 5), time: '09:00' }} />)
    const input = screen.getByLabelText('Time')
    await user.click(input)
    await user.keyboard('7{Escape}')
    expect(input).toHaveValue(formatTime('09:00'))
  })

  it('Escape while editing the time keeps the popover or dialog around it open', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <>
        <DateTimePicker
          aria-label="Reminder"
          defaultValue={{ date: new Date(2026, 9, 5), time: '09:00' }}
        />
        <Dialog open onOpenChange={onOpenChange}>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Edit</DialogTitle>
            <DateTimePickerPanel defaultValue={{ date: new Date(2026, 9, 5), time: '09:00' }} />
          </DialogContent>
        </Dialog>
      </>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Edit' })
    const inline = within(dialog).getByLabelText('Time')
    await user.click(inline)
    await user.keyboard('7{Escape}')
    expect(inline).toHaveValue(formatTime('09:00'))
    expect(onOpenChange).not.toHaveBeenCalled()
    // Not editing: Escape closes as usual.
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('a time without a date lands on the first allowed day', async () => {
    const user = userEvent.setup()
    const values: DateTimeValue[] = []
    const tomorrow = new Date(today().getFullYear(), today().getMonth(), today().getDate() + 1)
    render(
      <DateTimePickerPanel
        locale="en-GB"
        minDate={tomorrow}
        timeSuggestions={['9:00']}
        onValueChange={(v) => values.push(v)}
      />,
    )
    await user.click(screen.getByRole('button', { name: '09:00' }))
    expect(values.at(-1)).toEqual({ date: tomorrow, time: '09:00' })
  })

  it('sets no time when no day is allowed', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateTimePickerPanel
        locale="en-GB"
        isDateDisabled={() => true}
        timeSuggestions={['9:00']}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: '09:00' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('DateTimePicker', () => {
  it('shows date and time in the trigger and closes after a suggested time', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateTimePicker
        aria-label="Reminder"
        locale="en-US"
        defaultValue={{ date: new Date(2026, 9, 5), time: null }}
        timeSuggestions={['09:00']}
        onValueChange={onValueChange}
      />,
    )
    const trigger = screen.getByRole('button', { name: 'Reminder' })
    expect(trigger).toHaveTextContent('Oct 5, 2026')
    await user.click(trigger)
    // Picking a day keeps it open for the time.
    await user.click(screen.getByRole('button', { name: 'Tuesday, October 6, 2026' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /9:00/ }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onValueChange).toHaveBeenLastCalledWith({ date: new Date(2026, 9, 6), time: '09:00' })
    expect(trigger.textContent?.replace(/\s/g, ' ')).toContain('Oct 6, 2026, 9:00 AM')
  })

  it('uses Vietnamese text and 24-hour times, and works in a FormField', () => {
    render(
      <LocaleProvider locale="vi-VN" messages={viMessages}>
        <FormField label="Hạn">
          <DateTimePicker defaultValue={{ date: new Date(2026, 9, 5), time: '20:30' }} />
        </FormField>
        <DateTimePicker aria-label="Trống" />
      </LocaleProvider>,
    )
    const trigger = screen.getByRole('button', { name: 'Hạn' })
    expect(trigger).toHaveTextContent('20:30')
    expect(screen.getByRole('button', { name: 'Trống' })).toHaveTextContent('Chọn ngày và giờ')
  })

  it('clears both date and time', () => {
    const onValueChange = vi.fn()
    render(
      <DateTimePicker
        aria-label="When"
        defaultValue={{ date: new Date(2026, 9, 5), time: '08:00' }}
        onValueChange={onValueChange}
      />,
    )
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Clear' }))
    expect(onValueChange).toHaveBeenCalledWith({ date: null, time: null })
  })
})
