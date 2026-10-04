import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../button'
import { ButtonGroup } from '../button-group'
import { IconButton } from '../icon-button'

describe('Button', () => {
  it('renders a type="button" by default and handles clicks', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('type', 'button')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies variant + tone classes, defaulting outline to the neutral tone', () => {
    render(
      <>
        <Button>Solid</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="soft" tone="danger">
          Delete
        </Button>
      </>,
    )
    expect(screen.getByRole('button', { name: 'Solid' })).toHaveClass('bg-primary')
    expect(screen.getByRole('button', { name: 'Outline' })).toHaveClass('border-input')
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('text-destructive')
  })

  it('disables the button and marks it busy while loading', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Submit
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Submit' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders its child with asChild', () => {
    render(
      <Button asChild variant="outline">
        <a href="/docs">Docs</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).toHaveAttribute('href', '/docs')
    expect(link).toHaveAttribute('data-slot', 'button')
    expect(link).not.toHaveAttribute('type')
  })

  it('lets className override variant classes', () => {
    render(<Button className="h-14">Tall</Button>)
    const button = screen.getByRole('button', { name: 'Tall' })
    expect(button).toHaveClass('h-14')
    expect(button).not.toHaveClass('h-9')
  })
})

describe('IconButton', () => {
  it('requires and exposes an accessible name', () => {
    render(<IconButton aria-label="Settings">⚙</IconButton>)
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveClass('size-9')
  })
})

describe('ButtonGroup', () => {
  it('renders a group', () => {
    render(
      <ButtonGroup aria-label="Alignment">
        <Button variant="outline">Left</Button>
        <Button variant="outline">Right</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group', { name: 'Alignment' })).toBeInTheDocument()
  })
})
