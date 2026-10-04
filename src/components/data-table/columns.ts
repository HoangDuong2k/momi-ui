import type * as React from 'react'
import type {
  DataTableAlign,
  DataTableColumn,
  DataTableColumnDef,
  DataTableColumnGroup,
  DataTablePin,
} from './types'

export const DEFAULT_WIDTH = 160
export const DEFAULT_MIN_WIDTH = 64
export const DEFAULT_MAX_WIDTH = 800
const UTILITY_WIDTH = { drag: 40, expand: 44 } as const

export type LeafKind = 'data' | 'drag' | 'expand'

export interface LeafColumn<T> {
  id: string
  kind: LeafKind
  def?: DataTableColumn<T>
  width: number
  defaultWidth: number
  minWidth: number
  maxWidth: number
  align: DataTableAlign
  pin?: DataTablePin
  /** Distance from the pinned edge, in px. */
  offset?: number
  /** Last left-pinned / first right-pinned column — draws the separator shadow. */
  edge?: DataTablePin
  resizable: boolean
}

export interface HeaderCell<T> {
  key: string
  type: 'leaf' | 'group' | 'filler'
  leaf?: LeafColumn<T>
  group?: DataTableColumnGroup<T>
  colSpan: number
  rowSpan: number
  pin?: DataTablePin
  offset?: number
  edge?: DataTablePin
  align: DataTableAlign
}

export interface TableLayout<T> {
  leaves: LeafColumn<T>[]
  /** Index in `leaves` where the flexible filler column is inserted (before right-pinned columns). */
  fillerIndex: number
  headerRows: HeaderCell<T>[][]
  totalWidth: number
}

export function isGroup<T>(def: DataTableColumnDef<T>): def is DataTableColumnGroup<T> {
  return 'columns' in def && Array.isArray(def.columns)
}

export function headerText(header: React.ReactNode, fallback: string) {
  return typeof header === 'string' || typeof header === 'number' ? String(header) : fallback
}

interface Block<T> {
  pin?: DataTablePin
  group?: DataTableColumnGroup<T>
  leaves: LeafColumn<T>[]
}

interface LayoutOptions {
  widths: Record<string, number>
  hasDrag: boolean
  hasExpand: boolean
  resizable: boolean
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

function toLeaf<T>(
  def: DataTableColumn<T>,
  pin: DataTablePin | undefined,
  options: LayoutOptions,
): LeafColumn<T> {
  const minWidth = def.minWidth ?? DEFAULT_MIN_WIDTH
  const maxWidth = def.maxWidth ?? DEFAULT_MAX_WIDTH
  const defaultWidth = clamp(def.width ?? DEFAULT_WIDTH, minWidth, maxWidth)
  return {
    id: def.id,
    kind: 'data',
    def,
    width: clamp(options.widths[def.id] ?? defaultWidth, minWidth, maxWidth),
    defaultWidth,
    minWidth,
    maxWidth,
    align: def.align ?? 'start',
    pin,
    resizable: def.resizable ?? options.resizable,
  }
}

function utilityLeaf<T>(kind: 'drag' | 'expand'): LeafColumn<T> {
  const width = UTILITY_WIDTH[kind]
  return {
    id: `__${kind}`,
    kind,
    width,
    defaultWidth: width,
    minWidth: width,
    maxWidth: width,
    align: 'center',
    pin: 'left',
    resizable: false,
  }
}

/** Orders columns (left-pinned · scrolling · right-pinned), resolves widths, sticky offsets and header rows. */
export function buildLayout<T>(
  defs: DataTableColumnDef<T>[],
  options: LayoutOptions,
): TableLayout<T> {
  const blocks: Block<T>[] = []
  if (options.hasDrag) blocks.push({ pin: 'left', leaves: [utilityLeaf('drag')] })
  if (options.hasExpand) blocks.push({ pin: 'left', leaves: [utilityLeaf('expand')] })

  for (const def of defs) {
    if (isGroup(def)) {
      blocks.push({
        pin: def.pin,
        group: def,
        leaves: def.columns.map((c) => toLeaf(c, def.pin, options)),
      })
    } else {
      blocks.push({ pin: def.pin, leaves: [toLeaf(def, def.pin, options)] })
    }
  }

  const ordered = [
    ...blocks.filter((b) => b.pin === 'left'),
    ...blocks.filter((b) => !b.pin),
    ...blocks.filter((b) => b.pin === 'right'),
  ]
  const leaves = ordered.flatMap((b) => b.leaves)

  // Sticky offsets
  let left = 0
  for (const leaf of leaves) {
    if (leaf.pin !== 'left') continue
    leaf.offset = left
    left += leaf.width
  }
  let right = 0
  for (let i = leaves.length - 1; i >= 0; i--) {
    const leaf = leaves[i]
    if (leaf.pin !== 'right') continue
    leaf.offset = right
    right += leaf.width
  }
  const lastLeft = [...leaves].reverse().find((l) => l.pin === 'left')
  const firstRight = leaves.find((l) => l.pin === 'right')
  if (lastLeft) lastLeft.edge = 'left'
  if (firstRight) firstRight.edge = 'right'

  const fillerIndex = firstRight ? leaves.indexOf(firstRight) : leaves.length
  const depth = ordered.some((b) => b.group) ? 2 : 1

  // Header rows
  const top: HeaderCell<T>[] = []
  const bottom: HeaderCell<T>[] = []
  let leafCursor = 0
  for (const block of ordered) {
    if (leafCursor === fillerIndex) top.push(fillerCell(depth))
    if (block.group) {
      const first = block.leaves[0]
      const last = block.leaves[block.leaves.length - 1]
      top.push({
        key: `group-${block.group.id}`,
        type: 'group',
        group: block.group,
        colSpan: block.leaves.length,
        rowSpan: 1,
        pin: block.pin,
        offset: block.pin === 'right' ? last.offset : first.offset,
        edge: block.leaves.find((l) => l.edge)?.edge,
        align: block.group.align ?? 'center',
      })
      for (const leaf of block.leaves) bottom.push(leafCell(leaf, 1))
    } else {
      for (const leaf of block.leaves) top.push(leafCell(leaf, depth))
    }
    leafCursor += block.leaves.length
  }
  if (leafCursor === fillerIndex) top.push(fillerCell(depth))

  return {
    leaves,
    fillerIndex,
    headerRows: depth === 2 ? [top, bottom] : [top],
    totalWidth: leaves.reduce((sum, l) => sum + l.width, 0),
  }
}

function leafCell<T>(leaf: LeafColumn<T>, rowSpan: number): HeaderCell<T> {
  return {
    key: `leaf-${leaf.id}`,
    type: 'leaf',
    leaf,
    colSpan: 1,
    rowSpan,
    pin: leaf.pin,
    offset: leaf.offset,
    edge: leaf.edge,
    align: leaf.align,
  }
}

function fillerCell<T>(rowSpan: number): HeaderCell<T> {
  return { key: 'filler', type: 'filler', colSpan: 1, rowSpan, align: 'start' }
}

export function getValue<T>(def: DataTableColumn<T> | undefined, row: T): unknown {
  if (!def?.accessor) return undefined
  return typeof def.accessor === 'function' ? def.accessor(row) : row[def.accessor]
}
