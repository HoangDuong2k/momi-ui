import { ArrowDownToLine, ArrowUpToLine, Ellipsis, PinOff } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Avatar,
  Badge,
  DataTable,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  Kbd,
  Text,
  type DataTableColumnDef,
  type Tone,
} from '../../src'
import { Example } from '../components/demo'
import { makeEmployees, shortDate, usd, type Employee } from '../lib/sample-data'

const statusTone: Record<Employee['status'], Tone> = {
  active: 'success',
  away: 'warning',
  offline: 'neutral',
}

function PersonCell({ row }: { row: Employee }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={row.name} size="sm" />
      <div className="min-w-0">
        <Text size="sm" weight="medium" truncate>
          {row.name}
        </Text>
        <Text size="xs" tone="muted" truncate>
          {row.role}
        </Text>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * 1. Sorting, pinned columns & rows, resizing, sticky header/footer
 * -----------------------------------------------------------------------------------------------*/

function DirectoryExample() {
  const data = useMemo(() => makeEmployees(40), [])
  const [pinned, setPinned] = useState<{ top: string[]; bottom: string[] }>({
    top: ['emp-1'],
    bottom: [],
  })

  const pinTo = (id: string, edge: 'top' | 'bottom' | null) =>
    setPinned((p) => ({
      top: edge === 'top' ? [...p.top.filter((x) => x !== id), id] : p.top.filter((x) => x !== id),
      bottom:
        edge === 'bottom'
          ? [...p.bottom.filter((x) => x !== id), id]
          : p.bottom.filter((x) => x !== id),
    }))

  const columns = useMemo<DataTableColumnDef<Employee>[]>(
    () => [
      {
        id: 'name',
        header: 'Employee',
        accessor: 'name',
        width: 240,
        sortable: true,
        pin: 'left',
        cell: ({ row }) => <PersonCell row={row} />,
        footer: (rows) => `${rows.length} people`,
      },
      { id: 'email', header: 'Email', accessor: 'email', width: 260 },
      { id: 'team', header: 'Team', accessor: 'team', width: 140, sortable: true },
      { id: 'location', header: 'Location', accessor: 'location', width: 170, sortable: true },
      {
        id: 'status',
        header: 'Status',
        accessor: 'status',
        width: 130,
        sortable: true,
        cell: ({ row }) => (
          <Badge size="sm" tone={statusTone[row.status]} dot className="capitalize">
            {row.status}
          </Badge>
        ),
      },
      {
        id: 'joined',
        header: 'Joined',
        accessor: 'joined',
        width: 140,
        sortable: true,
        cell: ({ row }) => shortDate(row.joined),
      },
      {
        id: 'salary',
        header: 'Salary',
        accessor: 'salary',
        width: 130,
        align: 'end',
        sortable: true,
        cell: ({ row }) => <span className="tabular-nums">{usd(row.salary)}</span>,
        footer: (rows) => (
          <span className="tabular-nums">{usd(rows.reduce((s, r) => s + r.salary, 0))}</span>
        ),
      },
      {
        id: 'rating',
        header: 'Rating',
        accessor: 'rating',
        width: 110,
        align: 'end',
        sortable: true,
        cell: ({ row }) => <span className="tabular-nums">{row.rating.toFixed(1)}</span>,
        footer: (rows) => `Ø ${(rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1)}`,
      },
      {
        id: 'actions',
        header: <span className="sr-only">Actions</span>,
        width: 64,
        align: 'center',
        pin: 'right',
        resizable: false,
        cell: ({ row, rowId }) => {
          const where = pinned.top.includes(rowId)
            ? 'top'
            : pinned.bottom.includes(rowId)
              ? 'bottom'
              : null
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton aria-label={`Actions for ${row.name}`} size="sm">
                  <Ellipsis />
                </IconButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled={where === 'top'} onSelect={() => pinTo(rowId, 'top')}>
                  <ArrowUpToLine />
                  Pin to top
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={where === 'bottom'}
                  onSelect={() => pinTo(rowId, 'bottom')}
                >
                  <ArrowDownToLine />
                  Pin to bottom
                </DropdownMenuItem>
                {where && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => pinTo(rowId, null)}>
                      <PinOff />
                      Unpin
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [pinned],
  )

  return (
    <DataTable
      aria-label="Team directory"
      variant="card"
      data={data}
      columns={columns}
      maxHeight={440}
      resizableColumns
      pinnedRows={pinned}
      defaultSort={{ columnId: 'joined', direction: 'desc' }}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * 2. Grouped headers (col-span) & merged cells (row-span)
 * -----------------------------------------------------------------------------------------------*/

interface Shift {
  id: string
  team: string
  member: string
  mon: string
  tue: string
  wed: string
  note?: string
}

const shifts: Shift[] = [
  { id: 's1', team: 'Design', member: 'Linh Tran', mon: '09–17', tue: '09–17', wed: 'Off' },
  { id: 's2', team: 'Design', member: 'An Pham', mon: '10–18', tue: 'Off', wed: '10–18' },
  {
    id: 's3',
    team: 'Engineering',
    member: 'Minh Nguyen',
    mon: '09–17',
    tue: '09–17',
    wed: '09–17',
  },
  {
    id: 's4',
    team: 'Engineering',
    member: 'Bao Le',
    mon: 'On call',
    tue: 'On call',
    wed: 'On call',
    note: 'Whole week on call',
  },
  { id: 's5', team: 'Engineering', member: 'Chi Vo', mon: '12–20', tue: '12–20', wed: 'Off' },
  { id: 's6', team: 'Support', member: 'Duy Ho', mon: '08–16', tue: '08–16', wed: '08–16' },
]

/** Row span for runs of equal values in a column. */
function spanRuns<T>(rows: T[], value: (row: T) => unknown) {
  return (row: T, index: number) => {
    if (index > 0 && value(rows[index - 1]) === value(row)) return { hidden: true }
    let span = 1
    while (index + span < rows.length && value(rows[index + span]) === value(row)) span++
    return span > 1 ? { rowSpan: span } : undefined
  }
}

function SpansExample() {
  const columns: DataTableColumnDef<Shift>[] = [
    {
      id: 'team',
      header: 'Team',
      accessor: 'team',
      width: 140,
      cellClassName: 'align-top font-medium',
      span: spanRuns(shifts, (r) => r.team),
    },
    { id: 'member', header: 'Member', accessor: 'member', width: 170 },
    {
      id: 'week',
      header: 'Week 41',
      columns: [
        {
          id: 'mon',
          header: 'Mon',
          accessor: 'mon',
          width: 110,
          align: 'center',
          // An on-call note spans the whole week.
          span: (row) => (row.note ? { colSpan: 3 } : undefined),
          cell: ({ row }) => row.note ?? row.mon,
        },
        {
          id: 'tue',
          header: 'Tue',
          accessor: 'tue',
          width: 110,
          align: 'center',
          span: (row) => (row.note ? { hidden: true } : undefined),
        },
        {
          id: 'wed',
          header: 'Wed',
          accessor: 'wed',
          width: 110,
          align: 'center',
          span: (row) => (row.note ? { hidden: true } : undefined),
        },
      ],
    },
  ]
  return (
    <DataTable
      aria-label="Shift schedule"
      data={shifts}
      columns={columns}
      bordered
      hoverable={false}
      variant="card"
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * 3. Expandable rows
 * -----------------------------------------------------------------------------------------------*/

interface Order {
  id: string
  customer: string
  date: Date
  items: { name: string; qty: number; price: number }[]
}

const orders: Order[] = [
  {
    id: 'ORD-1042',
    customer: 'Linh Tran',
    date: new Date(2026, 8, 28),
    items: [
      { name: 'momi Pro license', qty: 1, price: 190 },
      { name: 'Extra seat', qty: 3, price: 29 },
    ],
  },
  { id: 'ORD-1041', customer: 'Minh Nguyen', date: new Date(2026, 8, 26), items: [] },
  {
    id: 'ORD-1040',
    customer: 'An Pham',
    date: new Date(2026, 8, 21),
    items: [{ name: 'momi Team license', qty: 1, price: 490 }],
  },
]

const orderTotal = (o: Order) => o.items.reduce((s, i) => s + i.qty * i.price, 0)

function ExpandExample() {
  const columns: DataTableColumnDef<Order>[] = [
    { id: 'id', header: 'Order', accessor: 'id', width: 130, cellClassName: 'font-medium' },
    { id: 'customer', header: 'Customer', accessor: 'customer', width: 180 },
    {
      id: 'date',
      header: 'Date',
      accessor: 'date',
      width: 150,
      cell: ({ row }) => shortDate(row.date),
    },
    {
      id: 'items',
      header: 'Items',
      width: 100,
      align: 'end',
      accessor: (o) => o.items.length,
    },
    {
      id: 'total',
      header: 'Total',
      width: 120,
      align: 'end',
      accessor: orderTotal,
      cell: ({ row }) => <span className="tabular-nums">{usd(orderTotal(row))}</span>,
    },
  ]
  return (
    <DataTable
      aria-label="Orders"
      variant="card"
      data={orders}
      columns={columns}
      defaultExpanded={{ 'ORD-1042': true }}
      getRowCanExpand={(o) => o.items.length > 0}
      renderExpanded={(o) => (
        <div className="grid max-w-md gap-2">
          <Text size="xs" tone="muted" weight="medium">
            Line items
          </Text>
          {o.items.map((item) => (
            <div key={item.name} className="flex justify-between gap-4 text-sm">
              <span>
                {item.qty} × {item.name}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {usd(item.qty * item.price)}
              </span>
            </div>
          ))}
        </div>
      )}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * 4. Drag to reorder
 * -----------------------------------------------------------------------------------------------*/

interface Task {
  id: string
  title: string
  owner: string
  estimate: number
}

function ReorderExample() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', title: 'Design tokens audit', owner: 'Linh Tran', estimate: 3 },
    { id: 't2', title: 'DataTable virtualization', owner: 'Minh Nguyen', estimate: 5 },
    { id: 't3', title: 'Landing hero block', owner: 'An Pham', estimate: 2 },
    { id: 't4', title: 'Docs site skeleton', owner: 'Bao Le', estimate: 3 },
    { id: 't5', title: 'Publish v0.2 to npm', owner: 'Chi Vo', estimate: 1 },
  ])
  const columns: DataTableColumnDef<Task>[] = [
    {
      id: 'rank',
      header: '#',
      width: 56,
      align: 'center',
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">{tasks.indexOf(row) + 1}</span>
      ),
    },
    { id: 'title', header: 'Task', accessor: 'title', width: 260, cellClassName: 'font-medium' },
    { id: 'owner', header: 'Owner', accessor: 'owner', width: 170 },
    {
      id: 'estimate',
      header: 'Estimate',
      accessor: 'estimate',
      width: 110,
      align: 'end',
      cell: ({ row }) => `${row.estimate} d`,
    },
  ]
  return (
    <DataTable
      aria-label="Backlog"
      variant="card"
      data={tasks}
      columns={columns}
      onRowReorder={({ rows }) => setTasks(rows)}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * 5. Virtual scrolling
 * -----------------------------------------------------------------------------------------------*/

function VirtualExample() {
  const data = useMemo(() => makeEmployees(10_000, 7), [])
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [domRows, setDomRows] = useState(0)

  // Count the rows actually in the DOM to show what virtualization saves.
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const count = () => setDomRows(el.querySelectorAll('tr[data-dt-row]').length)
    const observer = new MutationObserver(count)
    observer.observe(el, { childList: true, subtree: true })
    const frame = requestAnimationFrame(count)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  const columns = useMemo<DataTableColumnDef<Employee>[]>(
    () => [
      {
        id: 'id',
        header: 'ID',
        accessor: (r) => Number(r.id.slice(4)),
        width: 90,
        sortable: true,
        pin: 'left',
      },
      { id: 'name', header: 'Name', accessor: 'name', width: 190, sortable: true, pin: 'left' },
      { id: 'email', header: 'Email', accessor: 'email', width: 260 },
      { id: 'team', header: 'Team', accessor: 'team', width: 140, sortable: true },
      { id: 'role', header: 'Role', accessor: 'role', width: 190 },
      { id: 'location', header: 'Location', accessor: 'location', width: 170, sortable: true },
      {
        id: 'salary',
        header: 'Salary',
        accessor: 'salary',
        width: 120,
        align: 'end',
        sortable: true,
        cell: ({ row }) => <span className="tabular-nums">{usd(row.salary)}</span>,
      },
    ],
    [],
  )

  return (
    <div ref={wrapperRef} className="grid w-full gap-3">
      <DataTable
        aria-label="10,000 employees"
        variant="card"
        size="sm"
        data={data}
        columns={columns}
        maxHeight={460}
        virtualize
        resizableColumns
        striped
        renderExpanded={(row) => (
          <Text size="sm" tone="muted">
            {row.name} works in {row.team} as {row.role}, based in {row.location}. Joined{' '}
            {shortDate(row.joined)} · {row.projects} active projects.
          </Text>
        )}
      />
      <Text size="sm" tone="muted">
        <span className="font-medium text-foreground tabular-nums">{domRows}</span> of{' '}
        {data.length.toLocaleString()} rows are in the DOM right now.
      </Text>
    </div>
  )
}

export default function DataTableDemo() {
  return (
    <div className="space-y-12">
      <Example
        title="Sorting, pinned columns & rows, resizing"
        description={
          <>
            Click headers to sort (asc → desc → off). Drag a header edge to resize (or focus it and
            use <Kbd>←</Kbd> <Kbd>→</Kbd>; double-click resets). Employee and actions columns are
            pinned; use a row&apos;s ⋯ menu to pin it to the top or bottom. Header and footer stay
            visible while scrolling.
          </>
        }
        layout="stack"
      >
        <DirectoryExample />
      </Example>

      <Example
        title="Grouped headers & merged cells"
        description="Column groups render col-spanning headers; span() merges body cells across rows or columns."
        layout="stack"
      >
        <SpansExample />
      </Example>

      <Example
        title="Expandable rows"
        description="renderExpanded + getRowCanExpand."
        layout="stack"
      >
        <ExpandExample />
      </Example>

      <Example
        title="Drag to reorder"
        description={
          <>
            Drag the handle, or focus it and press <Kbd>↑</Kbd> <Kbd>↓</Kbd>. Press <Kbd>Esc</Kbd>{' '}
            to cancel a drag.
          </>
        }
        layout="stack"
      >
        <ReorderExample />
      </Example>

      <Example
        title="Virtual scrolling — 10,000 rows"
        description="Only the visible rows are rendered. Works with sorting, pinning, resizing and expandable rows."
        layout="stack"
      >
        <VirtualExample />
      </Example>
    </div>
  )
}
