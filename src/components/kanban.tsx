import * as React from 'react'
import { createPortal } from 'react-dom'
import { useMessages } from '../i18n/locale-provider'
import type { MomiMessages } from '../i18n/messages'
import { cn } from '../lib/cn'
import { PlusIcon } from '../lib/icons'
import { toneBg, type Tone } from '../lib/tones'
import { useControllableState } from '../lib/use-controllable-state'
import { usePortalContainer } from './portal-provider'
import {
  INTERACTIVE,
  scrollNearEdge,
  useSortableDrag,
  type SortableDragState,
} from './internal/sortable-drag'

/** Cards per column id. Column order comes from `columns`. */
export type KanbanValue<T> = Record<string, T[]>

export interface KanbanColumn {
  id: string
  /** Plain text: also used in screen-reader announcements. */
  title: string
  /** Colored dot before the title. */
  tone?: Tone
  icon?: React.ReactNode
  /** Soft WIP limit: the count turns into a warning once exceeded. */
  limit?: number
}

export interface KanbanPosition {
  columnId: string
  /** Index in the target column once the card has left its old place. */
  index: number
}

export interface KanbanMoveEvent<T> {
  item: T
  itemId: string
  from: KanbanPosition
  to: KanbanPosition
}

export interface KanbanCardContext {
  columnId: string
  index: number
  /** Rendered in the floating copy that follows the pointer. */
  overlay: boolean
  /** Picked up with the keyboard. */
  lifted: boolean
}

export interface KanbanProps<T> {
  columns: KanbanColumn[]
  value?: KanbanValue<T>
  defaultValue?: KanbanValue<T>
  /** The whole board after a card moved. */
  onValueChange?: (value: KanbanValue<T>) => void
  /** The move itself — handy for saving it to a server. */
  onCardMove?: (event: KanbanMoveEvent<T>) => void
  /** Return false to forbid a move (workflow rules, WIP limits…). */
  canMove?: (event: KanbanMoveEvent<T>) => boolean
  /** Card content. The card surface, focus ring and drag behavior are provided. */
  renderCard: (item: T, context: KanbanCardContext) => React.ReactNode
  /** Stable card id. Defaults to `item.id`. */
  getItemId?: (item: T) => string
  /** Card name in screen-reader announcements, e.g. its title. */
  getItemLabel?: (item: T) => string
  /** Click, or Enter on a focused card. */
  onCardClick?: (item: T) => void
  /** Shows an "Add card" button at the bottom of each column. */
  onAddCard?: (columnId: string) => void
  /** Extra controls at the end of a column header, e.g. a DropdownMenu. */
  renderColumnActions?: (column: KanbanColumn) => React.ReactNode
  /** Let users fold columns into a narrow strip. */
  collapsible?: boolean
  /** Ids of collapsed columns. */
  collapsed?: string[]
  defaultCollapsed?: string[]
  onCollapsedChange?: (collapsed: string[]) => void
  /** Read-only board: no dragging. */
  disabled?: boolean
  /**
   * Column width in px, or `'fill'` to share the board's width equally between the columns
   * (down to `minColumnWidth`, then the board scrolls sideways). @default 288
   */
  columnWidth?: number | 'fill'
  /** Narrowest a `'fill'` column gets before the board scrolls. @default 200 */
  minColumnWidth?: number
  /** Max column height; cards scroll inside the column. */
  maxHeight?: number | string
  /** Content of an empty column. @default messages.kanban.empty */
  emptyState?: React.ReactNode
  /** Override built-in text (announcements, buttons) for this instance. */
  labels?: Partial<MomiMessages['kanban']>
  'aria-label'?: string
  className?: string
  columnClassName?: string
  cardClassName?: string
}

/** Move one card; `to.index` counts cards in the target column without the moved one. */
export function moveKanbanItem<T>(
  value: KanbanValue<T>,
  from: KanbanPosition,
  to: KanbanPosition,
): KanbanValue<T> {
  const source = [...(value[from.columnId] ?? [])]
  const [item] = source.splice(from.index, 1)
  if (item === undefined) return value
  if (from.columnId === to.columnId) {
    source.splice(to.index, 0, item)
    return { ...value, [from.columnId]: source }
  }
  const target = [...(value[to.columnId] ?? [])]
  target.splice(to.index, 0, item)
  return { ...value, [from.columnId]: source, [to.columnId]: target }
}

type DragState<T> = SortableDragState<T, KanbanPosition>

const NO_COLLAPSED: string[] = []

const iconButtonClass =
  'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40'

const cardSurface =
  'relative rounded-lg border bg-card p-3 text-sm text-card-foreground shadow-xs select-none [-webkit-touch-callout:none]'

function defaultItemId(item: unknown): string {
  if (item && typeof item === 'object' && 'id' in item) {
    const id = (item as { id: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  throw new Error('Kanban: items need an `id`, or pass `getItemId`.')
}

function FoldIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M2 12h6M22 12h-6M12 2v2M12 8v2M12 14v2M12 20v2m7-11-3 3 3 3M5 15l3-3-3-3" />
    </svg>
  )
}

function UnfoldIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M16 12h6M8 12H2M12 2v2M12 8v2M12 14v2M12 20v2m7-7 3-3-3-3M5 9l-3 3 3 3" />
    </svg>
  )
}

/**
 * Board of columns and cards. Drag cards with the mouse, touch (press and hold) or keyboard
 * (Space to pick up, arrows to move, Space to drop, Esc to cancel).
 */
export function Kanban<T>({
  columns,
  value,
  defaultValue = {},
  onValueChange,
  onCardMove,
  canMove,
  renderCard,
  getItemId = defaultItemId,
  getItemLabel,
  onCardClick,
  onAddCard,
  renderColumnActions,
  collapsible = false,
  collapsed: collapsedProp,
  defaultCollapsed = NO_COLLAPSED,
  onCollapsedChange,
  disabled = false,
  columnWidth = 288,
  minColumnWidth = 200,
  maxHeight,
  emptyState,
  labels,
  'aria-label': ariaLabel,
  className,
  columnClassName,
  cardClassName,
}: KanbanProps<T>) {
  const t = useMessages('kanban', labels)
  // The floating card follows the pointer; it lives in PortalProvider's container when there is one.
  const overlayContainer = usePortalContainer()
  const baseId = React.useId()
  const helpId = `${baseId}-help`

  const [board, setBoard] = useControllableState<KanbanValue<T>>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [collapsed, setCollapsed] = useControllableState<string[]>({
    value: collapsedProp,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
  })

  const cardsOf = (columnId: string) => board[columnId] ?? []
  const columnTitle = (columnId: string) => columns.find((c) => c.id === columnId)?.title ?? ''
  const itemLabel = (item: T) => getItemLabel?.(item) ?? t.card
  /** Cards in a column, not counting the one being moved. */
  const othersIn = (columnId: string, d: DragState<T>) =>
    cardsOf(columnId).length - (columnId === d.from.columnId ? 1 : 0)
  const isAllowed = (d: DragState<T>, to: KanbanPosition) =>
    !canMove || canMove({ item: d.item, itemId: d.id, from: d.from, to })
  const samePosition = (a: KanbanPosition, b: KanbanPosition) =>
    a.columnId === b.columnId && a.index === b.index
  const describe = (d: DragState<T>, to: KanbanPosition) =>
    [columnTitle(to.columnId), to.index + 1, othersIn(to.columnId, d) + 1] as const

  const focusCard = (root: HTMLElement | null, id: string) => {
    for (const card of root?.querySelectorAll<HTMLElement>('[data-kanban-card]') ?? []) {
      if (card.dataset.kanbanCard === id) {
        card.focus()
        return true
      }
    }
    return false
  }

  /** Column + insertion index under a viewport point, from the rendered cards. */
  function targetAt(root: HTMLElement, x: number, y: number, d: DragState<T>) {
    const sections = root.querySelectorAll<HTMLElement>('[data-kanban-column]')
    let best: HTMLElement | null = null
    let bestDistance = Infinity
    for (const section of sections) {
      const rect = section.getBoundingClientRect()
      const distance = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0
      if (distance < bestDistance) {
        best = section
        bestDistance = distance
      }
    }
    if (!best) return null
    const columnId = best.dataset.kanbanColumn!
    if (best.dataset.collapsed !== undefined) {
      return { columnId, index: othersIn(columnId, d) } satisfies KanbanPosition
    }
    let index = 0
    for (const card of best.querySelectorAll<HTMLElement>('[data-kanban-card]')) {
      if (card.dataset.kanbanCard === d.id) continue
      const rect = card.getBoundingClientRect()
      if (y < rect.top + rect.height / 2) break
      index++
    }
    return { columnId, index } satisfies KanbanPosition
  }

  const engine = useSortableDrag<T, KanbanPosition>({
    disabled,
    samePosition,
    targetAt,
    isAllowed,
    blockedKey: (to) => to.columnId,
    // The board scrolls sideways; the column under the pointer scrolls up/down.
    autoScroll: (root, x, y) => {
      let scrolled = scrollNearEdge(root, x, y, 'x')
      for (const list of root.querySelectorAll<HTMLElement>('[data-kanban-list]')) {
        if (scrollNearEdge(list, x, y, 'y')) scrolled = true
      }
      return scrolled
    },
    onDrop: (d) => {
      setBoard(moveKanbanItem(board, d.from, d.to))
      onCardMove?.({ item: d.item, itemId: d.id, from: d.from, to: d.to })
    },
    focusItem: focusCard,
    announce: {
      pickedUp: (d, at) => t.pickedUp(itemLabel(d.item), ...describe(d, at)),
      moved: (d, to) => t.moved(itemLabel(d.item), ...describe(d, to)),
      dropped: (d, at) => t.dropped(itemLabel(d.item), ...describe(d, at)),
      cancelled: (d) => t.cancelled(itemLabel(d.item)),
    },
  })
  const { drag, pointerDragging, keyboardDragging, announcement, attachRoot, attachOverlay } =
    engine

  // Board as it will look after the drop (counts, keyboard preview).
  const preview = drag ? moveKanbanItem(board, drag.from, drag.to) : board

  /* Keyboard ----------------------------------------------------------------------------------- */
  const visibleColumns = columns.filter((c) => !(collapsible && collapsed.includes(c.id)))

  function moveLifted(d: DragState<T>, key: string, rtl: boolean) {
    let to: KanbanPosition | null = null
    if (key === 'ArrowUp' && d.to.index > 0) to = { ...d.to, index: d.to.index - 1 }
    else if (key === 'ArrowDown' && d.to.index < othersIn(d.to.columnId, d))
      to = { ...d.to, index: d.to.index + 1 }
    else if (key === 'ArrowLeft' || key === 'ArrowRight') {
      const step = (key === 'ArrowRight') !== rtl ? 1 : -1
      // Collapsed columns render no cards (focus would be lost); skip them and columns that refuse the card.
      const order = visibleColumns.map((c) => c.id)
      for (let i = order.indexOf(d.to.columnId) + step; i >= 0 && i < order.length; i += step) {
        const columnId = order[i]
        const candidate = { columnId, index: Math.min(d.to.index, othersIn(columnId, d)) }
        if (samePosition(candidate, d.from) || isAllowed(d, candidate)) {
          to = candidate
          break
        }
      }
    }
    if (to) engine.moveTo(to)
  }

  /** Arrow keys without a lifted card move focus between cards. */
  function moveFocus(key: string, from: KanbanPosition, rtl: boolean) {
    let target: { columnId: string; index: number } | null = null
    const count = cardsOf(from.columnId).length
    if (key === 'ArrowUp' && from.index > 0) target = { ...from, index: from.index - 1 }
    else if (key === 'ArrowDown' && from.index < count - 1)
      target = { ...from, index: from.index + 1 }
    else if (key === 'ArrowLeft' || key === 'ArrowRight') {
      const step = (key === 'ArrowRight') !== rtl ? 1 : -1
      const order = visibleColumns.map((c) => c.id)
      for (let i = order.indexOf(from.columnId) + step; i >= 0 && i < order.length; i += step) {
        const length = cardsOf(order[i]).length
        if (length > 0) {
          target = { columnId: order[i], index: Math.min(from.index, length - 1) }
          break
        }
      }
    }
    const item = target ? cardsOf(target.columnId)[target.index] : undefined
    return item !== undefined && focusCard(engine.getRoot(), getItemId(item))
  }

  function onCardKeyDown(
    event: React.KeyboardEvent<HTMLLIElement>,
    item: T,
    id: string,
    from: KanbanPosition,
  ) {
    if (event.target !== event.currentTarget || event.nativeEvent.isComposing) return
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'
    const d = engine.getDrag()
    const arrow = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)

    if (d?.mode === 'keyboard' && d.id === id) {
      if (arrow) moveLifted(d, event.key, rtl)
      else if (event.key === ' ' || event.key === 'Enter') engine.drop()
      else if (event.key === 'Escape' || event.key === 'Tab') engine.cancel()
      else return
      if (event.key !== 'Tab') event.preventDefault()
      return
    }
    if (d) return

    if (event.key === ' ' && !disabled) {
      event.preventDefault()
      engine.pickUp(item, id, from)
    } else if (event.key === 'Enter' && onCardClick) {
      event.preventDefault()
      onCardClick(item)
    } else if (arrow && moveFocus(event.key, from, rtl)) {
      event.preventDefault()
    }
  }

  /* Rendering ---------------------------------------------------------------------------------- */
  function toggleCollapsed(columnId: string) {
    setCollapsed(
      collapsed.includes(columnId)
        ? collapsed.filter((id) => id !== columnId)
        : [...collapsed, columnId],
    )
  }

  const placeholder = drag && (
    <li
      key="__placeholder"
      aria-hidden
      data-slot="kanban-placeholder"
      className="shrink-0 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5"
      style={{ height: drag.height }}
    />
  )

  function renderCardItem(item: T, id: string, position: KanbanPosition, hidden: boolean) {
    const lifted = keyboardDragging && drag?.id === id
    return (
      <li
        key={id}
        data-slot="kanban-card"
        data-kanban-card={id}
        data-lifted={lifted || undefined}
        tabIndex={disabled && !onCardClick ? undefined : 0}
        aria-roledescription={disabled ? undefined : t.cardRole}
        aria-describedby={disabled ? undefined : helpId}
        onPointerDown={(e) => engine.onItemPointerDown(e, { item, id, from: position })}
        onKeyDown={(e) => onCardKeyDown(e, item, id, position)}
        onClick={(e) => {
          const interactive = (e.target as Element).closest(INTERACTIVE)
          if (interactive && interactive !== e.currentTarget) return
          if (!engine.clickSuppressed()) onCardClick?.(item)
        }}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => {
          if (engine.touchPending()) e.preventDefault()
        }}
        className={cn(
          cardSurface,
          'shrink-0 transition-[border-color,box-shadow] outline-none',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40',
          !disabled && 'cursor-grab touch-manipulation hover:border-foreground/15 hover:shadow-sm',
          disabled && onCardClick && 'cursor-pointer',
          'data-[lifted]:z-10 data-[lifted]:border-primary data-[lifted]:shadow-lg data-[lifted]:ring-[3px] data-[lifted]:ring-primary/25',
          hidden && 'hidden',
          cardClassName,
        )}
      >
        {renderCard(item, {
          columnId: position.columnId,
          index: position.index,
          overlay: false,
          lifted,
        })}
      </li>
    )
  }

  function renderCount(column: KanbanColumn) {
    const count = (preview[column.id] ?? []).length
    const over = column.limit !== undefined && count > column.limit
    return (
      <span
        data-slot="kanban-count"
        data-over-limit={over || undefined}
        className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-background px-1.5 text-xs font-medium text-muted-foreground tabular-nums shadow-xs ring-1 ring-border data-[over-limit]:bg-warning/10 data-[over-limit]:text-warning data-[over-limit]:ring-warning/30"
      >
        <span aria-hidden>{column.limit === undefined ? count : `${count}/${column.limit}`}</span>
        <span className="sr-only">
          {t.count(count, column.limit)}
          {over && `, ${t.overLimit}`}
        </span>
      </span>
    )
  }

  function renderCollapsedColumn(column: KanbanColumn) {
    const titleId = `${baseId}-${column.id}-title`
    const isOver = pointerDragging && drag?.to.columnId === column.id && !drag.blocked
    return (
      <section
        key={column.id}
        data-slot="kanban-column"
        data-kanban-column={column.id}
        data-collapsed=""
        data-over={(isOver && drag?.from.columnId !== column.id) || undefined}
        data-blocked={drag?.blocked === column.id || undefined}
        aria-labelledby={titleId}
        className={cn(
          'flex w-11 shrink-0 flex-col items-center gap-3 self-stretch rounded-xl border bg-muted/40 py-2 transition-colors',
          'data-[over]:border-primary/40 data-[over]:bg-primary/5',
          'data-[blocked]:border-destructive/30 data-[blocked]:bg-destructive/5',
          columnClassName,
        )}
        style={{ maxHeight }}
      >
        <button
          type="button"
          aria-expanded={false}
          aria-label={t.expand(column.title)}
          onClick={() => toggleCollapsed(column.id)}
          className={iconButtonClass}
        >
          <UnfoldIcon className="size-4" />
        </button>
        {renderCount(column)}
        <h3
          id={titleId}
          className="flex items-center gap-2 text-sm font-medium [writing-mode:vertical-rl]"
        >
          {column.tone && (
            <span aria-hidden className={cn('size-2 rounded-full', toneBg[column.tone])} />
          )}
          {column.title}
        </h3>
      </section>
    )
  }

  function renderColumn(column: KanbanColumn) {
    const titleId = `${baseId}-${column.id}-title`
    const nodes: React.ReactNode[] = []
    let visible = 0

    if (pointerDragging && drag) {
      // Pointer drag: cards stay where they are (the dragged one hidden) and a placeholder
      // shows where it will land.
      const showPlaceholder = drag.to.columnId === column.id
      cardsOf(column.id).forEach((item, index) => {
        const id = getItemId(item)
        const isDragged = id === drag.id
        if (!isDragged) {
          if (showPlaceholder && visible === drag.to.index) nodes.push(placeholder)
          visible++
        }
        nodes.push(renderCardItem(item, id, { columnId: column.id, index }, isDragged))
      })
      if (showPlaceholder && drag.to.index >= visible) nodes.push(placeholder)
      if (showPlaceholder) visible++
    } else {
      // Idle, or keyboard drag: render the board as it will look after the drop.
      ;(preview[column.id] ?? []).forEach((item, index) => {
        nodes.push(renderCardItem(item, getItemId(item), { columnId: column.id, index }, false))
        visible++
      })
    }

    const isOver = drag && drag.to.columnId === column.id && drag.from.columnId !== column.id

    return (
      <section
        key={column.id}
        data-slot="kanban-column"
        data-kanban-column={column.id}
        data-over={isOver || undefined}
        data-blocked={drag?.blocked === column.id || undefined}
        aria-labelledby={titleId}
        className={cn(
          'flex shrink-0 flex-col rounded-xl border bg-muted/40 transition-colors',
          'data-[over]:border-primary/25',
          'data-[blocked]:border-destructive/30 data-[blocked]:bg-destructive/5',
          columnClassName,
        )}
        data-fill={columnWidth === 'fill' || undefined}
        style={
          columnWidth === 'fill'
            ? { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: minColumnWidth, maxHeight }
            : { width: columnWidth, maxHeight }
        }
      >
        <header className="flex h-11 shrink-0 items-center gap-2 ps-3 pe-1.5">
          {column.tone && (
            <span aria-hidden className={cn('size-2 shrink-0 rounded-full', toneBg[column.tone])} />
          )}
          {column.icon && (
            <span aria-hidden className="flex shrink-0 text-muted-foreground [&_svg]:size-4">
              {column.icon}
            </span>
          )}
          <h3 id={titleId} className="min-w-0 truncate text-sm font-medium">
            {column.title}
          </h3>
          {renderCount(column)}
          <span className="ms-auto flex shrink-0 items-center">
            {renderColumnActions?.(column)}
            {collapsible && (
              <button
                type="button"
                aria-expanded
                aria-label={t.collapse(column.title)}
                onClick={() => toggleCollapsed(column.id)}
                className={iconButtonClass}
              >
                <FoldIcon className="size-4" />
              </button>
            )}
          </span>
        </header>
        <ul
          data-kanban-list=""
          aria-labelledby={titleId}
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pt-0.5 pb-2"
        >
          {nodes}
          {visible === 0 && (
            <li
              data-slot="kanban-empty"
              className="flex h-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-foreground/10 px-3 text-center text-xs text-muted-foreground"
            >
              {drag ? t.dropHere : (emptyState ?? t.empty)}
            </li>
          )}
        </ul>
        {onAddCard && (
          <div className="shrink-0 px-2 pb-2">
            <button
              type="button"
              data-slot="kanban-add"
              onClick={() => onAddCard(column.id)}
              className="flex h-8 w-full items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              <PlusIcon className="size-4" />
              {t.addCard}
            </button>
          </div>
        )}
      </section>
    )
  }

  return (
    <div
      ref={attachRoot}
      data-slot="kanban"
      data-dragging={drag ? drag.mode : undefined}
      role="region"
      aria-label={ariaLabel ?? t.board}
      className={cn('flex items-start gap-3 overflow-x-auto pb-2', className)}
    >
      {columns.map((column) =>
        collapsible && collapsed.includes(column.id)
          ? renderCollapsedColumn(column)
          : renderColumn(column),
      )}

      <span id={helpId} className="sr-only">
        {t.instructions}
      </span>
      <div aria-live="assertive" aria-atomic className="sr-only">
        {announcement}
      </div>

      {pointerDragging &&
        drag &&
        createPortal(
          <div
            ref={attachOverlay}
            aria-hidden
            data-slot="kanban-overlay"
            className="pointer-events-none fixed top-0 left-0 z-[100]"
            style={{ width: drag.width }}
          >
            <div
              className={cn(
                cardSurface,
                'scale-[1.02] rotate-2 border-foreground/10 shadow-xl',
                drag.blocked && 'border-destructive/40',
                cardClassName,
              )}
            >
              {renderCard(drag.item, {
                columnId: drag.from.columnId,
                index: drag.from.index,
                overlay: true,
                lifted: false,
              })}
            </div>
          </div>,
          overlayContainer ?? document.body,
        )}
    </div>
  )
}
