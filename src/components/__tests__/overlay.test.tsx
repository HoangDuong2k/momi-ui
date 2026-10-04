import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../alert-dialog'
import { Button } from '../button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../drawer'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select'
import { toast, Toaster } from '../toast'
import { Tooltip } from '../tooltip'

describe('Dialog', () => {
  it('opens from its trigger and closes with the close button', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Edit profile</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    )
    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit profile' })
    expect(dialog).toHaveAccessibleDescription('Make changes to your profile.')
    await user.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})

describe('AlertDialog', () => {
  it('runs the action and closes', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button tone="danger">Delete</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction tone="danger" onClick={onDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Delete project?' })
    const action = screen
      .getAllByRole('button', { name: 'Delete' })
      .find((b) => dialog.contains(b))!
    expect(action).toHaveClass('bg-destructive')
    await user.click(action)
    expect(onDelete).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  })
})

describe('Drawer', () => {
  it('renders on the requested side', async () => {
    const user = userEvent.setup()
    render(
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent side="left">
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>Narrow down results.</DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>,
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByRole('dialog', { name: 'Filters' })).toHaveAttribute('data-side', 'left')
  })
})

describe('Popover', () => {
  it('toggles its content', async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <PopoverTrigger>Settings</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    )
    await user.click(screen.getByText('Settings'))
    expect(screen.getByText('Popover body')).toBeInTheDocument()
  })
})

describe('Tooltip', () => {
  it('shows on hover', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Copy link" delayDuration={0}>
        <button type="button">Copy</button>
      </Tooltip>,
    )
    await user.hover(screen.getByRole('button', { name: 'Copy' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Copy link')
  })

  it('renders only the trigger when disabled', () => {
    render(
      <Tooltip content="Hidden" disabled>
        <button type="button">Plain</button>
      </Tooltip>,
    )
    expect(screen.getByRole('button', { name: 'Plain' })).not.toHaveAttribute('data-state')
  })
})

describe('DropdownMenu', () => {
  it('selects items and toggles checkbox items', async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()
    const onCheckedChange = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onRename}>Rename</DropdownMenuItem>
          <DropdownMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Pin
          </DropdownMenuCheckboxItem>
          <DropdownMenuItem variant="danger">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await user.click(screen.getByText('Actions'))
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute(
      'data-variant',
      'danger',
    )
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Pin' }))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    await user.click(screen.getByText('Actions'))
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }))
    expect(onRename).toHaveBeenCalledOnce()
  })
})

describe('Select', () => {
  it('picks a value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="mango">Mango</SelectItem>
        </SelectContent>
      </Select>,
    )
    const trigger = screen.getByRole('combobox', { name: 'Fruit' })
    expect(trigger).toHaveTextContent('Pick a fruit')
    await user.click(trigger)
    await user.click(screen.getByRole('option', { name: 'Mango' }))
    expect(onValueChange).toHaveBeenCalledWith('mango')
    expect(trigger).toHaveTextContent('Mango')
  })
})

describe('toast', () => {
  it('shows, updates and dismisses toasts', async () => {
    render(<Toaster />)
    let id = ''
    act(() => {
      id = toast.loading('Saving…')
    })
    expect(await screen.findByText('Saving…')).toBeInTheDocument()
    act(() => {
      toast.success('Saved', { id, description: 'All changes stored.' })
    })
    expect(await screen.findByText('Saved')).toBeInTheDocument()
    expect(screen.queryByText('Saving…')).not.toBeInTheDocument()
    expect(screen.getByText('All changes stored.')).toBeInTheDocument()
    act(() => toast.dismiss(id))
    await waitFor(() => expect(screen.queryByText('Saved')).not.toBeInTheDocument())
  })

  it('shows a "Clear all" button once enough toasts are open', async () => {
    const user = userEvent.setup()
    render(<Toaster />)
    act(() => {
      toast('First', { duration: Infinity })
    })
    expect(await screen.findByText('First')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument()

    act(() => {
      toast('Second', { duration: Infinity })
      toast('Third', { duration: Infinity })
    })
    const clearAll = await screen.findByRole('button', { name: 'Clear all (3 notifications)' })
    await user.click(clearAll)
    await waitFor(() => {
      expect(screen.queryByText('First')).not.toBeInTheDocument()
      expect(screen.queryByText('Third')).not.toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument()
  })

  it('can hide the "Clear all" button', async () => {
    render(<Toaster clearAll={false} />)
    act(() => {
      toast('One', { duration: Infinity })
      toast('Two', { duration: Infinity })
    })
    expect(await screen.findByText('Two')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument()
    act(() => toast.dismiss())
  })
})
