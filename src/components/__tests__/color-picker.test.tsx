import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/locale-provider'
import { vi as viMessages } from '../../i18n/vi'
import { formatColor, hsvaToRgba, parseColor, rgbaToHsva } from '../../lib/color'
import { ColorPicker, ColorPickerPanel } from '../color-picker'

afterEach(() => {
  vi.restoreAllMocks()
  delete (window as { EyeDropper?: unknown }).EyeDropper
})

function mockRect(
  selector: string,
  rect: { left: number; top: number; width: number; height: number },
) {
  const original = HTMLElement.prototype.getBoundingClientRect
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.matches(selector)) {
      return {
        ...rect,
        right: rect.left + rect.width,
        bottom: rect.top + rect.height,
        x: rect.left,
        y: rect.top,
        toJSON() {},
      } as DOMRect
    }
    return original.call(this)
  })
}

describe('color helpers', () => {
  it('parses hex, rgb() and rgba() and formats back', () => {
    expect(parseColor('#abc')).toEqual({ r: 170, g: 187, b: 204, a: 1 })
    expect(parseColor('FFFFFF')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor('rgba(0, 0, 0, 0.6)')).toEqual({ r: 0, g: 0, b: 0, a: 0.6 })
    expect(parseColor('rgb(10 20 30 / 50%)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 })
    expect(parseColor('#11223380')?.a).toBeCloseTo(0.502, 2)
    expect(parseColor('tomato')).toBeNull()
    expect(parseColor('rgb(1,2)')).toBeNull()
    expect(formatColor({ r: 170, g: 187, b: 204, a: 1 })).toBe('#aabbcc')
    expect(formatColor({ r: 0, g: 0, b: 0, a: 0.6 })).toBe('rgba(0,0,0,0.6)')
  })

  it('round-trips through HSV', () => {
    for (const hex of ['#ff0000', '#00ff00', '#3366cc', '#e3a04a', '#000000', '#ffffff']) {
      expect(formatColor(hsvaToRgba(rgbaToHsva(parseColor(hex)!)))).toBe(hex)
    }
  })
})

describe('ColorPickerPanel', () => {
  it('commits a typed hex value, expanding #abc', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onValueCommit = vi.fn()
    render(
      <ColorPickerPanel
        defaultValue="#ffffff"
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />,
    )
    const input = screen.getByRole('textbox', { name: 'Color value' })
    await user.clear(input)
    await user.type(input, '#abc{Enter}')
    expect(onValueCommit).toHaveBeenCalledWith('#aabbcc')
    expect(onValueChange).toHaveBeenLastCalledWith('#aabbcc')
    expect(input).toHaveValue('#aabbcc')
  })

  it('restores the input with Escape and ignores invalid text', async () => {
    const user = userEvent.setup()
    const onValueCommit = vi.fn()
    render(<ColorPickerPanel defaultValue="#112233" onValueCommit={onValueCommit} />)
    const input = screen.getByRole('textbox', { name: 'Color value' })
    await user.clear(input)
    await user.type(input, 'nope{Escape}')
    expect(input).toHaveValue('#112233')
    await user.clear(input)
    await user.type(input, 'nope{Enter}')
    expect(input).toHaveValue('#112233')
    expect(onValueCommit).not.toHaveBeenCalled()
  })

  it('moves saturation and brightness with the arrow keys', async () => {
    const user = userEvent.setup()
    const onValueCommit = vi.fn()
    render(<ColorPickerPanel defaultValue="#ff0000" onValueCommit={onValueCommit} />)
    const area = screen.getByRole('slider', { name: 'Saturation and brightness' })
    expect(area).toHaveAttribute('aria-valuetext', 'Saturation 100%, brightness 100%')
    area.focus()
    await user.keyboard('{ArrowDown}')
    expect(area).toHaveAttribute('aria-valuetext', 'Saturation 100%, brightness 99%')
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
    expect(area).toHaveAttribute('aria-valuetext', 'Saturation 90%, brightness 99%')
    expect(onValueCommit).toHaveBeenCalledTimes(2)
  })

  it('changes hue with the keyboard and keeps it for grays', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ColorPickerPanel defaultValue="#ff0000" onValueChange={onValueChange} />)
    const hue = screen.getByRole('slider', { name: 'Hue' })
    hue.focus()
    await user.keyboard('{End}')
    expect(hue).toHaveAttribute('aria-valuenow', '360')
    await user.keyboard('{Home}{Shift>}{ArrowRight}{ArrowRight}{/Shift}')
    expect(hue).toHaveAttribute('aria-valuetext', '20°')
    // Dragging saturation to 0 (a gray) must not lose the hue.
    const area = screen.getByRole('slider', { name: 'Saturation and brightness' })
    area.focus()
    for (let i = 0; i < 10; i++) await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
    expect(onValueChange).toHaveBeenLastCalledWith('#ffffff')
    expect(hue).toHaveAttribute('aria-valuetext', '20°')
  })

  it('drags on the area: changes while moving, commits once on release', () => {
    mockRect('[data-slot="color-picker-area"]', { left: 0, top: 0, width: 200, height: 100 })
    const onValueChange = vi.fn()
    const onValueCommit = vi.fn()
    render(
      <ColorPickerPanel
        defaultValue="#ff0000"
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />,
    )
    const area = screen.getByRole('slider', { name: 'Saturation and brightness' })
    fireEvent.pointerDown(area, { button: 0, clientX: 200, clientY: 0, pointerId: 1 })
    fireEvent.pointerMove(area, { clientX: 100, clientY: 50, pointerId: 1 })
    fireEvent.pointerMove(area, { clientX: 0, clientY: 100, pointerId: 1 })
    expect(onValueChange).toHaveBeenLastCalledWith('#000000')
    expect(onValueCommit).not.toHaveBeenCalled()
    fireEvent.pointerUp(area, { clientX: 0, clientY: 100, pointerId: 1 })
    expect(onValueCommit).toHaveBeenCalledTimes(1)
    expect(onValueCommit).toHaveBeenCalledWith('#000000')
  })

  it('cancels a drag with Escape', () => {
    mockRect('[data-slot="color-picker-area"]', { left: 0, top: 0, width: 200, height: 100 })
    const onValueChange = vi.fn()
    const onValueCommit = vi.fn()
    render(
      <ColorPickerPanel
        defaultValue="#ff0000"
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />,
    )
    const area = screen.getByRole('slider', { name: 'Saturation and brightness' })
    fireEvent.pointerDown(area, { button: 0, clientX: 0, clientY: 100, pointerId: 1 })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onValueChange).toHaveBeenLastCalledWith('#ff0000')
    expect(onValueCommit).not.toHaveBeenCalled()
  })

  it('outputs rgba() with an alpha slider and picks swatches', async () => {
    const user = userEvent.setup()
    const onValueCommit = vi.fn()
    render(
      <ColorPickerPanel
        defaultValue="#000000"
        alpha
        swatches={['#ffffff', 'rgba(0,0,0,0.6)']}
        onValueCommit={onValueCommit}
      />,
    )
    const opacity = screen.getByRole('slider', { name: 'Opacity' })
    opacity.focus()
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
    expect(onValueCommit).toHaveBeenLastCalledWith('rgba(0,0,0,0.9)')
    await user.click(screen.getByRole('button', { name: 'Use #ffffff' }))
    expect(onValueCommit).toHaveBeenLastCalledWith('#ffffff')
    const translucent = screen.getByRole('button', { name: 'Use rgba(0,0,0,0.6)' })
    await user.click(translucent)
    expect(onValueCommit).toHaveBeenLastCalledWith('rgba(0,0,0,0.6)')
    expect(translucent).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows the eyedropper only when the browser supports it', async () => {
    const { unmount } = render(<ColorPickerPanel />)
    expect(screen.queryByRole('button', { name: /from the screen/ })).not.toBeInTheDocument()
    unmount()

    const open = vi.fn().mockResolvedValue({ sRGBHex: '#123456' })
    ;(window as { EyeDropper?: unknown }).EyeDropper = class {
      open = open
    }
    const onValueCommit = vi.fn()
    const user = userEvent.setup()
    render(<ColorPickerPanel onValueCommit={onValueCommit} />)
    await user.click(screen.getByRole('button', { name: 'Pick a color from the screen' }))
    expect(onValueCommit).toHaveBeenCalledWith('#123456')
  })
})

describe('ColorPicker', () => {
  it('opens the editor from a field trigger showing hex and opacity', async () => {
    const user = userEvent.setup()
    const onValueCommit = vi.fn()
    render(
      <ColorPicker
        aria-label="Text color"
        defaultValue="rgba(0,0,0,0.6)"
        alpha
        onValueCommit={onValueCommit}
      />,
    )
    const trigger = screen.getByRole('button', { name: 'Text color' })
    expect(trigger).toHaveTextContent('#000000')
    expect(trigger).toHaveTextContent('60%')
    await user.click(trigger)
    const input = await screen.findByRole('textbox', { name: 'Color value' })
    expect(input).toHaveValue('rgba(0,0,0,0.6)')
    await user.clear(input)
    await user.type(input, '#e3a04a{Enter}')
    expect(onValueCommit).toHaveBeenCalledWith('#e3a04a')
    expect(trigger).toHaveTextContent('#e3a04a')
  })

  it('names the swatch trigger and translates labels', () => {
    render(
      <LocaleProvider messages={viMessages}>
        <ColorPicker variant="swatch" defaultValue="#ff0000" size="xs" />
      </LocaleProvider>,
    )
    expect(screen.getByRole('button', { name: 'Chọn màu: #ff0000' })).toHaveAttribute(
      'data-variant',
      'swatch',
    )
  })
})
