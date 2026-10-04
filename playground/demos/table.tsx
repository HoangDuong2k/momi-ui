import { Ellipsis } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Avatar,
  Badge,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  Pagination,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  type SortDirection,
  type Tone,
} from '../../src'
import { Example } from '../components/demo'

interface Invoice {
  id: string
  customer: string
  email: string
  status: 'paid' | 'pending' | 'failed'
  amount: number
}

const invoices: Invoice[] = [
  { id: 'INV-001', customer: 'Linh Tran', email: 'linh@momi.dev', status: 'paid', amount: 250 },
  {
    id: 'INV-002',
    customer: 'Minh Nguyen',
    email: 'minh@momi.dev',
    status: 'pending',
    amount: 150,
  },
  { id: 'INV-003', customer: 'An Pham', email: 'an@momi.dev', status: 'paid', amount: 350 },
  { id: 'INV-004', customer: 'Bao Le', email: 'bao@momi.dev', status: 'failed', amount: 450 },
  { id: 'INV-005', customer: 'Chi Vo', email: 'chi@momi.dev', status: 'paid', amount: 550 },
  { id: 'INV-006', customer: 'Duy Ho', email: 'duy@momi.dev', status: 'pending', amount: 200 },
]

const statusTone: Record<Invoice['status'], Tone> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
}

const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

type SortKey = 'customer' | 'amount'

export default function TableDemo() {
  const [sort, setSort] = useState<{ key: SortKey; dir: Exclude<SortDirection, false> }>({
    key: 'amount',
    dir: 'desc',
  })
  const [selected, setSelected] = useState<string[]>([])

  const rows = useMemo(() => {
    const sorted = [...invoices].sort((a, b) =>
      sort.key === 'amount' ? a.amount - b.amount : a.customer.localeCompare(b.customer),
    )
    return sort.dir === 'asc' ? sorted : sorted.reverse()
  }, [sort])

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))
  const allSelected = selected.length === rows.length

  return (
    <div className="space-y-12">
      <Example title="Basic" layout="stack">
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead align="end">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.slice(0, 4).map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">{inv.id}</TableCell>
                <TableCell>
                  <Badge size="sm" tone={statusTone[inv.status]} dot className="capitalize">
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell>{inv.customer}</TableCell>
                <TableCell align="end" className="tabular-nums">
                  {money(inv.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell align="end" className="tabular-nums">
                {money(invoices.slice(0, 4).reduce((sum, i) => sum + i.amount, 0))}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Example>

      <Example
        title="Card · sortable · selectable · row actions"
        description='variant="card" with sort buttons, checkboxes, a menu and pagination.'
        layout="stack"
      >
        <Table variant="card">
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  aria-label="Select all"
                  checked={allSelected ? true : selected.length > 0 ? 'indeterminate' : false}
                  onCheckedChange={() => setSelected(allSelected ? [] : rows.map((r) => r.id))}
                />
              </TableHead>
              <TableHead
                sort={sort.key === 'customer' && sort.dir}
                onSort={() => toggleSort('customer')}
              >
                Customer
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                align="end"
                sort={sort.key === 'amount' && sort.dir}
                onSort={() => toggleSort('amount')}
              >
                Amount
              </TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((inv) => (
              <TableRow
                key={inv.id}
                data-state={selected.includes(inv.id) ? 'selected' : undefined}
              >
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${inv.id}`}
                    checked={selected.includes(inv.id)}
                    onCheckedChange={(c) =>
                      setSelected((s) => (c ? [...s, inv.id] : s.filter((id) => id !== inv.id)))
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={inv.customer} size="sm" />
                    <div className="min-w-0">
                      <Text size="sm" weight="medium" truncate>
                        {inv.customer}
                      </Text>
                      <Text size="xs" tone="muted" truncate>
                        {inv.email}
                      </Text>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge size="sm" tone={statusTone[inv.status]} dot className="capitalize">
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell align="end" className="font-medium tabular-nums">
                  {money(inv.amount)}
                </TableCell>
                <TableCell align="end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <IconButton aria-label={`Actions for ${inv.id}`} size="sm">
                        <Ellipsis />
                      </IconButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View invoice</DropdownMenuItem>
                      <DropdownMenuItem>Download PDF</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="danger">Void</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <Text size="sm" tone="muted">
            {selected.length} of {rows.length} selected
          </Text>
          <Pagination pageCount={8} size="sm" compact />
        </div>
      </Example>

      <Example
        title="Row span · col span · bordered · sticky footer"
        description="Native rowSpan / colSpan on TableHead and TableCell. For sorting, pinning, resizing and more, see Data Table."
        layout="stack"
      >
        <Table bordered stickyHeader stickyFooter hoverable={false} containerClassName="max-h-72">
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2}>Region</TableHead>
              <TableHead rowSpan={2}>Product</TableHead>
              <TableHead colSpan={2} align="center">
                Q3 2026
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead align="end">Units</TableHead>
              <TableHead align="end">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell rowSpan={3} className="align-top font-medium">
                Asia
              </TableCell>
              <TableCell>momi Pro</TableCell>
              <TableCell align="end">320</TableCell>
              <TableCell align="end">{money(60800)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>momi Team</TableCell>
              <TableCell align="end">84</TableCell>
              <TableCell align="end">{money(41160)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Add-ons</TableCell>
              <TableCell colSpan={2} align="center" className="text-muted-foreground">
                Launching in Q4
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell rowSpan={2} className="align-top font-medium">
                Europe
              </TableCell>
              <TableCell>momi Pro</TableCell>
              <TableCell align="end">210</TableCell>
              <TableCell align="end">{money(39900)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>momi Team</TableCell>
              <TableCell align="end">51</TableCell>
              <TableCell align="end">{money(24990)}</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell align="end">665</TableCell>
              <TableCell align="end">{money(166850)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Example>

      <Example title="Striped · small · sticky header" layout="stack">
        <Table striped size="sm" stickyHeader containerClassName="max-h-56 rounded-lg border">
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Event</TableHead>
              <TableHead align="end">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 14 }, (_, i) => (
              <TableRow key={i}>
                <TableCell className="text-muted-foreground tabular-nums">{i + 1}</TableCell>
                <TableCell>
                  {['Deployed', 'Build started', 'Domain added', 'Env updated'][i % 4]}
                </TableCell>
                <TableCell align="end" className="text-muted-foreground tabular-nums">
                  {`10:${String(59 - i * 3).padStart(2, '0')}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Example>
    </div>
  )
}
