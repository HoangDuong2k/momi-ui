import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu'

// Radix opens/toggles menus on pointerdown.
const press = (el: Element) =>
  fireEvent.pointerDown(el, { button: 0, ctrlKey: false, pointerType: 'mouse' })
// Radix attaches its outside-press listener on the next tick after opening.
const tick = () => act(() => new Promise((resolve) => setTimeout(resolve, 10)))

function Menu({ onInteractOutside }: { onInteractOutside?: (prevented: boolean) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Project</DropdownMenuTrigger>
      <DropdownMenuContent onInteractOutside={(e) => onInteractOutside?.(e.defaultPrevented)}>
        <DropdownMenuItem>Save</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

describe('DropdownMenu trigger presses', () => {
  // In a browser the content stays mounted while it animates closed. A press on the trigger then
  // reopened the menu and the closing content dismissed it again as an "outside" press. The
  // trigger's own toggle must be the only thing that handles presses on it.
  it('never treats a press on its own trigger as an outside press', async () => {
    const onInteractOutside = vi.fn()
    render(<Menu onInteractOutside={onInteractOutside} />)
    const trigger = screen.getByRole('button', { name: 'Project' })
    press(trigger)
    await tick()
    press(trigger)
    expect(onInteractOutside).toHaveBeenLastCalledWith(true)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('still dismisses on presses elsewhere', async () => {
    const onInteractOutside = vi.fn()
    render(<Menu onInteractOutside={onInteractOutside} />)
    const trigger = screen.getByRole('button', { name: 'Project' })
    press(trigger)
    await tick()
    press(document.body)
    expect(onInteractOutside).toHaveBeenLastCalledWith(false)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens again right after a selection', async () => {
    render(<Menu />)
    const trigger = screen.getByRole('button', { name: 'Project' })
    press(trigger)
    await tick()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Save' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    press(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})
