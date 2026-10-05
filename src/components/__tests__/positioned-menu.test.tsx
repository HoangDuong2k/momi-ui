import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { formatShortcut } from '../../lib/shortcut'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuShortcut,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../context-menu'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  type MenuPosition,
} from '../dropdown-menu'

function Timeline({ onSplit = () => {} }: { onSplit?: () => void }) {
  const [menu, setMenu] = useState<MenuPosition | null>(null)
  const [snap, setSnap] = useState(true)
  return (
    <>
      <div
        role="application"
        aria-label="Timeline"
        tabIndex={0}
        onContextMenu={(e) => {
          e.preventDefault()
          setMenu({ x: e.clientX, y: e.clientY })
        }}
      />
      <DropdownMenu
        open={menu !== null}
        onOpenChange={(open) => !open && setMenu(null)}
        position={menu}
      >
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSplit}>
            Split clip
            <DropdownMenuShortcut keys="mod+b" />
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem checked={snap} onCheckedChange={setSnap}>
            Snap
          </DropdownMenuCheckboxItem>
          <DropdownMenuItem variant="danger" disabled>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

describe('DropdownMenu with position', () => {
  it('opens from code at a point, without a trigger', async () => {
    render(<Timeline />)
    const timeline = screen.getByRole('application', { name: 'Timeline' })
    timeline.focus()
    await act(async () => {
      timeline.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: 320,
          clientY: 140,
        }),
      )
    })
    expect(await screen.findByRole('menu')).toBeInTheDocument()
    const anchor = document.querySelector<HTMLElement>('[data-slot="dropdown-menu-anchor"]')!
    expect(anchor.style.left).toBe('320px')
    expect(anchor.style.top).toBe('140px')
    expect(screen.getByRole('menuitem', { name: /Split clip/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: 'Snap' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute('data-disabled')
  })

  it('closes with Escape and gives focus back', async () => {
    const user = userEvent.setup()
    render(<Timeline />)
    const timeline = screen.getByRole('application', { name: 'Timeline' })
    timeline.focus()
    await act(async () => {
      timeline.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: 10,
          clientY: 10,
        }),
      )
    })
    await screen.findByRole('menu')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(timeline)
  })

  it('runs an item and closes', async () => {
    const user = userEvent.setup()
    const onSplit = vi.fn()
    render(<Timeline onSplit={onSplit} />)
    await act(async () => {
      screen.getByRole('application').dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: 50,
          clientY: 50,
        }),
      )
    })
    await user.click(await screen.findByRole('menuitem', { name: /Split clip/ }))
    expect(onSplit).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})

describe('menu shortcuts', () => {
  it('format `keys` for the platform, with spoken text for screen readers', async () => {
    render(<Timeline />)
    await act(async () => {
      screen.getByRole('application').dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: 5,
          clientY: 5,
        }),
      )
    })
    const shortcut = (await screen.findByRole('menu')).querySelector(
      '[data-slot="dropdown-menu-shortcut"]',
    )!
    expect(shortcut).toHaveTextContent(formatShortcut('mod+b'))
    expect(shortcut.querySelector('.sr-only')).toHaveTextContent(
      formatShortcut('mod+b', { spoken: true }),
    )
  })

  it('keep plain children in ContextMenuShortcut', async () => {
    const user = userEvent.setup()
    render(
      <ContextMenu>
        <ContextMenuTrigger>Area</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            Copy <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Area') })
    expect(await screen.findByText('⌘C')).toHaveAttribute('data-slot', 'context-menu-shortcut')
  })
})
