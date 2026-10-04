import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DataTable, type DataTableColumnDef } from '../data-table'

interface Person {
  id: string
  name: string
  team: string
  email: string
  age: number
}

const people: Person[] = [
  { id: 'p1', name: 'Linh', team: 'Design', email: 'linh@momi.dev', age: 31 },
  { id: 'p2', name: 'An', team: 'Design', email: 'an@momi.dev', age: 24 },
  { id: 'p3', name: 'Minh', team: 'Engineering', email: 'minh@momi.dev', age: 28 },
]

const columns: DataTableColumnDef<Person>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, pin: 'left' },
  { id: 'team', header: 'Team', accessor: 'team' },
  { id: 'email', header: 'Email', accessor: 'email' },
  {
    id: 'age',
    header: 'Age',
    accessor: 'age',
    sortable: true,
    align: 'end',
    pin: 'right',
    footer: (rows) => `Avg ${Math.round(rows.reduce((s, r) => s + r.age, 0) / rows.length)}`,
  },
]

const bodyNames = () =>
  screen
    .getAllByRole('row')
    .filter((r) => r.hasAttribute('data-dt-row'))
    .map((r) => within(r).getAllByRole('cell')[0].textContent)

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DataTable', () => {
  it('sorts with the header button: asc → desc → none', async () => {
    const user = userEvent.setup()
    render(<DataTable aria-label="People" data={people} columns={columns} />)
    const header = screen.getByRole('columnheader', { name: 'Name' })
    expect(header).toHaveAttribute('aria-sort', 'none')

    await user.click(within(header).getByRole('button'))
    expect(header).toHaveAttribute('aria-sort', 'ascending')
    expect(bodyNames()).toEqual(['An', 'Linh', 'Minh'])

    await user.click(within(header).getByRole('button'))
    expect(bodyNames()).toEqual(['Minh', 'Linh', 'An'])

    await user.click(within(header).getByRole('button'))
    expect(header).toHaveAttribute('aria-sort', 'none')
    expect(bodyNames()).toEqual(['Linh', 'An', 'Minh'])
  })

  it('pins columns to the left and right edges', () => {
    render(<DataTable data={people} columns={columns} />)
    const name = screen.getByRole('columnheader', { name: 'Name' })
    const age = screen.getByRole('columnheader', { name: 'Age' })
    expect(name).toHaveClass('sticky')
    expect(name.style.insetInlineStart).toBe('0px')
    expect(age).toHaveClass('sticky')
    expect(age.style.insetInlineEnd).toBe('0px')
    expect(screen.getByRole('columnheader', { name: 'Team' })).not.toHaveClass('sticky')
  })

  it('renders a footer computed from the rows', () => {
    render(<DataTable data={people} columns={columns} />)
    expect(screen.getByText('Avg 28').closest('tfoot')).not.toBeNull()
  })

  it('groups headers with colSpan and merges body cells with span()', () => {
    const grouped: DataTableColumnDef<Person>[] = [
      {
        id: 'team',
        header: 'Team',
        accessor: 'team',
        span: (_row, index) =>
          index === 0 ? { rowSpan: 2 } : index === 1 ? { hidden: true } : undefined,
      },
      {
        id: 'person',
        header: 'Person',
        columns: [
          { id: 'name', header: 'Name', accessor: 'name' },
          { id: 'email', header: 'Email', accessor: 'email' },
        ],
      },
    ]
    render(<DataTable data={people} columns={grouped} />)
    expect(screen.getByRole('columnheader', { name: 'Person' })).toHaveAttribute('colspan', '2')
    expect(screen.getByRole('columnheader', { name: 'Team' })).toHaveAttribute('rowspan', '2')
    expect(screen.getByRole('cell', { name: 'Design' })).toHaveAttribute('rowspan', '2')
    expect(screen.getAllByRole('cell', { name: 'Design' })).toHaveLength(1)
  })

  it('expands rows', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        data={people}
        columns={columns}
        renderExpanded={(row) => <p>Details for {row.name}</p>}
        getRowCanExpand={(row) => row.id !== 'p3'}
      />,
    )
    expect(screen.getAllByRole('button', { name: 'Expand row' })).toHaveLength(2)
    const toggle = screen.getAllByRole('button', { name: 'Expand row' })[0]
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const details = screen.getByText('Details for Linh')
    expect(details.closest('tr')).toHaveAttribute('id', toggle.getAttribute('aria-controls'))
  })

  it('reorders rows with the keyboard and is disabled while sorted', async () => {
    const user = userEvent.setup()
    const onRowReorder = vi.fn()
    const { rerender } = render(
      <DataTable data={people} columns={columns} onRowReorder={onRowReorder} />,
    )
    const [first] = screen.getAllByRole('button', { name: 'Reorder row' })
    first.focus()
    await user.keyboard('{ArrowDown}')
    expect(onRowReorder).toHaveBeenCalledWith(
      expect.objectContaining({ from: 0, to: 1, rows: [people[1], people[0], people[2]] }),
    )

    rerender(
      <DataTable
        data={people}
        columns={columns}
        onRowReorder={onRowReorder}
        sort={{ columnId: 'name', direction: 'asc' }}
      />,
    )
    expect(screen.getAllByRole('button', { name: 'Reorder row' })[0]).toBeDisabled()
  })

  it('reorders rows by dragging the handle', () => {
    const onRowReorder = vi.fn()
    const original = HTMLElement.prototype.getBoundingClientRect
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.dataset.dtRow !== undefined) {
        const top = Number(this.dataset.dtRow) * 40
        return {
          top,
          bottom: top + 40,
          height: 40,
          left: 0,
          right: 0,
          width: 0,
          x: 0,
          y: top,
          toJSON() {},
        } as DOMRect
      }
      return original.call(this)
    })
    render(<DataTable data={people} columns={columns} onRowReorder={onRowReorder} />)
    const [handle] = screen.getAllByRole('button', { name: 'Reorder row' })
    fireEvent.pointerDown(handle, { button: 0, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(handle, { clientY: 105, pointerId: 1 })
    expect(screen.getAllByRole('row').find((r) => r.dataset.drop)).toHaveAttribute(
      'data-drop',
      'after',
    )
    fireEvent.pointerUp(handle, { clientY: 105, pointerId: 1 })
    expect(onRowReorder).toHaveBeenCalledWith(expect.objectContaining({ from: 0, to: 2 }))
  })

  it('resizes columns with the keyboard', async () => {
    const user = userEvent.setup()
    const onColumnWidthsChange = vi.fn()
    render(
      <DataTable
        data={people}
        columns={columns}
        resizableColumns
        onColumnWidthsChange={onColumnWidthsChange}
      />,
    )
    const handle = screen.getByRole('separator', { name: 'Resize Team column' })
    expect(handle).toHaveAttribute('aria-valuenow', '160')
    handle.focus()
    await user.keyboard('{ArrowRight}')
    expect(onColumnWidthsChange).toHaveBeenCalledWith({ team: 176 })
  })

  it('keeps pinned rows in the header and footer sections', () => {
    render(
      <DataTable data={people} columns={columns} pinnedRows={{ top: ['p3'], bottom: ['p1'] }} />,
    )
    expect(screen.getByRole('cell', { name: 'Minh' }).closest('thead')).not.toBeNull()
    expect(screen.getByRole('cell', { name: 'Linh' }).closest('tfoot')).not.toBeNull()
    expect(bodyNames()).toEqual(['An'])
  })

  it('shows an empty state', () => {
    render(<DataTable data={[]} columns={columns} emptyState="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('renders only the visible rows when virtualized', () => {
    // jsdom has no layout: give the scroll area and the measured rows real sizes.
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.dataset.slot === 'data-table') return 400
      if (this.tagName === 'TBODY') return 40
      return 0
    })
    const many = Array.from({ length: 1000 }, (_, i) => ({
      ...people[i % 3],
      id: `row-${i}`,
      name: `Person ${i}`,
    }))
    render(
      <DataTable
        aria-label="Many"
        data={many}
        columns={columns}
        maxHeight={400}
        virtualize
        estimateRowHeight={40}
      />,
    )
    const rendered = screen.getAllByRole('row').filter((r) => r.hasAttribute('data-dt-row'))
    expect(rendered.length).toBeGreaterThan(5)
    expect(rendered.length).toBeLessThan(50)
    expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount', '1002')
  })
})
