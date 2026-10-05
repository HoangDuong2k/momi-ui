import { useVirtualizer } from '@tanstack/react-virtual'
import * as React from 'react'
import { useLocale, useMessages } from '../../i18n/locale-provider'
import type { MomiMessages } from '../../i18n/messages'
import { cn } from '../../lib/cn'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  GripVerticalIcon,
} from '../../lib/icons'
import { useControllableState } from '../../lib/use-controllable-state'
import { buildLayout, getValue, headerText, type HeaderCell, type LeafColumn } from './columns'
import { moveItem, nextSort, sortRows } from './sorting'
import type {
  DataTableAlign,
  DataTableColumnDef,
  DataTablePin,
  DataTableRowReorderEvent,
  DataTableSort,
} from './types'

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumnDef<T>[]
  /** Stable row id. Defaults to `row.id`, else the index. Needed for expand, pin and reorder. */
  getRowId?: (row: T, index: number) => string
  'aria-label'?: string
  caption?: React.ReactNode

  /* Layout ------------------------------------------------------------------------------------- */
  /** Height of the scroll area. Required for sticky header/footer/rows and virtualization. */
  maxHeight?: number | string
  /** Keep the header (and top-pinned rows) visible while scrolling. @default true */
  stickyHeader?: boolean
  /** Keep the footer (and bottom-pinned rows) visible while scrolling. @default true */
  stickyFooter?: boolean
  /** @default 'default' */
  variant?: 'default' | 'card'
  /** @default 'md' */
  size?: 'sm' | 'md'
  striped?: boolean
  /** Vertical lines between columns — useful with spans. */
  bordered?: boolean
  /** @default true */
  hoverable?: boolean

  /* Sorting ------------------------------------------------------------------------------------ */
  sort?: DataTableSort | null
  defaultSort?: DataTableSort | null
  onSortChange?: (sort: DataTableSort | null) => void

  /* Column resizing ---------------------------------------------------------------------------- */
  /** Let users drag column edges (or use arrow keys on the handle). */
  resizableColumns?: boolean
  columnWidths?: Record<string, number>
  defaultColumnWidths?: Record<string, number>
  onColumnWidthsChange?: (widths: Record<string, number>) => void

  /* Pinned rows -------------------------------------------------------------------------------- */
  /** Row ids kept at the top (under the header) or bottom (above the footer). */
  pinnedRows?: { top?: string[]; bottom?: string[] }

  /* Expandable rows ---------------------------------------------------------------------------- */
  /** Content shown under a row when expanded. Adds an expand column. */
  renderExpanded?: (row: T) => React.ReactNode
  getRowCanExpand?: (row: T) => boolean
  expanded?: Record<string, boolean>
  defaultExpanded?: Record<string, boolean>
  onExpandedChange?: (expanded: Record<string, boolean>) => void

  /* Row reordering ----------------------------------------------------------------------------- */
  /** Enables drag handles (and ↑/↓ on a focused handle). Disabled while a sort is active. */
  onRowReorder?: (event: DataTableRowReorderEvent<T>) => void

  /* Virtualization ----------------------------------------------------------------------------- */
  /** Render only visible rows. Needs `maxHeight`. Row spans are ignored. */
  virtualize?: boolean
  /** Initial row height guess in px (rows are measured afterwards). */
  estimateRowHeight?: number
  /** @default 8 */
  overscan?: number

  /** @default messages.dataTable.empty ('No results.') */
  emptyState?: React.ReactNode
  /** Override built-in text (screen-reader labels, announcements) for this instance. */
  labels?: Partial<MomiMessages['dataTable']>
  rowClassName?: (row: T, index: number) => string | undefined
  className?: string
  containerClassName?: string
}

interface RowEntry<T> {
  row: T
  id: string
  /** Index in `data`. */
  index: number
}

const NO_WIDTHS: Record<string, number> = {}
const NO_EXPANDED: Record<string, boolean> = {}

const alignClass: Record<DataTableAlign, string> = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
}

const edgeClass: Record<DataTablePin, string> = {
  left: 'border-e group-data-[scroll-start=true]/dt:shadow-[8px_0_12px_-8px_rgb(0_0_0/0.18)]',
  right: 'border-s group-data-[scroll-end=true]/dt:shadow-[-8px_0_12px_-8px_rgb(0_0_0/0.18)]',
}

const iconButtonClass =
  'inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-40'

function defaultRowId(row: unknown, index: number): string {
  if (row && typeof row === 'object' && 'id' in row) {
    const id = (row as { id: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return String(index)
}

function renderValue(value: unknown, locale: string | undefined): React.ReactNode {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return value.toLocaleDateString(locale)
  if (typeof value === 'number') return value.toLocaleString(locale)
  if (typeof value === 'string') return value
  return String(value)
}

function pinStyle(pin?: DataTablePin, offset?: number): React.CSSProperties | undefined {
  if (!pin || offset === undefined) return undefined
  return pin === 'left' ? { insetInlineStart: offset } : { insetInlineEnd: offset }
}

function syncScrollEdges(el: HTMLElement) {
  const max = el.scrollWidth - el.clientWidth
  const x = Math.abs(el.scrollLeft)
  el.dataset.scrollStart = String(x > 1)
  el.dataset.scrollEnd = String(x < max - 1)
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

/** Keep receiving pointer events outside the element; ignore pointers that are no longer active. */
function capturePointer(el: Element, pointerId: number) {
  try {
    el.setPointerCapture(pointerId)
  } catch {
    // InvalidPointerId — the drag still works while the pointer stays over the element.
  }
}

/**
 * Feature-rich table driven by `columns` + `data`: sorting, column resizing, pinned columns and rows,
 * sticky header/footer, grouped headers, cell spans, expandable rows, drag-to-reorder and virtualization.
 */
export function DataTable<T>({
  data,
  columns,
  getRowId = defaultRowId,
  'aria-label': ariaLabel,
  caption,
  maxHeight,
  stickyHeader = true,
  stickyFooter = true,
  variant = 'default',
  size = 'md',
  striped = false,
  bordered = false,
  hoverable = true,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  resizableColumns = false,
  columnWidths,
  defaultColumnWidths = NO_WIDTHS,
  onColumnWidthsChange,
  pinnedRows,
  renderExpanded,
  getRowCanExpand,
  expanded: expandedProp,
  defaultExpanded = NO_EXPANDED,
  onExpandedChange,
  onRowReorder,
  virtualize = false,
  estimateRowHeight,
  overscan = 8,
  emptyState,
  labels,
  rowClassName,
  className,
  containerClassName,
}: DataTableProps<T>) {
  const { locale } = useLocale()
  const t = useMessages('dataTable', labels)
  const tableId = React.useId()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const tableRef = React.useRef<HTMLTableElement>(null)
  const theadRef = React.useRef<HTMLTableSectionElement>(null)
  const tfootRef = React.useRef<HTMLTableSectionElement>(null)

  const [sort, setSort] = useControllableState<DataTableSort | null>({
    value: sortProp,
    defaultValue: defaultSort,
    onChange: onSortChange,
  })
  const [widths, setWidths] = useControllableState<Record<string, number>>({
    value: columnWidths,
    defaultValue: defaultColumnWidths,
    onChange: onColumnWidthsChange,
  })
  const [expanded, setExpanded] = useControllableState<Record<string, boolean>>({
    value: expandedProp,
    defaultValue: defaultExpanded,
    onChange: onExpandedChange,
  })

  const canExpand = renderExpanded !== undefined
  const canReorder = onRowReorder !== undefined

  /* Columns ------------------------------------------------------------------------------------ */
  const { leaves, fillerIndex, headerRows, totalWidth } = React.useMemo(
    () =>
      buildLayout(columns, {
        widths,
        hasDrag: canReorder,
        hasExpand: canExpand,
        resizable: resizableColumns,
      }),
    [columns, widths, canReorder, canExpand, resizableColumns],
  )
  const columnCount = leaves.length + 1 // + flexible filler column
  const footerLeaves = leaves.filter((l) => l.def?.footer !== undefined)
  const hasFooter = footerLeaves.length > 0

  /* Rows --------------------------------------------------------------------------------------- */
  const entries = React.useMemo<RowEntry<T>[]>(
    () => data.map((row, index) => ({ row, index, id: getRowId(row, index) })),
    [data, getRowId],
  )
  const topIds = pinnedRows?.top
  const bottomIds = pinnedRows?.bottom
  const { topRows, bottomRows, unsorted } = React.useMemo(() => {
    const byId = new Map(entries.map((e) => [e.id, e]))
    const pick = (ids: string[] | undefined) =>
      (ids ?? []).map((id) => byId.get(id)).filter((e): e is RowEntry<T> => e !== undefined)
    const topRows = pick(topIds)
    const bottomRows = pick(bottomIds)
    const pinned = new Set([...topRows, ...bottomRows].map((e) => e.id))
    return { topRows, bottomRows, unsorted: entries.filter((e) => !pinned.has(e.id)) }
  }, [entries, topIds, bottomIds])

  const sortDef = sort ? leaves.find((l) => l.id === sort.columnId)?.def : undefined
  const body = React.useMemo(() => sortRows(unsorted, sort, sortDef), [unsorted, sort, sortDef])
  const reorderEnabled = canReorder && !sort
  const useSpans = !virtualize

  /* Container metrics -------------------------------------------------------------------------- */
  const [headerHeight, setHeaderHeight] = React.useState(0)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => {
      container.style.setProperty('--dt-viewport-width', `${container.clientWidth}px`)
      syncScrollEdges(container)
      setHeaderHeight(theadRef.current?.offsetHeight ?? 0)
    })
    observer.observe(container)
    if (tableRef.current) observer.observe(tableRef.current)
    if (theadRef.current) observer.observe(theadRef.current)
    return () => observer.disconnect()
  }, [])

  /* Virtualization ----------------------------------------------------------------------------- */
  const rowEstimate = estimateRowHeight ?? (size === 'sm' ? 41 : 53)
  // The library isn't built with React Compiler, so its non-memoizable API is fine here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: body.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => rowEstimate,
    getItemKey: (index) => body[index]?.id ?? index,
    overscan,
    enabled: virtualize,
    scrollMargin: headerHeight,
    initialRect: typeof maxHeight === 'number' ? { width: 0, height: maxHeight } : undefined,
  })
  const virtualItems = virtualize ? virtualizer.getVirtualItems() : []
  const firstItem = virtualItems[0]
  const lastItem = virtualItems[virtualItems.length - 1]
  const paddingTop = firstItem ? firstItem.start - headerHeight : 0
  const paddingBottom = lastItem ? virtualizer.getTotalSize() - (lastItem.end - headerHeight) : 0

  /* Sorting ------------------------------------------------------------------------------------ */
  const toggleSort = (columnId: string) => setSort(nextSort(sort, columnId))

  /* Resizing ----------------------------------------------------------------------------------- */
  const [resizingId, setResizingId] = React.useState<string | null>(null)

  const resizeTo = (leaf: LeafColumn<T>, base: Record<string, number>, width: number) =>
    setWidths({ ...base, [leaf.id]: Math.round(clamp(width, leaf.minWidth, leaf.maxWidth)) })

  const isRtl = () =>
    containerRef.current ? getComputedStyle(containerRef.current).direction === 'rtl' : false

  function onResizePointerDown(event: React.PointerEvent<HTMLDivElement>, leaf: LeafColumn<T>) {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    const handle = event.currentTarget
    const startX = event.clientX
    const startWidth = leaf.width
    const base = widths
    const dir = isRtl() ? -1 : 1
    capturePointer(handle, event.pointerId)
    setResizingId(leaf.id)
    const onMove = (e: PointerEvent) =>
      resizeTo(leaf, base, startWidth + (e.clientX - startX) * dir)
    const onEnd = () => {
      handle.removeEventListener('pointermove', onMove)
      handle.removeEventListener('pointerup', onEnd)
      handle.removeEventListener('pointercancel', onEnd)
      setResizingId(null)
    }
    handle.addEventListener('pointermove', onMove)
    handle.addEventListener('pointerup', onEnd)
    handle.addEventListener('pointercancel', onEnd)
  }

  function onResizeKeyDown(event: React.KeyboardEvent<HTMLDivElement>, leaf: LeafColumn<T>) {
    const step = event.shiftKey ? 64 : 16
    const grow = isRtl() ? 'ArrowLeft' : 'ArrowRight'
    const shrink = isRtl() ? 'ArrowRight' : 'ArrowLeft'
    let next: number | null = null
    if (event.key === grow) next = leaf.width + step
    else if (event.key === shrink) next = leaf.width - step
    else if (event.key === 'Home') next = leaf.minWidth
    else if (event.key === 'End') next = leaf.maxWidth
    if (next === null) return
    event.preventDefault()
    resizeTo(leaf, widths, next)
  }

  function resetWidth(leaf: LeafColumn<T>) {
    const next = { ...widths }
    delete next[leaf.id]
    setWidths(next)
  }

  /* Expanding ---------------------------------------------------------------------------------- */
  const rowCanExpand = (row: T) => canExpand && (getRowCanExpand?.(row) ?? true)
  const toggleExpanded = (id: string) => setExpanded({ ...expanded, [id]: !expanded[id] })

  /* Reordering --------------------------------------------------------------------------------- */
  const [drag, setDrag] = React.useState<{ id: string; from: number; over: number } | null>(null)
  const dragRef = React.useRef<{ id: string; from: number; over: number; clientY: number } | null>(
    null,
  )
  const focusRowRef = React.useRef<string | null>(null)
  const [announcement, setAnnouncement] = React.useState('')

  function commitMove(fromBody: number, toBody: number) {
    const fromEntry = body[fromBody]
    const toEntry = body[toBody]
    if (!onRowReorder || !fromEntry || !toEntry || fromBody === toBody) return
    onRowReorder({
      rows: moveItem(data, fromEntry.index, toEntry.index),
      row: fromEntry.row,
      from: fromEntry.index,
      to: toEntry.index,
    })
    setAnnouncement(t.rowMoved(toBody + 1, body.length))
  }

  /** Insertion index (0…body.length) for a pointer position, using the rendered rows. */
  function insertionIndexAt(clientY: number) {
    const rows = containerRef.current?.querySelectorAll<HTMLElement>('tr[data-dt-row]') ?? []
    let index = 0
    for (const tr of rows) {
      const rowIndex = Number(tr.dataset.dtRow)
      const rect = tr.getBoundingClientRect()
      if (clientY < rect.top + rect.height / 2) return rowIndex
      index = rowIndex + 1
    }
    return index
  }

  function updateDragOver(clientY: number) {
    const current = dragRef.current
    if (!current) return
    current.clientY = clientY
    const over = insertionIndexAt(clientY)
    if (over === current.over) return
    current.over = over
    setDrag({ id: current.id, from: current.from, over })
  }

  function endDrag(commit: boolean) {
    const current = dragRef.current
    dragRef.current = null
    setDrag(null)
    if (!current || !commit) return
    const to = current.over > current.from ? current.over - 1 : current.over
    if (to !== current.from) commitMove(current.from, to)
  }

  function onHandlePointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    entry: RowEntry<T>,
    bodyIndex: number,
  ) {
    if (!reorderEnabled || event.button !== 0) return
    event.preventDefault()
    capturePointer(event.currentTarget, event.pointerId)
    dragRef.current = { id: entry.id, from: bodyIndex, over: bodyIndex, clientY: event.clientY }
    setDrag({ id: entry.id, from: bodyIndex, over: bodyIndex })
  }

  function onHandleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    entry: RowEntry<T>,
    bodyIndex: number,
  ) {
    if (!reorderEnabled) return
    const delta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0
    if (!delta) return
    event.preventDefault()
    const to = bodyIndex + delta
    if (to < 0 || to >= body.length) return
    focusRowRef.current = entry.id
    commitMove(bodyIndex, to)
    if (virtualize) virtualizer.scrollToIndex(to)
  }

  // Latest handlers for the drag loop below.
  const dragHandlers = React.useRef({ updateDragOver, endDrag })
  React.useEffect(() => {
    dragHandlers.current = { updateDragOver, endDrag }
  })

  const isDragging = drag !== null
  React.useEffect(() => {
    if (!isDragging) return
    let frame = 0
    // Auto-scroll when the pointer nears the top/bottom of the scroll area.
    const tick = () => {
      const el = containerRef.current
      const current = dragRef.current
      if (el && current) {
        const rect = el.getBoundingClientRect()
        const top = rect.top + (theadRef.current?.offsetHeight ?? 0) + 24
        const bottom = rect.bottom - (tfootRef.current?.offsetHeight ?? 0) - 24
        let delta = 0
        if (current.clientY < top) delta = -Math.min(18, (top - current.clientY) / 2 + 2)
        else if (current.clientY > bottom) delta = Math.min(18, (current.clientY - bottom) / 2 + 2)
        if (delta !== 0) {
          el.scrollTop += delta
          dragHandlers.current.updateDragOver(current.clientY)
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dragHandlers.current.endDrag(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isDragging])

  // Keep keyboard focus on the handle of a row moved with the arrow keys.
  React.useEffect(() => {
    const id = focusRowRef.current
    if (!id) return
    const handles = containerRef.current?.querySelectorAll<HTMLElement>('[data-dt-handle]') ?? []
    for (const handle of handles) {
      if (handle.dataset.dtHandle === id) {
        handle.focus()
        focusRowRef.current = null
        break
      }
    }
  })

  /* Rendering ---------------------------------------------------------------------------------- */
  const cellBase = cn(
    'overflow-hidden border-b bg-(--dt-row-bg) px-3 py-3 align-middle',
    bordered && 'border-e',
  )
  const headBase = cn(
    'relative h-10 overflow-hidden border-b bg-(--dt-header-bg) px-3 align-middle text-xs font-medium whitespace-nowrap text-muted-foreground',
    bordered && 'border-e',
  )

  const pinClasses = (pin?: DataTablePin, edge?: DataTablePin) =>
    cn(pin && 'sticky z-10', edge && edgeClass[edge])

  const filler = (key: string, head = false, rowSpan?: number) =>
    head ? (
      <th key={key} aria-hidden rowSpan={rowSpan} className={cn(headBase, 'border-e-0 p-0')} />
    ) : (
      <td key={key} aria-hidden className={cn(cellBase, 'border-e-0 p-0')} />
    )

  function renderHeaderCell(cell: HeaderCell<T>) {
    if (cell.type === 'filler') return filler(cell.key, true, cell.rowSpan)
    const pin = pinClasses(cell.pin, cell.edge)
    const style = pinStyle(cell.pin, cell.offset)

    if (cell.type === 'group') {
      return (
        <th
          key={cell.key}
          scope="colgroup"
          colSpan={cell.colSpan}
          rowSpan={cell.rowSpan}
          className={cn(headBase, alignClass[cell.align], pin)}
          style={style}
        >
          {cell.group?.header}
        </th>
      )
    }

    const leaf = cell.leaf!
    if (leaf.kind !== 'data') {
      return (
        <th
          key={cell.key}
          rowSpan={cell.rowSpan}
          className={cn(headBase, 'px-0', pin)}
          style={style}
        >
          <span className="sr-only">{leaf.kind === 'drag' ? t.reorderColumn : t.expandColumn}</span>
        </th>
      )
    }

    const def = leaf.def!
    const sorted = sort?.columnId === leaf.id ? sort.direction : false
    const SortIcon =
      sorted === 'asc' ? ArrowUpIcon : sorted === 'desc' ? ArrowDownIcon : ChevronsUpDownIcon
    const label = headerText(def.header, def.id)

    return (
      <th
        key={cell.key}
        scope="col"
        rowSpan={cell.rowSpan}
        aria-sort={
          def.sortable
            ? sorted === 'asc'
              ? 'ascending'
              : sorted === 'desc'
                ? 'descending'
                : 'none'
            : undefined
        }
        className={cn(headBase, alignClass[leaf.align], pin, def.headerClassName)}
        style={style}
      >
        {def.sortable ? (
          <button
            type="button"
            onClick={() => toggleSort(leaf.id)}
            className={cn(
              '-mx-1.5 inline-flex max-w-[calc(100%+0.75rem)] items-center gap-1 rounded-md px-1.5 py-1 transition-colors outline-none',
              'hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40',
              sorted && 'text-foreground',
              leaf.align === 'end' && 'flex-row-reverse',
            )}
          >
            <span className="truncate">{def.header}</span>
            <SortIcon className={cn('size-3.5 shrink-0', !sorted && 'opacity-40')} />
          </button>
        ) : (
          <span className="block truncate">{def.header}</span>
        )}
        {leaf.resizable && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={t.resizeColumn(label)}
            aria-valuenow={leaf.width}
            aria-valuemin={leaf.minWidth}
            aria-valuemax={leaf.maxWidth}
            tabIndex={0}
            data-resizing={resizingId === leaf.id || undefined}
            onPointerDown={(e) => onResizePointerDown(e, leaf)}
            onKeyDown={(e) => onResizeKeyDown(e, leaf)}
            onDoubleClick={() => resetWidth(leaf)}
            className="group/resize absolute inset-y-0 end-0 z-20 flex w-2.5 cursor-col-resize touch-none justify-end outline-none select-none"
          >
            <span className="h-full w-0.5 rounded-full bg-transparent transition-colors group-hover/resize:bg-ring group-focus-visible/resize:bg-ring group-data-[resizing]/resize:bg-primary" />
          </div>
        )}
      </th>
    )
  }

  function renderCell(
    leaf: LeafColumn<T>,
    entry: RowEntry<T>,
    bodyIndex: number | null,
    isExpanded: boolean,
  ) {
    const pin = pinClasses(leaf.pin, leaf.edge)
    const style = pinStyle(leaf.pin, leaf.offset)

    if (leaf.kind === 'drag') {
      return (
        <td key={leaf.id} className={cn(cellBase, 'px-0 text-center', pin)} style={style}>
          {bodyIndex !== null && (
            <button
              type="button"
              data-dt-handle={entry.id}
              aria-label={t.reorderRow}
              aria-describedby={`${tableId}-reorder-help`}
              disabled={!reorderEnabled}
              title={reorderEnabled ? undefined : t.reorderDisabled}
              onPointerDown={(e) => onHandlePointerDown(e, entry, bodyIndex)}
              onPointerMove={(e) => updateDragOver(e.clientY)}
              onPointerUp={() => endDrag(true)}
              onPointerCancel={() => endDrag(false)}
              onKeyDown={(e) => onHandleKeyDown(e, entry, bodyIndex)}
              className={cn(iconButtonClass, 'cursor-grab touch-none active:cursor-grabbing')}
            >
              <GripVerticalIcon className="size-4" />
            </button>
          )}
        </td>
      )
    }

    if (leaf.kind === 'expand') {
      const expandable = bodyIndex !== null && rowCanExpand(entry.row)
      return (
        <td key={leaf.id} className={cn(cellBase, 'px-0 text-center', pin)} style={style}>
          {expandable && (
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={isExpanded ? `${tableId}-expanded-${entry.id}` : undefined}
              aria-label={isExpanded ? t.collapseRow : t.expandRow}
              onClick={() => toggleExpanded(entry.id)}
              className={iconButtonClass}
            >
              <ChevronRightIcon
                className={cn(
                  'size-4 transition-transform duration-200 ease-out-soft rtl:rotate-180',
                  isExpanded && 'rotate-90 rtl:rotate-90',
                )}
              />
            </button>
          )}
        </td>
      )
    }

    const def = leaf.def!
    const span = useSpans && bodyIndex !== null ? def.span?.(entry.row, entry.index) : undefined
    if (span?.hidden) return null
    const value = getValue(def, entry.row)
    return (
      <td
        key={leaf.id}
        rowSpan={span?.rowSpan}
        colSpan={span?.colSpan}
        className={cn(cellBase, alignClass[leaf.align], pin, def.cellClassName)}
        style={style}
      >
        {def.cell
          ? def.cell({ row: entry.row, rowId: entry.id, rowIndex: entry.index, value })
          : renderValue(value, locale)}
      </td>
    )
  }

  function renderRow(
    entry: RowEntry<T>,
    options: {
      bodyIndex: number | null
      pinned?: 'top' | 'bottom'
      isLast?: boolean
      ariaRowIndex?: number
    },
  ) {
    const { bodyIndex, pinned, isLast } = options
    const isExpanded = bodyIndex !== null && rowCanExpand(entry.row) && Boolean(expanded[entry.id])

    let drop: 'before' | 'after' | undefined
    if (drag && bodyIndex !== null && drag.over !== drag.from && drag.over !== drag.from + 1) {
      if (drag.over === bodyIndex) drop = 'before'
      else if (drag.over === body.length && bodyIndex === body.length - 1) drop = 'after'
    }

    const cells: React.ReactNode[] = []
    leaves.forEach((leaf, i) => {
      if (i === fillerIndex) cells.push(filler('__filler'))
      cells.push(renderCell(leaf, entry, bodyIndex, isExpanded))
    })
    if (fillerIndex === leaves.length) cells.push(filler('__filler'))

    return (
      <React.Fragment key={entry.id}>
        <tr
          data-dt-row={bodyIndex ?? undefined}
          data-row-id={entry.id}
          data-pinned={pinned}
          data-state={isExpanded ? 'expanded' : undefined}
          data-dragging={drag?.id === entry.id || undefined}
          data-drop={drop}
          aria-rowindex={options.ariaRowIndex}
          className={cn(
            '[--dt-row-bg:var(--dt-bg)]',
            striped &&
              bodyIndex !== null &&
              bodyIndex % 2 === 1 &&
              '[--dt-row-bg:var(--dt-stripe-bg)]',
            pinned && '[--dt-row-bg:var(--dt-pinned-bg)]',
            hoverable && 'hover:[--dt-row-bg:var(--dt-hover-bg)]',
            'data-[dragging]:opacity-50 data-[state=expanded]:[&>td]:border-b-transparent',
            'data-[drop=after]:[&>td]:shadow-[inset_0_-2px_0_var(--primary)] data-[drop=before]:[&>td]:shadow-[inset_0_2px_0_var(--primary)]',
            isLast && !isExpanded && '[&>td]:border-b-0',
            rowClassName?.(entry.row, entry.index),
          )}
        >
          {cells}
        </tr>
        {isExpanded && (
          <tr id={`${tableId}-expanded-${entry.id}`} data-dt-expanded="">
            <td
              colSpan={columnCount}
              className={cn('border-b bg-(--dt-expanded-bg) p-0', isLast && 'border-b-0')}
            >
              <div className="sticky start-0 w-(--dt-viewport-width) animate-fade-in px-4 py-4">
                {renderExpanded?.(entry.row)}
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    )
  }

  const headerRowCount = headerRows.length
  const totalAriaRows =
    headerRowCount + topRows.length + body.length + bottomRows.length + (hasFooter ? 1 : 0)
  const ariaIndex = (n: number) => (virtualize ? n : undefined)
  const bodyAriaOffset = headerRowCount + topRows.length + 1

  const renderBodyRow = (entry: RowEntry<T>, bodyIndex: number) =>
    renderRow(entry, {
      bodyIndex,
      isLast: bodyIndex === body.length - 1,
      ariaRowIndex: ariaIndex(bodyAriaOffset + bodyIndex),
    })

  const spacer = (key: string, height: number) => (
    <tbody key={key} aria-hidden>
      <tr>
        <td colSpan={columnCount} style={{ height, padding: 0, border: 0 }} />
      </tr>
    </tbody>
  )

  const footerFiller = <td key="__filler-footer" aria-hidden className="bg-(--dt-header-bg) p-0" />

  const emptyBody = (
    <tbody>
      <tr>
        <td colSpan={columnCount} className="h-32 px-3 text-center text-sm text-muted-foreground">
          {emptyState ?? t.empty}
        </td>
      </tr>
    </tbody>
  )

  return (
    <div
      ref={containerRef}
      data-slot="data-table"
      data-resizing={resizingId ? '' : undefined}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      onScroll={(e) => syncScrollEdges(e.currentTarget)}
      className={cn(
        'group/dt relative w-full overflow-auto rounded-[inherit] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
        '[--dt-bg:var(--background)] [--dt-header-bg:var(--dt-bg)]',
        '[--dt-hover-bg:color-mix(in_oklab,var(--muted)_60%,var(--dt-bg))] [--dt-stripe-bg:color-mix(in_oklab,var(--muted)_35%,var(--dt-bg))]',
        '[--dt-expanded-bg:color-mix(in_oklab,var(--muted)_30%,var(--dt-bg))] [--dt-pinned-bg:color-mix(in_oklab,var(--primary)_5%,var(--dt-bg))]',
        variant === 'card' &&
          'rounded-xl border bg-card shadow-xs [--dt-bg:var(--card)] [--dt-header-bg:color-mix(in_oklab,var(--muted)_45%,var(--dt-bg))]',
        'data-[resizing]:cursor-col-resize data-[resizing]:select-none',
        containerClassName,
      )}
      style={{ maxHeight }}
    >
      <table
        ref={tableRef}
        aria-rowcount={virtualize ? totalAriaRows : undefined}
        className={cn(
          'w-full table-fixed border-separate border-spacing-0 text-sm',
          size === 'sm' && '[&_td]:py-2 [&_th]:h-9',
          bordered && '[&_tr>*:last-child]:border-e-0',
          className,
        )}
        style={{ minWidth: totalWidth }}
      >
        {caption && (
          <caption className="caption-bottom py-3 text-sm text-muted-foreground">{caption}</caption>
        )}
        <colgroup>
          {leaves.map((leaf, i) => (
            <React.Fragment key={leaf.id}>
              {i === fillerIndex && <col />}
              <col style={{ width: leaf.width }} />
            </React.Fragment>
          ))}
          {fillerIndex === leaves.length && <col />}
        </colgroup>

        <thead ref={theadRef} className={cn(stickyHeader && 'sticky top-0 z-20')}>
          {headerRows.map((row, i) => (
            <tr key={i} aria-rowindex={ariaIndex(i + 1)}>
              {row.map(renderHeaderCell)}
            </tr>
          ))}
          {topRows.map((entry, i) =>
            renderRow(entry, {
              bodyIndex: null,
              pinned: 'top',
              ariaRowIndex: ariaIndex(headerRowCount + i + 1),
            }),
          )}
        </thead>

        {body.length === 0 ? (
          emptyBody
        ) : virtualize ? (
          [
            paddingTop > 0 && spacer('spacer-top', paddingTop),
            ...virtualItems.map((item) => {
              const entry = body[item.index]
              if (!entry) return null
              return (
                <tbody key={entry.id} data-index={item.index} ref={virtualizer.measureElement}>
                  {renderBodyRow(entry, item.index)}
                </tbody>
              )
            }),
            paddingBottom > 0 && spacer('spacer-bottom', paddingBottom),
          ]
        ) : (
          <tbody>{body.map((entry, i) => renderBodyRow(entry, i))}</tbody>
        )}

        {(bottomRows.length > 0 || hasFooter) && (
          <tfoot
            ref={tfootRef}
            className={cn(
              stickyFooter && 'sticky bottom-0 z-20',
              '[&>tr:first-child>td]:shadow-[inset_0_1px_0_var(--border)]',
            )}
          >
            {bottomRows.map((entry, i) =>
              renderRow(entry, {
                bodyIndex: null,
                pinned: 'bottom',
                isLast: !hasFooter && i === bottomRows.length - 1,
                ariaRowIndex: ariaIndex(bodyAriaOffset + body.length + i),
              }),
            )}
            {hasFooter && (
              <tr aria-rowindex={ariaIndex(totalAriaRows)}>
                {leaves.map((leaf, i) => {
                  const footer = leaf.def?.footer
                  const cell = (
                    <td
                      key={leaf.id}
                      className={cn(
                        'overflow-hidden bg-(--dt-header-bg) px-3 py-3 align-middle font-medium',
                        bordered && 'border-e',
                        alignClass[leaf.align],
                        pinClasses(leaf.pin, leaf.edge),
                      )}
                      style={pinStyle(leaf.pin, leaf.offset)}
                    >
                      {typeof footer === 'function' ? footer(data) : footer}
                    </td>
                  )
                  return i === fillerIndex ? [footerFiller, cell] : cell
                })}
                {fillerIndex === leaves.length && footerFiller}
              </tr>
            )}
          </tfoot>
        )}
      </table>

      {canReorder && (
        <>
          <span id={`${tableId}-reorder-help`} className="sr-only">
            {t.reorderHelp}
          </span>
          <div aria-live="polite" className="sr-only">
            {announcement}
          </div>
        </>
      )}
    </div>
  )
}
