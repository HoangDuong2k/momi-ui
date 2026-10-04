import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../accordion'
import { Alert } from '../alert'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../breadcrumb'
import { getPaginationRange, Pagination } from '../pagination'
import { Progress } from '../progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'

describe('Tabs', () => {
  it('switches panels and styles triggers by list variant', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="account">
        <TabsList variant="underline">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account panel</TabsContent>
        <TabsContent value="billing">Billing panel</TabsContent>
      </Tabs>,
    )
    const billing = screen.getByRole('tab', { name: 'Billing' })
    expect(billing.className).toContain('after:absolute')
    await user.click(billing)
    expect(billing).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Billing panel')
  })
})

describe('Accordion', () => {
  it('expands an item', async () => {
    const user = userEvent.setup()
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>Yes, built on Radix.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    const trigger = screen.getByRole('button', { name: 'Is it accessible?' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Yes, built on Radix.')).toBeVisible()
  })
})

describe('getPaginationRange', () => {
  it('returns every page when they fit', () => {
    expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('keeps a constant number of slots', () => {
    expect(getPaginationRange(1, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 10])
    expect(getPaginationRange(5, 10)).toEqual([1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 10])
    expect(getPaginationRange(10, 10)).toEqual([1, 'ellipsis-start', 6, 7, 8, 9, 10])
  })
})

describe('Pagination', () => {
  it('works uncontrolled and reports changes', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination pageCount={10} onPageChange={onPageChange} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
  })
})

describe('Table', () => {
  it('exposes sort state on sortable headers', async () => {
    const user = userEvent.setup()
    const onSort = vi.fn()
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sort="asc" onSort={onSort}>
              Name
            </TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Linh</TableCell>
            <TableCell>linh@momi.dev</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const header = screen.getByRole('columnheader', { name: 'Name' })
    expect(header).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getByRole('columnheader', { name: 'Email' })).not.toHaveAttribute('aria-sort')
    await user.click(screen.getByRole('button', { name: 'Name' }))
    expect(onSort).toHaveBeenCalledOnce()
  })
})

describe('Progress', () => {
  it('reports its value', () => {
    render(<Progress value={40} label="Uploading" showValue />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40')
    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('is indeterminate without a value', () => {
    render(<Progress aria-label="Loading" />)
    expect(screen.getByRole('progressbar', { name: 'Loading' })).not.toHaveAttribute(
      'aria-valuenow',
    )
  })
})

describe('Alert', () => {
  it('renders title, description and a dismiss button', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Alert tone="success" title="Payment received" onClose={onClose}>
        Your invoice is paid.
      </Alert>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Payment received')
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})

describe('Breadcrumb', () => {
  it('marks the current page', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(screen.getByText('Settings')).toHaveAttribute('aria-current', 'page')
  })
})
