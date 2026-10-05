import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/locale-provider'
import { DensityProvider } from '../density-provider'
import { FormField } from '../form-field'
import { NumberField, parseDecimal } from '../number-field'

describe('parseDecimal', () => {
  it('accepts a decimal comma or dot', () => {
    expect(parseDecimal('0,5')).toBe(0.5)
    expect(parseDecimal('0.5')).toBe(0.5)
    expect(parseDecimal(' −1,25 ')).toBe(-1.25)
    expect(parseDecimal('1.234,5')).toBe(1234.5)
    expect(parseDecimal('1,234.5')).toBe(1234.5)
    expect(parseDecimal('50%')).toBe(50)
    expect(parseDecimal('.5')).toBe(0.5)
    expect(parseDecimal('abc')).toBeNull()
    expect(parseDecimal('')).toBeNull()
  })
})

describe('NumberField', () => {
  it('commits typed values with Enter, accepting "0,5" and "0.5"', async () => {
    const user = userEvent.setup()
    const onValueCommit = vi.fn()
    render(<NumberField aria-label="Opacity" step={0.1} onValueCommit={onValueCommit} />)
    const input = screen.getByRole('spinbutton', { name: 'Opacity' })
    await user.click(input)
    await user.clear(input)
    await user.type(input, '0,5{Enter}')
    expect(onValueCommit).toHaveBeenLastCalledWith(0.5)
    await user.clear(input)
    await user.type(input, '0.75{Enter}')
    expect(onValueCommit).toHaveBeenLastCalledWith(0.75)
  })

  it('restores the value with Escape and commits on blur', async () => {
    const user = userEvent.setup()
    const onValueCommit = vi.fn()
    render(<NumberField aria-label="Width" defaultValue={10} onValueCommit={onValueCommit} />)
    const input = screen.getByRole('spinbutton', { name: 'Width' })
    await user.click(input)
    await user.clear(input)
    await user.type(input, '99{Escape}')
    expect(input).toHaveValue('10')
    await user.clear(input)
    await user.type(input, '12')
    await user.tab()
    expect(onValueCommit).toHaveBeenCalledWith(12)
  })

  it('steps with arrow keys (Shift ×10, Alt ×0.1) and clamps to min/max', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <NumberField
        aria-label="Size"
        defaultValue={5}
        min={0}
        max={20}
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('spinbutton', { name: 'Size' })
    input.focus()
    await user.keyboard('{ArrowUp}')
    expect(onValueChange).toHaveBeenLastCalledWith(6)
    await user.keyboard('{Shift>}{ArrowUp}{/Shift}')
    expect(onValueChange).toHaveBeenLastCalledWith(16)
    await user.keyboard('{Shift>}{ArrowUp}{/Shift}')
    expect(onValueChange).toHaveBeenLastCalledWith(20)
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
    expect(onValueChange).toHaveBeenLastCalledWith(19.9)
    await user.keyboard('{Home}')
    expect(onValueChange).toHaveBeenLastCalledWith(0)
    expect(input).toHaveAttribute('aria-valuemin', '0')
    expect(input).toHaveAttribute('aria-valuemax', '20')
  })

  it('drags on the label: fixed distance = fixed steps, Shift and Alt factors, one commit', () => {
    const onValueChange = vi.fn()
    const onValueCommit = vi.fn()
    render(
      <NumberField
        label="X"
        defaultValue={0}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />,
    )
    const handle = document.querySelector<HTMLElement>('[data-slot="number-field-label"]')!
    fireEvent.pointerDown(handle, { button: 0, clientX: 100, pointerId: 1 })
    fireEvent.pointerMove(handle, { clientX: 120, pointerId: 1 })
    // 20px at 2px per step = 10 steps.
    expect(onValueChange).toHaveBeenLastCalledWith(10)
    fireEvent.pointerMove(handle, { clientX: 122, pointerId: 1, shiftKey: true })
    expect(onValueChange).toHaveBeenLastCalledWith(20)
    fireEvent.pointerMove(handle, { clientX: 132, pointerId: 1, altKey: true })
    expect(onValueChange).toHaveBeenLastCalledWith(20.5)
    expect(onValueCommit).not.toHaveBeenCalled()
    fireEvent.pointerUp(handle, { clientX: 132, pointerId: 1 })
    expect(onValueCommit).toHaveBeenCalledTimes(1)
    expect(onValueCommit).toHaveBeenCalledWith(20.5)
  })

  it('cancels a drag with Escape and resets on label double-click', () => {
    const onValueChange = vi.fn()
    const onValueCommit = vi.fn()
    render(
      <NumberField
        label="Y"
        defaultValue={3}
        resetValue={1}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />,
    )
    const handle = document.querySelector<HTMLElement>('[data-slot="number-field-label"]')!
    expect(handle).toHaveAttribute('title', 'Drag to change, double-click to reset')
    fireEvent.pointerDown(handle, { button: 0, clientX: 0, pointerId: 1 })
    fireEvent.pointerMove(handle, { clientX: 40, pointerId: 1 })
    expect(onValueChange).toHaveBeenLastCalledWith(23)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onValueChange).toHaveBeenLastCalledWith(3)
    expect(onValueCommit).not.toHaveBeenCalled()

    fireEvent.doubleClick(handle)
    expect(onValueCommit).toHaveBeenCalledWith(1)
    expect(screen.getByRole('spinbutton')).toHaveValue('1')
  })

  it('scrubs on the unfocused field, and a click focuses it instead', () => {
    const onValueChange = vi.fn()
    render(<NumberField aria-label="Speed" defaultValue={0} onValueChange={onValueChange} />)
    const input = screen.getByRole('spinbutton', { name: 'Speed' })
    fireEvent.pointerDown(input, { button: 0, clientX: 0, pointerId: 1, pointerType: 'mouse' })
    fireEvent.pointerUp(input, { clientX: 1, pointerId: 1 })
    expect(document.activeElement).toBe(input)
    expect(onValueChange).not.toHaveBeenCalled()

    input.blur()
    fireEvent.pointerDown(input, { button: 0, clientX: 0, pointerId: 2, pointerType: 'mouse' })
    fireEvent.pointerMove(input, { clientX: -10, pointerId: 2 })
    fireEvent.pointerUp(input, { clientX: -10, pointerId: 2 })
    expect(onValueChange).toHaveBeenLastCalledWith(-5)
  })

  it('shows a different number than it stores with format/parse', async () => {
    const user = userEvent.setup()
    const onValueCommit = vi.fn()
    render(
      <NumberField
        aria-label="Opacity"
        defaultValue={0.6}
        min={0}
        max={1}
        step={0.01}
        unit="%"
        format={(v) => v * 100}
        parse={(n) => n / 100}
        onValueCommit={onValueCommit}
      />,
    )
    const input = screen.getByRole('spinbutton', { name: 'Opacity' })
    expect(input).toHaveValue('60')
    expect(input).toHaveAttribute('aria-valuetext', '60 %')
    await user.click(input)
    await user.clear(input)
    await user.type(input, '150{Enter}')
    expect(onValueCommit).toHaveBeenLastCalledWith(1)
    expect(input).toHaveValue('100')
    await user.keyboard('{ArrowDown}')
    expect(onValueCommit).toHaveBeenLastCalledWith(0.99)
  })

  it('formats with the provider locale and accepts both separators there', async () => {
    const user = userEvent.setup()
    const onValueCommit = vi.fn()
    render(
      <LocaleProvider locale="vi-VN">
        <NumberField
          aria-label="Độ sáng"
          defaultValue={-0.4}
          step={0.1}
          onValueCommit={onValueCommit}
        />
      </LocaleProvider>,
    )
    const input = screen.getByRole('spinbutton', { name: 'Độ sáng' })
    expect(input).toHaveValue('-0,4')
    await user.click(input)
    await user.clear(input)
    await user.type(input, '0.25{Enter}')
    expect(onValueCommit).toHaveBeenLastCalledWith(0.25)
    expect(input).toHaveValue('0,25')
  })

  it('works with FormField and compact density', () => {
    render(
      <DensityProvider density="compact">
        <FormField label="Rotation" description="Degrees">
          <NumberField unit="°" />
        </FormField>
      </DensityProvider>,
    )
    const input = screen.getByRole('spinbutton', { name: 'Rotation' })
    expect(input).toHaveAccessibleDescription('Degrees')
    expect(input.closest('[data-slot="number-field"]')).toHaveClass('h-6')
  })
})
