import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useShortcut, type Shortcut, type UseShortcutOptions } from '../../lib/shortcut'
import { Calendar } from '../calendar'
import { Combobox } from '../combobox'
import { EventCalendar, type CalendarEvent } from '../event-calendar'
import { FormField } from '../form-field'
import { ToggleGroup, ToggleGroupItem } from '../toggle-group'

afterEach(() => {
  vi.restoreAllMocks()
})

const headers = () => screen.getAllByRole('columnheader').map((th) => th.textContent)

describe('Calendar weekday headers', () => {
  it('tells the days apart in every locale', () => {
    const { unmount } = render(<Calendar locale="vi-VN" defaultMonth={new Date(2026, 9, 1)} />)
    expect(headers()).toEqual(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'])
    unmount()
    render(<Calendar locale="en-US" defaultMonth={new Date(2026, 9, 1)} weekStartsOn={0} />)
    expect(headers()).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'])
  })
})

describe('EventCalendar in a narrow container', () => {
  const events: CalendarEvent[] = [
    { id: 'a', title: 'Standup', start: new Date(2026, 9, 6, 9), end: new Date(2026, 9, 6, 10) },
  ]

  it('stacks day headers and slims the hour gutter when the columns are narrow', () => {
    const original = HTMLElement.prototype.getBoundingClientRect
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      // The time grid's root is the first child of the calendar, after the toolbar.
      if (this.parentElement?.dataset.slot === 'event-calendar') {
        return { width: 390, height: 600, top: 0, left: 0, right: 390, bottom: 600 } as DOMRect
      }
      return original.call(this)
    })
    render(
      <EventCalendar
        events={events}
        locale="vi-VN"
        defaultView="week"
        defaultDate={new Date(2026, 9, 6)}
      />,
    )
    const grid = document.querySelector('[data-narrow]')
    expect(grid).toBeInTheDocument()
    const tuesday = screen.getByRole('button', { name: /6 tháng 10, 2026/ })
    expect(tuesday).toHaveClass('flex-col')
    expect(tuesday).toHaveTextContent('T36')
  })

  it('keeps long agenda titles inside the row', () => {
    render(
      <EventCalendar
        events={[{ ...events[0], title: 'A very long title '.repeat(10) }]}
        defaultView="agenda"
        defaultDate={new Date(2026, 9, 6)}
      />,
    )
    const agenda = document.querySelector('[data-slot="event-calendar-agenda"]')!
    expect(agenda).toHaveClass('@container/agenda')
    const list = agenda.querySelector('ul')!
    expect(list).toHaveClass('grid-cols-[minmax(0,1fr)]')
    expect(within(list).getByText(/A very long title/)).toHaveClass('min-w-0', 'truncate')
  })
})

describe('Combobox multiple', () => {
  it('clears the search after picking, so the next search starts afresh', async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        multiple
        aria-label="Fruit"
        options={[
          { value: 'apple', label: 'Apple' },
          { value: 'apricot', label: 'Apricot' },
          { value: 'banana', label: 'Banana' },
        ]}
      />,
    )
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }))
    const input = screen.getByPlaceholderText('Search…')
    await user.type(input, 'ap')
    await user.click(screen.getByRole('option', { name: 'Apple' }))
    expect(input).toHaveValue('')
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument()
  })
})

describe('ToggleGroup in a FormField', () => {
  it('takes the field label, description, error and disabled state', () => {
    render(
      <FormField label="Theme" description="Applies right away." error="Pick one" disabled>
        <ToggleGroup type="single" variant="segmented">
          <ToggleGroupItem value="light">Light</ToggleGroupItem>
          <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
        </ToggleGroup>
      </FormField>,
    )
    const group = screen.getByRole('radiogroup', { name: 'Theme' })
    expect(group).toHaveAccessibleDescription('Applies right away. Pick one')
    expect(screen.getByRole('radio', { name: 'Light' })).toBeDisabled()
  })

  it('keeps its own aria-label', () => {
    render(
      <FormField label="Theme">
        <ToggleGroup type="single" aria-label="Color scheme">
          <ToggleGroupItem value="light">Light</ToggleGroupItem>
        </ToggleGroup>
      </FormField>,
    )
    expect(screen.getByRole('radiogroup', { name: 'Color scheme' })).toBeInTheDocument()
  })
})

describe('useShortcut', () => {
  function Probe({
    shortcut,
    onHit,
    options,
  }: {
    shortcut: Shortcut | Shortcut[]
    onHit: (event: KeyboardEvent) => void
    options?: UseShortcutOptions
  }) {
    useShortcut(shortcut, onHit, options)
    return <input aria-label="Title" />
  }

  it('fires on a bare key, but not while typing in a field', () => {
    const onHit = vi.fn()
    render(<Probe shortcut="n" onHit={onHit} />)
    fireEvent.keyDown(document.body, { key: 'n', code: 'KeyN' })
    expect(onHit).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'n', code: 'KeyN' })
    expect(onHit).toHaveBeenCalledTimes(1)
    // A modifier shortcut is not typing: it still fires from the field.
    fireEvent.keyDown(document.body, { key: 'n', code: 'KeyN', ctrlKey: true })
    expect(onHit).toHaveBeenCalledTimes(1)
  })

  it('matches modifiers exactly, takes several shortcuts and skips handled keys', () => {
    const onHit = vi.fn()
    render(<Probe shortcut={['mod+k', '?']} onHit={onHit} options={{ whileTyping: true }} />)
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'k', code: 'KeyK', ctrlKey: true })
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'k', code: 'KeyK', metaKey: true })
    fireEvent.keyDown(document.body, { key: '?', code: 'Slash', shiftKey: true })
    const handled = new KeyboardEvent('keydown', { key: '?', bubbles: true, cancelable: true })
    handled.preventDefault()
    window.dispatchEvent(handled)
    // Ctrl+K off Apple devices, ⌘K on them: jsdom is not an Apple device.
    expect(onHit).toHaveBeenCalledTimes(2)
  })

  it('can be turned off and ignores auto-repeat', () => {
    const onHit = vi.fn()
    const { rerender } = render(<Probe shortcut="n" onHit={onHit} options={{ enabled: false }} />)
    fireEvent.keyDown(document.body, { key: 'n', code: 'KeyN' })
    rerender(<Probe shortcut="n" onHit={onHit} />)
    fireEvent.keyDown(document.body, { key: 'n', code: 'KeyN', repeat: true })
    expect(onHit).not.toHaveBeenCalled()
  })
})
