import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from '../alert-dialog'
import { ColorPicker } from '../color-picker'
import { Combobox } from '../combobox'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../context-menu'
import { DatePicker } from '../date-picker'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../dialog'
import { Drawer, DrawerContent, DrawerTitle } from '../drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../hover-card'
import { Kanban } from '../kanban'
import { Lightbox } from '../lightbox'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { PortalProvider } from '../portal-provider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select'
import { Tooltip } from '../tooltip'

afterEach(() => {
  vi.restoreAllMocks()
})

/** A frame element to portal into, like an app embedded in part of the page. */
function useFrame() {
  const frame = document.createElement('div')
  frame.dataset.testid = 'frame'
  document.body.appendChild(frame)
  return frame
}

const inFrame = (frame: HTMLElement, el: Element | null) => Boolean(el && frame.contains(el))

describe('PortalProvider', () => {
  it('mounts every Radix overlay in its container', async () => {
    const frame = useFrame()
    render(
      <PortalProvider container={frame}>
        <Popover open>
          <PopoverTrigger>P</PopoverTrigger>
          <PopoverContent>Popover body</PopoverContent>
        </Popover>
        <DropdownMenu open modal={false}>
          <DropdownMenuTrigger>M</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Menu item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <HoverCard open>
          <HoverCardTrigger>H</HoverCardTrigger>
          <HoverCardContent>Hover body</HoverCardContent>
        </HoverCard>
        <Select open>
          <SelectTrigger aria-label="Fruit">
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Apple</SelectItem>
          </SelectContent>
        </Select>
        <Tooltip content="Tip body" open>
          <button type="button">T</button>
        </Tooltip>
      </PortalProvider>,
    )
    expect(inFrame(frame, screen.getByText('Popover body'))).toBe(true)
    expect(inFrame(frame, screen.getByText('Menu item'))).toBe(true)
    expect(inFrame(frame, screen.getByText('Hover body'))).toBe(true)
    expect(inFrame(frame, screen.getByRole('option', { name: 'Apple' }))).toBe(true)
    expect(inFrame(frame, document.querySelector('[data-slot="tooltip-content"]'))).toBe(true)
  })

  it('mounts dialogs, drawers and the lightbox in its container', () => {
    const frame = useFrame()
    render(
      <PortalProvider container={frame}>
        <Dialog open>
          <DialogContent>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>d</DialogDescription>
          </DialogContent>
        </Dialog>
        <AlertDialog open>
          <AlertDialogContent aria-describedby={undefined}>
            <AlertDialogTitle>Alert title</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>
        <Drawer open>
          <DrawerContent aria-describedby={undefined}>
            <DrawerTitle>Drawer title</DrawerTitle>
          </DrawerContent>
        </Drawer>
        <Lightbox items={[{ type: 'image', src: '/a.png', alt: 'Shot' }]} index={0} />
      </PortalProvider>,
    )
    for (const text of ['Dialog title', 'Alert title', 'Drawer title']) {
      expect(inFrame(frame, screen.getByText(text))).toBe(true)
    }
    expect(inFrame(frame, document.querySelector('[data-slot="lightbox-overlay"]'))).toBe(true)
  })

  it('mounts ContextMenu, Combobox, DatePicker and ColorPicker popups in its container', async () => {
    const user = userEvent.setup()
    const frame = useFrame()
    render(
      <PortalProvider container={frame}>
        <ContextMenu>
          <ContextMenuTrigger>Area</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Context item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <Combobox aria-label="Fruit" options={[{ value: 'a', label: 'Apple' }]} />
        <DatePicker aria-label="Due" />
        <ColorPicker aria-label="Color" />
      </PortalProvider>,
    )
    fireEvent.contextMenu(screen.getByText('Area'))
    expect(inFrame(frame, screen.getByText('Context item'))).toBe(true)
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('combobox', { name: 'Fruit' }))
    expect(inFrame(frame, screen.getByRole('option', { name: 'Apple' }))).toBe(true)
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('button', { name: 'Due' }))
    expect(inFrame(frame, screen.getByRole('grid'))).toBe(true)
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('button', { name: 'Color' }))
    expect(inFrame(frame, document.querySelector('[data-slot="color-picker-content"]'))).toBe(true)
  })

  it('lets a component prop override the provider', () => {
    const frame = useFrame()
    const other = document.createElement('section')
    document.body.appendChild(other)
    render(
      <PortalProvider container={frame}>
        <Popover open>
          <PopoverTrigger>P</PopoverTrigger>
          <PopoverContent container={other}>Elsewhere</PopoverContent>
        </Popover>
      </PortalProvider>,
    )
    expect(other.contains(screen.getByText('Elsewhere'))).toBe(true)
    expect(frame.contains(screen.getByText('Elsewhere'))).toBe(false)
  })

  it('container={null} on a dialog means document.body, even under a provider', () => {
    const frame = useFrame()
    render(
      <PortalProvider container={frame}>
        <Dialog open>
          <DialogContent container={null} aria-describedby={undefined}>
            <DialogTitle>Body dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      </PortalProvider>,
    )
    expect(frame.contains(screen.getByText('Body dialog'))).toBe(false)
  })

  it('nested providers override only what they set', () => {
    const outer = useFrame()
    const inner = document.createElement('div')
    document.body.appendChild(inner)
    render(
      <PortalProvider container={outer} collisionPadding={20}>
        <PortalProvider container={inner}>
          <Popover open>
            <PopoverTrigger>P</PopoverTrigger>
            <PopoverContent>Inner</PopoverContent>
          </Popover>
        </PortalProvider>
      </PortalProvider>,
    )
    expect(inner.contains(screen.getByText('Inner'))).toBe(true)
  })

  it('keeps using document.body without a provider', () => {
    render(
      <Popover open>
        <PopoverTrigger>P</PopoverTrigger>
        <PopoverContent>Body popover</PopoverContent>
      </Popover>,
    )
    expect(
      screen.getByText('Body popover').closest('[data-radix-popper-content-wrapper]')
        ?.parentElement,
    ).toBe(document.body)
  })

  it('places the Kanban drag preview under the pointer inside an offset container', () => {
    const frame = useFrame()
    // The frame is a containing block for fixed elements, sitting at (200, 120) in the window.
    const frameAt = { x: 200, y: 120 }
    const original = HTMLElement.prototype.getBoundingClientRect
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const rect = (left: number, top: number, width = 0, height = 0) =>
        ({
          left,
          top,
          width,
          height,
          right: left + width,
          bottom: top + height,
          x: left,
          y: top,
          toJSON() {},
        }) as DOMRect
      if (this.dataset.slot === 'kanban-overlay') return rect(frameAt.x, frameAt.y, 260, 60)
      if (this.dataset.kanbanCard) return rect(10, 10, 260, 60)
      return original.call(this)
    })
    render(
      <PortalProvider container={frame}>
        <Kanban
          columns={[{ id: 'a', title: 'A' }]}
          defaultValue={{ a: [{ id: '1', title: 'One' }] }}
          renderCard={(t: { id: string; title: string }) => <span>{t.title}</span>}
        />
      </PortalProvider>,
    )
    const card = screen.getByText('One').closest('li')!
    // Pressed 15px right / 20px below the card's corner.
    fireEvent.pointerDown(card, { button: 0, clientX: 25, clientY: 30, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 300, clientY: 200, pointerId: 1 })
    const overlay = document.querySelector<HTMLElement>('[data-slot="kanban-overlay"]')!
    expect(frame.contains(overlay)).toBe(true)
    // Client (300 - 15, 200 - 20) minus the container's corner (200, 120).
    expect(overlay.style.transform).toBe('translate3d(85px, 60px, 0)')
    // The page scrolls 50px down mid-drag: the frame (and the preview's origin) moves up.
    frameAt.y = 70
    fireEvent.scroll(document)
    expect(overlay.style.transform).toBe('translate3d(85px, 110px, 0)')
    fireEvent.pointerUp(window, { clientX: 300, clientY: 200, pointerId: 1 })
  })
})

describe('Drawer modal={false}', () => {
  function SideSheet({
    onOpenChange,
    closeOnInteractOutside,
  }: {
    onOpenChange: (open: boolean) => void
    closeOnInteractOutside?: boolean
  }) {
    const [count, setCount] = React.useState(0)
    return (
      <>
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          Outside {count}
        </button>
        <Drawer open modal={false} onOpenChange={onOpenChange}>
          <DrawerContent
            aria-describedby={undefined}
            closeOnInteractOutside={closeOnInteractOutside}
          >
            <DrawerTitle>Edit task</DrawerTitle>
            <input aria-label="Title" />
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  it('keeps the page usable and stays open when asked to', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<SideSheet onOpenChange={onOpenChange} closeOnInteractOutside={false} />)
    expect(document.querySelector('[data-slot="drawer-overlay"]')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Outside 0' }))
    expect(screen.getByRole('button', { name: 'Outside 1' })).toHaveFocus()
    expect(onOpenChange).not.toHaveBeenCalled()
    screen.getByRole('textbox', { name: 'Title' }).focus()
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes on an outside press by default', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<SideSheet onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: 'Outside 0' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
