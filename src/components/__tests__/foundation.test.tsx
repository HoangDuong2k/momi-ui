import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Reveal } from '../../blocks/reveal'
import { formatShortcut, matchesShortcut, parseShortcut } from '../../lib/shortcut'
import { ThemeProvider, useTheme } from '../../theme/theme-provider'
import { getThemeScript } from '../../theme/theme-script'
import { Badge } from '../badge'
import { Button } from '../button'
import { useCommandShortcut } from '../command'
import { DensityProvider } from '../density-provider'
import { Input } from '../input'
import { Slider } from '../slider'
import { Tabs, TabsList, TabsTrigger } from '../tabs'
import { Kbd } from '../typography'

afterEach(() => {
  document.documentElement.className = ''
  document.documentElement.removeAttribute('style')
  window.localStorage.clear()
})

describe('DensityProvider', () => {
  it('makes controls default to their compact size; size props still win', () => {
    render(
      <DensityProvider density="compact">
        <Button>Save</Button>
        <Button size="lg">Big</Button>
        <Input aria-label="Name" />
        <Badge>New</Badge>
        <Tabs defaultValue="a">
          <TabsList aria-label="View">
            <TabsTrigger value="a">A</TabsTrigger>
          </TabsList>
        </Tabs>
      </DensityProvider>,
    )
    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('h-6', 'text-xs')
    expect(screen.getByRole('button', { name: 'Big' })).toHaveClass('h-11')
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('h-6')
    expect(screen.getByText('New')).toHaveClass('h-5')
    expect(screen.getByRole('tablist')).toHaveAttribute('data-size', 'xs')
    expect(screen.getByRole('tab', { name: 'A' })).toHaveClass('h-6')
  })

  it('keeps the regular sizes by default', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('h-9')
  })
})

describe('shortcuts', () => {
  it('formats per platform', () => {
    expect(formatShortcut('mod+shift+s', { platform: 'mac' })).toBe('⇧⌘S')
    expect(formatShortcut('mod+shift+s', { platform: 'windows' })).toBe('Ctrl+Shift+S')
    expect(formatShortcut('ctrl+mod+f', { platform: 'mac' })).toBe('⌃⌘F')
    expect(formatShortcut('alt+enter', { platform: 'mac' })).toBe('⌥↩')
    expect(formatShortcut('meta+e', { platform: 'windows' })).toBe('Win+E')
    expect(formatShortcut('mod+backspace', { platform: 'linux' })).toBe('Ctrl+Backspace')
    expect(formatShortcut('f11', { platform: 'windows' })).toBe('F11')
    expect(formatShortcut('mod++', { platform: 'windows' })).toBe('Ctrl++')
  })

  it('picks per-platform alternatives (redo, full screen)', () => {
    const redo = { mac: 'mod+shift+z', default: 'mod+y' }
    expect(formatShortcut(redo, { platform: 'mac' })).toBe('⇧⌘Z')
    expect(formatShortcut(redo, { platform: 'windows' })).toBe('Ctrl+Y')
    const fullScreen = { mac: 'ctrl+mod+f', default: 'f11' }
    expect(formatShortcut(fullScreen, { platform: 'ios' })).toBe('⌃⌘F')
    expect(formatShortcut(fullScreen, { platform: 'linux' })).toBe('F11')
  })

  it('spells shortcuts out for screen readers', () => {
    expect(formatShortcut('mod+shift+s', { platform: 'mac', spoken: true })).toBe('Shift+Command+S')
    expect(formatShortcut('mod+up', { platform: 'windows', spoken: true })).toBe('Ctrl+Up')
  })

  it('parses aliases', () => {
    expect(parseShortcut('Cmd+Option+Esc')).toMatchObject({ meta: true, alt: true, key: 'escape' })
  })

  it('matches keyboard events', () => {
    const event = (init: Partial<KeyboardEvent>) =>
      ({
        key: '',
        code: '',
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        ...init,
      }) as KeyboardEvent
    expect(matchesShortcut(event({ key: 's', metaKey: true }), 'mod+s', { platform: 'mac' })).toBe(
      true,
    )
    expect(matchesShortcut(event({ key: 's', ctrlKey: true }), 'mod+s', { platform: 'mac' })).toBe(
      false,
    )
    expect(
      matchesShortcut(event({ key: 'S', ctrlKey: true, shiftKey: true }), 'mod+shift+s', {
        platform: 'windows',
      }),
    ).toBe(true)
    expect(
      matchesShortcut(event({ key: 's', ctrlKey: true, shiftKey: true }), 'mod+s', {
        platform: 'windows',
      }),
    ).toBe(false)
    // Physical key on a non-Latin layout.
    expect(
      matchesShortcut(event({ key: 'ы', code: 'KeyS', ctrlKey: true }), 'mod+s', {
        platform: 'linux',
      }),
    ).toBe(true)
    expect(matchesShortcut(event({ key: '?', shiftKey: true }), '?', { platform: 'linux' })).toBe(
      true,
    )
  })

  it('renders Kbd keys for the current platform', () => {
    // jsdom reports Linux.
    render(<Kbd keys={['mod', 'shift', 'S']} />)
    const kbd = screen.getByText('Ctrl+Shift+S')
    expect(kbd).toHaveAttribute('aria-label', 'Ctrl+Shift+S')
  })

  it('runs useCommandShortcut for combos and single keys', async () => {
    const user = userEvent.setup()
    const onPalette = vi.fn()
    const onSearch = vi.fn()
    function Shortcuts() {
      useCommandShortcut(onPalette, 'mod+shift+p')
      useCommandShortcut(onSearch)
      return null
    }
    render(<Shortcuts />)
    await user.keyboard('{Control>}p{/Control}')
    expect(onPalette).not.toHaveBeenCalled()
    await user.keyboard('{Control>}{Shift>}P{/Shift}{/Control}')
    expect(onPalette).toHaveBeenCalledTimes(1)
    await user.keyboard('{Meta>}k{/Meta}')
    expect(onSearch).toHaveBeenCalledTimes(1)
  })
})

describe('theme', () => {
  function ThemeButton() {
    const { theme, resolvedTheme, setTheme } = useTheme()
    return (
      <button type="button" onClick={() => setTheme('light')}>
        {theme}/{resolvedTheme}
      </button>
    )
  }

  it('forcedTheme ignores storage and never writes it', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('momi-theme', 'light')
    render(
      <ThemeProvider forcedTheme="dark">
        <ThemeButton />
      </ThemeProvider>,
    )
    expect(document.documentElement).toHaveClass('dark')
    await user.click(screen.getByRole('button', { name: 'dark/dark' }))
    expect(document.documentElement).toHaveClass('dark')
    expect(window.localStorage.getItem('momi-theme')).toBe('light')
  })

  it('ThemeScript applies the stored theme before React runs', () => {
    window.localStorage.setItem('momi-theme', 'dark')
    new Function(getThemeScript())()
    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')

    new Function(getThemeScript({ attribute: 'data-theme', forcedTheme: 'light' }))()
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')

    window.localStorage.setItem('custom', 'nonsense')
    document.documentElement.className = ''
    new Function(getThemeScript({ storageKey: 'custom', defaultTheme: 'light' }))()
    expect(document.documentElement).toHaveClass('light')
  })
})

describe('Slider additions', () => {
  it('resets on double-click and reports the commit', () => {
    const onValueChange = vi.fn()
    const onValueCommit = vi.fn()
    render(
      <Slider
        defaultValue={[70]}
        resetValue={25}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
        thumbLabels={['Volume']}
      />,
    )
    fireEvent.doubleClick(screen.getByRole('slider', { name: 'Volume' }))
    expect(onValueChange).toHaveBeenLastCalledWith([25])
    expect(onValueCommit).toHaveBeenLastCalledWith([25])
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveAttribute('aria-valuenow', '25')
  })

  it('fills from origin', () => {
    const { container } = render(
      <Slider
        min={-1}
        max={1}
        step={0.1}
        defaultValue={[-0.4]}
        origin={0}
        thumbLabels={['Brightness']}
      />,
    )
    const fill = container.querySelector<HTMLElement>('[data-slot="slider-fill"]')!
    expect(fill.style.insetInlineStart).toBe('30%')
    expect(fill.style.width).toBe('20%')
  })

  it('places marks on the minimum side for every orientation', () => {
    const marks = [{ value: 0 }, { value: 25 }]
    const markStyles = () =>
      [...document.querySelectorAll<HTMLElement>('[data-slot="slider-mark"]')].map((m) => m.style)
    const { rerender } = render(<Slider marks={marks} thumbLabels={['A']} />)
    expect(markStyles()[1].insetInlineStart).toBe('25%')

    rerender(<Slider marks={marks} inverted thumbLabels={['A']} />)
    expect(markStyles()[1].insetInlineEnd).toBe('25%')

    rerender(<Slider marks={marks} orientation="vertical" thumbLabels={['A']} />)
    expect(markStyles()[1].bottom).toBe('25%')

    rerender(<Slider marks={marks} orientation="vertical" inverted thumbLabels={['A']} />)
    expect(markStyles()[1].top).toBe('25%')
  })

  it('marks follow the slider direction, not the page', () => {
    render(<Slider marks={[{ value: 50 }]} dir="rtl" thumbLabels={['A']} />)
    expect(document.querySelector('[data-slot="slider-marks"]')).toHaveAttribute('dir', 'rtl')
  })

  it('uses the xs size in compact density', () => {
    render(
      <DensityProvider density="compact">
        <Slider defaultValue={[10]} thumbLabels={['Opacity']} />
      </DensityProvider>,
    )
    expect(screen.getByRole('slider', { name: 'Opacity' })).toHaveClass('size-3')
  })
})

describe('Reveal without JavaScript', () => {
  it('server HTML shows the content; the browser arms the animation', () => {
    const html = renderToString(<Reveal>Static content</Reveal>)
    expect(html).toContain('Static content')
    // The attribute (not the `data-armed:` class names) is what hides content.
    expect(html).not.toMatch(/\sdata-armed(=|\s|>)/)

    render(<Reveal data-testid="reveal">Client content</Reveal>)
    expect(screen.getByTestId('reveal')).toHaveAttribute('data-armed')
  })
})
