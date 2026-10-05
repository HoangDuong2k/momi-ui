import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../dialog'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { toast, Toaster } from '../toast'

afterEach(() => {
  act(() => toast.dismiss())
})

function Settings({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  return (
    <>
      <Toaster />
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Storage</DialogDescription>
          <button type="button" onClick={() => toast.success('Cache cleared')}>
            Clear cache
          </button>
        </DialogContent>
      </Dialog>
    </>
  )
}

describe('toasts and other layers', () => {
  it('Escape closes the dialog even while a toast is showing', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Settings onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: 'Clear cache' }))
    expect(await screen.findByText('Cache cleared')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
    // The notification is not what Escape was for: it stays.
    expect(screen.getByText('Cache cleared')).toBeInTheDocument()
  })

  it('Escape closes a popover opened before the toast appeared', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Toaster />
        <Popover>
          <PopoverTrigger>Filters</PopoverTrigger>
          <PopoverContent>
            <button type="button" onClick={() => toast('Saved')}>
              Save
            </button>
          </PopoverContent>
        </Popover>
      </>,
    )
    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await screen.findByText('Saved')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
  })

  it('clicking a toast does not dismiss the dialog behind it', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Settings onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: 'Clear cache' }))
    await user.click(await screen.findByText('Cache cleared'))
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('Escape with focus on a toast closes only that toast', async () => {
    const user = userEvent.setup()
    render(<Toaster />)
    act(() => {
      toast('Uploaded', { action: { label: 'Undo', onClick: () => {} } })
    })
    screen.getByRole('button', { name: 'Undo' }).focus()
    await user.keyboard('{Escape}')
    await vi.waitFor(() => expect(screen.queryByText('Uploaded')).not.toBeInTheDocument())
  })
})

describe('toast behavior', () => {
  it('auto-dismisses, pausing while hovered', () => {
    vi.useFakeTimers()
    try {
      render(<Toaster duration={1000} />)
      act(() => {
        toast('Exported')
      })
      const item = screen.getByText('Exported').closest('li')!
      act(() => vi.advanceTimersByTime(600))
      fireEvent.pointerMove(item)
      act(() => vi.advanceTimersByTime(2000))
      expect(item).toHaveAttribute('data-state', 'open')
      fireEvent.pointerLeave(item.parentElement!)
      act(() => vi.advanceTimersByTime(300))
      expect(item).toHaveAttribute('data-state', 'open')
      act(() => vi.advanceTimersByTime(200))
      expect(item).toHaveAttribute('data-state', 'closed')
    } finally {
      vi.useRealTimers()
    }
  })

  it('restarts the timer when a toast is updated, and loading toasts wait', () => {
    vi.useFakeTimers()
    try {
      render(<Toaster duration={1000} />)
      let id = ''
      act(() => {
        id = toast.loading('Rendering')
      })
      act(() => vi.advanceTimersByTime(5000))
      expect(screen.getByText('Rendering').closest('li')).toHaveAttribute('data-state', 'open')
      act(() => {
        toast.success('Rendered', { id })
      })
      act(() => vi.advanceTimersByTime(900))
      expect(screen.getByText('Rendered').closest('li')).toHaveAttribute('data-state', 'open')
      act(() => vi.advanceTimersByTime(200))
      expect(screen.getByText('Rendered').closest('li')).toHaveAttribute('data-state', 'closed')
    } finally {
      vi.useRealTimers()
    }
  })

  it('dismisses with a swipe towards the edge, and snaps back on a short one', () => {
    render(<Toaster position="bottom-right" />)
    act(() => {
      toast('Swipe me')
    })
    const item = screen.getByText('Swipe me').closest('li')!
    fireEvent.pointerDown(item, { button: 0, clientX: 100, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(item, { clientX: 120, clientY: 10, pointerId: 1 })
    expect(item).toHaveAttribute('data-swipe', 'move')
    fireEvent.pointerUp(item, { clientX: 120, clientY: 10, pointerId: 1 })
    expect(item).toHaveAttribute('data-swipe', 'cancel')
    expect(item).toHaveAttribute('data-state', 'open')

    // Moving away from the edge does not count.
    fireEvent.pointerDown(item, { button: 0, clientX: 100, clientY: 10, pointerId: 2 })
    fireEvent.pointerMove(item, { clientX: 20, clientY: 10, pointerId: 2 })
    fireEvent.pointerUp(item, { clientX: 20, clientY: 10, pointerId: 2 })
    expect(item).toHaveAttribute('data-state', 'open')

    fireEvent.pointerDown(item, { button: 0, clientX: 100, clientY: 10, pointerId: 3 })
    fireEvent.pointerMove(item, { clientX: 180, clientY: 10, pointerId: 3 })
    fireEvent.pointerUp(item, { clientX: 180, clientY: 10, pointerId: 3 })
    expect(item).toHaveAttribute('data-swipe', 'end')
    expect(item).toHaveAttribute('data-state', 'closed')
  })

  it('runs the action and closes the toast', async () => {
    const user = userEvent.setup()
    const onUndo = vi.fn()
    render(<Toaster />)
    act(() => {
      toast('Deleted', { action: { label: 'Undo', onClick: onUndo } })
    })
    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(onUndo).toHaveBeenCalled()
    expect(screen.getByText('Deleted').closest('li')).toHaveAttribute('data-state', 'closed')
  })

  it('"Clear all" works over an open dialog without closing it', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Settings onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: 'Clear cache' }))
    act(() => {
      toast('Second')
    })
    await user.click(await screen.findByRole('button', { name: /Clear all/ }))
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByText('Second').closest('li')).toHaveAttribute('data-state', 'closed')
  })

  it('announces danger toasts assertively', () => {
    render(<Toaster />)
    act(() => {
      toast.error('Export failed')
      toast.success('Saved')
    })
    expect(screen.getByText('Export failed').closest('li')).toHaveAttribute('role', 'alert')
    expect(screen.getByText('Saved').closest('li')).toHaveAttribute('role', 'status')
  })
})
