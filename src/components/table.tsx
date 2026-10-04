import type * as React from 'react'
import { cn } from '../lib/cn'
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from '../lib/icons'

export interface TableProps extends React.ComponentProps<'table'> {
  /** `card` wraps the table in a bordered, rounded surface. @default 'default' */
  variant?: 'default' | 'card'
  /** Row density. @default 'md' */
  size?: 'sm' | 'md'
  /** Zebra-striped body rows. */
  striped?: boolean
  /** Highlight body rows on hover. @default true */
  hoverable?: boolean
  /** Keep the header visible while scrolling (give the container a max height). */
  stickyHeader?: boolean
  /** Keep the footer visible while scrolling. */
  stickyFooter?: boolean
  /** Grid lines around every cell — handy with `rowSpan` / `colSpan`. */
  bordered?: boolean
  /** Class for the scroll container. */
  containerClassName?: string
}

/**
 * Semantic, composable table. Cells accept native `rowSpan` / `colSpan`.
 * For sorting, resizing, pinning, expanding, reordering or virtualization use `DataTable`.
 */
export function Table({
  variant = 'default',
  size = 'md',
  striped = false,
  hoverable = true,
  stickyHeader = false,
  stickyFooter = false,
  bordered = false,
  containerClassName,
  className,
  ...props
}: TableProps) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        'relative w-full overflow-auto',
        variant === 'card' && 'rounded-xl border bg-card shadow-xs',
        containerClassName,
      )}
    >
      <table
        data-slot="table"
        className={cn(
          'w-full caption-bottom border-collapse text-sm',
          size === 'sm' && '[&_td]:py-2 [&_th]:h-9',
          striped && '[&_tbody_tr:nth-child(even)]:bg-muted/40',
          hoverable && '[&_tbody_tr:hover]:bg-muted/50',
          variant === 'card' &&
            '[&_td:first-child]:ps-4 [&_td:last-child]:pe-4 [&_th:first-child]:ps-4 [&_th:last-child]:pe-4 [&_thead]:bg-muted/40',
          stickyHeader &&
            '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead_th]:bg-background [&_thead_th]:shadow-[inset_0_-1px_0_var(--border)]',
          stickyFooter &&
            '[&_tfoot]:sticky [&_tfoot]:bottom-0 [&_tfoot]:z-10 [&_tfoot_td]:bg-[color-mix(in_oklab,var(--muted)_40%,var(--background))] [&_tfoot_td]:shadow-[inset_0_1px_0_var(--border)]',
          bordered && '[&_td]:border [&_th]:border',
          className,
        )}
        {...props}
      />
    </div>
  )
}

export function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-b', className)} {...props} />
}

export function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

export function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t bg-muted/40 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
}

export function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn('border-b transition-colors data-[state=selected]:bg-muted', className)}
      {...props}
    />
  )
}

export type SortDirection = 'asc' | 'desc' | false

export interface TableHeadProps extends Omit<React.ComponentProps<'th'>, 'align'> {
  /** Current sort of this column. Renders a sort button when `onSort` is set. */
  sort?: SortDirection
  onSort?: () => void
  align?: 'start' | 'center' | 'end'
}

const alignClasses = { start: 'text-start', center: 'text-center', end: 'text-end' } as const

export function TableHead({
  sort = false,
  onSort,
  align = 'start',
  className,
  children,
  ...props
}: TableHeadProps) {
  const SortIcon =
    sort === 'asc' ? ArrowUpIcon : sort === 'desc' ? ArrowDownIcon : ChevronsUpDownIcon
  return (
    <th
      data-slot="table-head"
      aria-sort={
        onSort
          ? sort === 'asc'
            ? 'ascending'
            : sort === 'desc'
              ? 'descending'
              : 'none'
          : undefined
      }
      className={cn(
        'h-10 px-3 align-middle text-xs font-medium whitespace-nowrap text-muted-foreground',
        '[&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pe-0',
        alignClasses[align],
        className,
      )}
      {...props}
    >
      {onSort ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            '-mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40',
            sort && 'text-foreground',
          )}
        >
          {children}
          <SortIcon className={cn('size-3.5', !sort && 'opacity-50')} />
        </button>
      ) : (
        children
      )}
    </th>
  )
}

export interface TableCellProps extends Omit<React.ComponentProps<'td'>, 'align'> {
  align?: 'start' | 'center' | 'end'
}

export function TableCell({ align = 'start', className, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-3 py-3 align-middle [&:has([role=checkbox])]:pe-0',
        alignClasses[align],
        className,
      )}
      {...props}
    />
  )
}

export function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}
