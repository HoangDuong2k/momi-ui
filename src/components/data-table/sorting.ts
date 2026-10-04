import { getValue } from './columns'
import type { DataTableColumn, DataTableSort } from './types'

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

const isEmpty = (v: unknown) => v === null || v === undefined || v === ''

/** Ascending comparison that understands numbers, dates, booleans and natural string order. */
export function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
  return collator.compare(String(a), String(b))
}

/** Stable sort; empty values always go last regardless of direction. */
export function sortRows<T, E extends { row: T }>(
  entries: E[],
  sort: DataTableSort | null | undefined,
  column: DataTableColumn<T> | undefined,
): E[] {
  if (!sort || !column) return entries
  const dir = sort.direction === 'asc' ? 1 : -1
  return [...entries].sort((x, y) => {
    if (column.sortFn) return column.sortFn(x.row, y.row) * dir
    const a = getValue(column, x.row)
    const b = getValue(column, y.row)
    if (isEmpty(a)) return isEmpty(b) ? 0 : 1
    if (isEmpty(b)) return -1
    return compareValues(a, b) * dir
  })
}

/** none → asc → desc → none */
export function nextSort(current: DataTableSort | null, columnId: string): DataTableSort | null {
  if (!current || current.columnId !== columnId) return { columnId, direction: 'asc' }
  if (current.direction === 'asc') return { columnId, direction: 'desc' }
  return null
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = items.slice()
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}
