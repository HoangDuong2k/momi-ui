import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DensityProvider } from '../density-provider'
import { ScrollArea } from '../scroll-area'
import { ToggleGroup, ToggleGroupItem } from '../toggle-group'
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggle,
} from '../toolbar'
import { Tooltip } from '../tooltip'

const Icon = () => <svg data-testid="icon" />

describe('ToggleGroup', () => {
  it('keeps exactly one item on in a single group', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ToggleGroup
        type="single"
        defaultValue="vi"
        onValueChange={onValueChange}
        aria-label="Language"
      >
        <ToggleGroupItem value="vi">VI</ToggleGroupItem>
        <ToggleGroupItem value="en">EN</ToggleGroupItem>
      </ToggleGroup>,
    )
    const vi_ = screen.getByRole('radio', { name: 'VI' })
    const en = screen.getByRole('radio', { name: 'EN' })
    expect(vi_).toHaveAttribute('aria-checked', 'true')

    await user.click(vi_)
    expect(vi_).toHaveAttribute('aria-checked', 'true')
    expect(onValueChange).not.toHaveBeenCalled()

    await user.click(en)
    expect(onValueChange).toHaveBeenLastCalledWith('en')
    expect(en).toHaveAttribute('aria-checked', 'true')
    expect(vi_).toHaveAttribute('aria-checked', 'false')
  })

  it('can allow deselecting', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ToggleGroup type="single" defaultValue="a" allowDeselect onValueChange={onValueChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    )
    await user.click(screen.getByRole('radio', { name: 'A' }))
    expect(onValueChange).toHaveBeenLastCalledWith('')
  })

  it('moves with the arrow keys and toggles several items with Space', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ToggleGroup type="multiple" onValueChange={onValueChange} aria-label="Style">
        <ToggleGroupItem value="bold" icon={<Icon />} label="Bold" />
        <ToggleGroupItem value="italic" icon={<Icon />} label="Italic" />
      </ToggleGroup>,
    )
    const bold = screen.getByRole('button', { name: 'Bold' })
    bold.focus()
    await user.keyboard(' ')
    expect(onValueChange).toHaveBeenLastCalledWith(['bold'])
    await user.keyboard('{ArrowRight}')
    const italic = screen.getByRole('button', { name: 'Italic' })
    expect(italic).toHaveFocus()
    await user.keyboard(' ')
    expect(onValueChange).toHaveBeenLastCalledWith(['bold', 'italic'])
    expect(italic).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders icon-only items square and follows density', () => {
    render(
      <DensityProvider density="compact">
        <ToggleGroup type="single" defaultValue="left" variant="outline">
          <ToggleGroupItem value="left" icon={<Icon />} label="Align left" />
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
        </ToggleGroup>
      </DensityProvider>,
    )
    const left = screen.getByRole('radio', { name: 'Align left' })
    expect(left).toHaveClass('h-6', 'w-6', 'px-0')
    expect(screen.getByRole('radio', { name: 'Center' })).toHaveClass('h-6', 'px-2')
    expect(left.closest('[data-slot=toggle-group]')).toHaveAttribute('data-size', 'xs')
  })
})

describe('Toolbar', () => {
  function EditorToolbar({ onSave = vi.fn() }: { onSave?: () => void }) {
    return (
      <Toolbar aria-label="Editor">
        <ToolbarGroup aria-label="File">
          <ToolbarButton icon={<Icon />} label="Save project" shortcut="mod+s" onClick={onSave} />
          <ToolbarButton>Export</ToolbarButton>
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarToggle icon={<Icon />} label="Snap" defaultPressed />
        <ToggleGroup type="single" defaultValue="fit" aria-label="Zoom">
          <ToggleGroupItem value="fit">Fit</ToggleGroupItem>
          <ToggleGroupItem value="100">100%</ToggleGroupItem>
        </ToggleGroup>
        <ToolbarLink href="#help">Help</ToolbarLink>
      </Toolbar>
    )
  }

  it('is one Tab stop and the arrow keys move through every control', async () => {
    const user = userEvent.setup()
    render(<EditorToolbar />)
    await user.tab()
    expect(screen.getByRole('button', { name: 'Save project' })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Export' })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Snap' })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Fit' })).toHaveFocus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByRole('link', { name: 'Help' })).toHaveFocus()
    await user.tab()
    expect(document.body).toHaveFocus()
  })

  it('toggles pressed state and runs actions', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<EditorToolbar onSave={onSave} />)
    const snap = screen.getByRole('button', { name: 'Snap' })
    expect(snap).toHaveAttribute('aria-pressed', 'true')
    await user.click(snap)
    expect(snap).toHaveAttribute('aria-pressed', 'false')
    await user.click(screen.getByRole('button', { name: 'Save project' }))
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('passes its size to buttons and toggle groups', () => {
    render(
      <Toolbar size="xs" aria-label="Timeline">
        <ToolbarButton icon={<Icon />} label="Split" />
        <ToggleGroup type="single" defaultValue="a">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
        </ToggleGroup>
      </Toolbar>,
    )
    expect(screen.getByRole('button', { name: 'Split' })).toHaveClass('size-6')
    const toolbar = screen.getByRole('toolbar', { name: 'Timeline' })
    expect(within(toolbar).getByRole('radio', { name: 'A' })).toHaveClass('h-6')
  })
})

describe('Tooltip shortcut', () => {
  it('shows the shortcut formatted for the platform', async () => {
    render(
      <Tooltip content="Save project" shortcut={['mod', 'S']} defaultOpen>
        <button type="button">Save</button>
      </Tooltip>,
    )
    const tooltip = await screen.findByRole('tooltip')
    // jsdom is neither Mac nor iOS, so Ctrl is used.
    expect(tooltip).toHaveTextContent('Save project')
    expect(tooltip).toHaveTextContent('Ctrl+S')
  })
})

describe('ScrollArea', () => {
  it('renders a viewport with the requested scrollbars', () => {
    const viewportRef = vi.fn()
    render(
      <ScrollArea
        type="always"
        orientation="both"
        size="sm"
        className="h-40"
        viewportRef={viewportRef}
        viewportProps={{ 'aria-label': 'Layers', tabIndex: 0 }}
      >
        <p>Long content</p>
      </ScrollArea>,
    )
    expect(screen.getByText('Long content')).toBeInTheDocument()
    const viewport = screen.getByLabelText('Layers')
    expect(viewport).toHaveAttribute('data-slot', 'scroll-area-viewport')
    expect(viewportRef).toHaveBeenCalledWith(viewport)
    const root = viewport.closest('[data-slot=scroll-area]')!
    const bars = root.querySelectorAll('[data-slot=scroll-area-scrollbar]')
    expect([...bars].map((b) => b.getAttribute('data-orientation'))).toEqual([
      'vertical',
      'horizontal',
    ])
    expect(bars[0]).toHaveClass('w-1.5')
  })
})
