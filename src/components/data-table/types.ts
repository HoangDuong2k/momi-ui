import type * as React from 'react'

export type DataTableAlign = 'start' | 'center' | 'end'
export type DataTablePin = 'left' | 'right'

export interface DataTableSort {
  columnId: string
  direction: 'asc' | 'desc'
}

export interface DataTableCellContext<T> {
  row: T
  rowId: string
  /** Position of the row in `data`. */
  rowIndex: number
  value: unknown
}

/** Merge body cells. Return `hidden: true` for cells covered by another cell's span. */
export interface DataTableCellSpan {
  rowSpan?: number
  colSpan?: number
  hidden?: boolean
}

export interface DataTableColumn<T> {
  id: string
  header?: React.ReactNode
  /** Key or getter for the cell value — used for sorting and default rendering. */
  accessor?: keyof T | ((row: T) => unknown)
  /** Custom cell renderer. Defaults to the accessor value. */
  cell?: (ctx: DataTableCellContext<T>) => React.ReactNode
  /** Footer content, or a function of all rows (e.g. a total). */
  footer?: React.ReactNode | ((rows: T[]) => React.ReactNode)
  /** Width in px. @default 160 */
  width?: number
  /** @default 64 */
  minWidth?: number
  /** @default 800 */
  maxWidth?: number
  /** @default 'start' */
  align?: DataTableAlign
  sortable?: boolean
  /** Custom ascending comparator. */
  sortFn?: (a: T, b: T) => number
  /** Keep the column visible while scrolling horizontally. */
  pin?: DataTablePin
  /** Overrides the table's `resizableColumns`. */
  resizable?: boolean
  /** Row/col span for body cells (row spans are ignored when virtualized). */
  span?: (row: T, rowIndex: number) => DataTableCellSpan | undefined
  headerClassName?: string
  cellClassName?: string
}

/** A header spanning several columns (rendered as a second header row). */
export interface DataTableColumnGroup<T> {
  id: string
  header: React.ReactNode
  columns: DataTableColumn<T>[]
  /** Pins every column of the group. */
  pin?: DataTablePin
  /** @default 'center' */
  align?: DataTableAlign
}

export type DataTableColumnDef<T> = DataTableColumn<T> | DataTableColumnGroup<T>

export interface DataTableRowReorderEvent<T> {
  /** `data` with the row moved — pass it back as the new `data`. */
  rows: T[]
  row: T
  /** Index in `data` before the move. */
  from: number
  /** Index in `data` after the move. */
  to: number
}
