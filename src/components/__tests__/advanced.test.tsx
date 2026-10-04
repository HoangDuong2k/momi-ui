import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Calendar } from '../calendar'
import { Combobox } from '../combobox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../command'
import { DatePicker } from '../date-picker'
import { FileUpload } from '../file-upload'
import { InputOTP } from '../input-otp'
import { Slider } from '../slider'

describe('Slider', () => {
  it('moves with the keyboard and supports ranges', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Slider defaultValue={[20, 80]} thumbLabels={['Min', 'Max']} onValueChange={onValueChange} />,
    )
    const min = screen.getByRole('slider', { name: 'Min' })
    expect(min).toHaveAttribute('aria-valuenow', '20')
    expect(screen.getByRole('slider', { name: 'Max' })).toHaveAttribute('aria-valuenow', '80')
    min.focus()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenCalledWith([21, 80])
  })
})

describe('InputOTP', () => {
  it('keeps only allowed characters and reports completion', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<InputOTP aria-label="Code" length={4} onComplete={onComplete} />)
    const input = screen.getByLabelText('Code')
    await user.type(input, '1a2b3')
    expect(input).toHaveValue('123')
    expect(onComplete).not.toHaveBeenCalled()
    await user.type(input, '4')
    expect(onComplete).toHaveBeenCalledWith('1234')
    expect(input).toHaveAttribute('autocomplete', 'one-time-code')
  })

  it('accepts a pasted code', async () => {
    const user = userEvent.setup()
    render(<InputOTP aria-label="Code" />)
    const input = screen.getByLabelText('Code')
    input.focus()
    await user.paste('98-76-54')
    expect(input).toHaveValue('987654')
  })
})

describe('Command', () => {
  function Palette({ onSelect }: { onSelect: (v: string) => void }) {
    return (
      <Command label="Commands">
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandEmpty>Nothing found</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => onSelect('home')}>Home</CommandItem>
            <CommandItem onSelect={() => onSelect('settings')} keywords={['preferences']}>
              Settings
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => onSelect('logout')}>Log out</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    )
  }

  it('filters by value and keywords, and hides empty groups', async () => {
    const user = userEvent.setup()
    render(<Palette onSelect={() => {}} />)
    await user.type(screen.getByRole('combobox'), 'prefer')
    expect(screen.getByRole('option', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Home' })).not.toBeInTheDocument()
    expect(screen.getByText('Actions')).not.toBeVisible()

    await user.clear(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'zzz')
    expect(screen.getByText('Nothing found')).toBeInTheDocument()
  })

  it('navigates with arrows and selects with Enter', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Palette onSelect={onSelect} />)
    const input = screen.getByRole('combobox')
    input.focus()
    expect(screen.getByRole('option', { name: 'Home' })).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowDown}{ArrowDown}')
    const logout = screen.getByRole('option', { name: 'Log out' })
    expect(logout).toHaveAttribute('aria-selected', 'true')
    expect(input).toHaveAttribute('aria-activedescendant', logout.id)
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith('logout')
  })
})

describe('Combobox', () => {
  const options = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte', disabled: true },
  ]

  it('searches and selects a single value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Combobox aria-label="Framework" options={options} onValueChange={onValueChange} />)
    const trigger = screen.getByRole('combobox', { name: 'Framework' })
    await user.click(trigger)
    await user.type(screen.getByPlaceholderText('Search…'), 'vu')
    await user.click(screen.getByRole('option', { name: 'Vue' }))
    expect(onValueChange).toHaveBeenCalledWith('vue')
    expect(trigger).toHaveTextContent('Vue')
  })

  it('toggles multiple values', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        multiple
        aria-label="Frameworks"
        options={options}
        defaultValue={['react']}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('combobox', { name: 'Frameworks' }))
    await user.click(screen.getByRole('option', { name: 'Vue' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['react', 'vue'])
    expect(screen.getByRole('option', { name: 'Svelte' })).toHaveAttribute('aria-disabled', 'true')
  })
})

describe('Calendar', () => {
  it('selects a day and moves focus with the keyboard', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Calendar defaultMonth={new Date(2026, 9, 1)} onSelect={onSelect} locale="en-US" />)
    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument()
    const day10 = screen.getByRole('button', { name: 'Saturday, October 10, 2026' })
    await user.click(day10)
    expect(onSelect).toHaveBeenCalledWith(new Date(2026, 9, 10))
    expect(day10).toHaveAttribute('aria-pressed', 'true')
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Sunday, October 11, 2026' })).toHaveFocus()
    await user.keyboard('{PageDown}')
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument()
  })

  it('selects a range and respects minDate', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <Calendar
        mode="range"
        defaultMonth={new Date(2026, 9, 1)}
        minDate={new Date(2026, 9, 5)}
        onSelect={onSelect}
        locale="en-US"
      />,
    )
    expect(screen.getByRole('button', { name: 'Sunday, October 4, 2026' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Thursday, October 15, 2026' }))
    await user.click(screen.getByRole('button', { name: 'Monday, October 12, 2026' }))
    expect(onSelect).toHaveBeenLastCalledWith({
      from: new Date(2026, 9, 12),
      to: new Date(2026, 9, 15),
    })
  })
})

describe('DatePicker', () => {
  it('picks a date from the popover', async () => {
    const user = userEvent.setup()
    render(<DatePicker aria-label="Due date" locale="en-US" defaultValue={new Date(2026, 9, 4)} />)
    const trigger = screen.getByRole('button', { name: 'Due date' })
    expect(trigger).toHaveTextContent('Oct 4, 2026')
    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Tuesday, October 20, 2026' }))
    expect(trigger).toHaveTextContent('Oct 20, 2026')
  })
})

describe('FileUpload', () => {
  it('accepts, rejects and removes files', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const onReject = vi.fn()
    render(<FileUpload accept="image/*" maxSize={1024} label="Upload images" onReject={onReject} />)
    const input = screen.getByLabelText('Upload images') as HTMLInputElement
    const ok = new File(['x'.repeat(10)], 'logo.png', { type: 'image/png' })
    const big = new File(['x'.repeat(2048)], 'big.png', { type: 'image/png' })
    const pdf = new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' })
    await user.upload(input, [ok, big, pdf])

    const fileList = document.querySelector<HTMLElement>('[data-slot=file-list]')!
    expect(within(fileList).getByText('logo.png')).toBeInTheDocument()
    expect(within(fileList).queryByText('big.png')).not.toBeInTheDocument()
    expect(onReject).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ reason: 'size' }),
        expect.objectContaining({ reason: 'type' }),
      ]),
    )
    expect(screen.getByRole('alert')).toHaveTextContent('big.png')

    await user.click(screen.getByRole('button', { name: 'Remove logo.png' }))
    await waitFor(() => expect(screen.queryByText('logo.png')).not.toBeInTheDocument())
  })

  it('accepts dropped files', () => {
    const onValueChange = vi.fn()
    render(<FileUpload label="Drop here" onValueChange={onValueChange} />)
    const zone = screen.getByText('Drop here').closest('label')!
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    fireEvent.drop(zone, { dataTransfer: { files: [file], dropEffect: 'copy' } })
    expect(onValueChange).toHaveBeenCalledWith([file])
  })
})
