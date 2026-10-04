import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar, AvatarGroup, getInitials } from '../avatar'
import { Badge } from '../badge'
import { Grid, Stack } from '../layout'
import { Separator } from '../separator'
import { Heading } from '../typography'

describe('Avatar', () => {
  it('builds initials from a name', () => {
    expect(getInitials('Nguyen Van An')).toBe('NA')
    expect(getInitials('momi')).toBe('M')
    expect(getInitials('  ')).toBe('')
  })

  it('shows initials as an accessible image when there is no src', () => {
    render(<Avatar name="Linh Tran" />)
    expect(screen.getByRole('img', { name: 'Linh Tran' })).toHaveTextContent('LT')
  })

  it('collapses extra avatars into +N', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="A B" />
        <Avatar name="C D" />
        <Avatar name="E F" />
        <Avatar name="G H" />
      </AvatarGroup>,
    )
    expect(screen.getByText('+2')).toBeInTheDocument()
    expect(screen.queryByText('EF')).not.toBeInTheDocument()
  })
})

describe('Badge', () => {
  it('maps tone + variant to token classes', () => {
    render(
      <Badge variant="solid" tone="success">
        Active
      </Badge>,
    )
    expect(screen.getByText('Active')).toHaveClass('bg-success', 'text-success-foreground')
  })
})

describe('Layout', () => {
  it('turns responsive grid columns into CSS variables', () => {
    render(<Grid data-testid="grid" columns={{ base: 1, md: 3 }} gap={6} />)
    const grid = screen.getByTestId('grid')
    expect(grid).toHaveClass('grid-cols-(--cols)', 'md:grid-cols-(--cols-md)', 'gap-(--gap)')
    expect(grid.style.getPropertyValue('--cols-md')).toBe('repeat(3, minmax(0, 1fr))')
    expect(grid.style.getPropertyValue('--gap')).toBe('1.5rem')
  })

  it('supports responsive stack direction', () => {
    render(<Stack data-testid="stack" direction={{ base: 'column', md: 'row' }} />)
    expect(screen.getByTestId('stack')).toHaveClass('flex-col', 'md:flex-row')
  })
})

describe('Typography', () => {
  it('keeps the semantic level separate from the visual size', () => {
    render(
      <Heading as="h1" size="md">
        Title
      </Heading>,
    )
    const heading = screen.getByRole('heading', { level: 1, name: 'Title' })
    expect(heading).toHaveClass('text-xl')
  })
})

describe('Separator', () => {
  it('renders a labelled divider', () => {
    render(<Separator label="or" />)
    expect(screen.getByText('or')).toBeInTheDocument()
  })
})
