import * as React from 'react'
import { createPortal } from 'react-dom'
import { useMessages } from '../i18n/locale-provider'
import type { MomiMessages } from '../i18n/messages'
import { cn } from '../lib/cn'
import { GripVerticalIcon } from '../lib/icons'
import { mergeRefs } from '../lib/merge-refs'
import { useControllableState } from '../lib/use-controllable-state'
import { usePortalContainer } from './portal-provider'
import {
  moveIndex,
  scrollNearEdge,
  scrollParent,
  useSortableDrag,
  type SortableDragState,
} from './internal/sortable-drag'

export interface SortableReorderEvent<T> {
  item: T
  itemId: string
  from: number
  /** Index of the item in the reordered list. */
  to: number
}

export interface SortableItemContext {
  index: number
  /** Rendered in the floating copy that follows the pointer. */
  overlay: boolean
  /** The row left in place while its copy is dragged. */
  dragging: boolean
  /** Picked up with the keyboard. */
  lifted: boolean
}

export interface SortableListProps<T> extends Omit<
  React.ComponentProps<'ul'>,
  'children' | 'defaultValue'
> {
  /** The items, in order (controlled). */
  value?: T[]
  /** Initial items when uncontrolled. */
  defaultValue?: T[]
  /** The whole list after a drop. */
  onValueChange?: (items: T[]) => void
  /** The move itself — handy for saving it to a server. */
  onReorder?: (event: SortableReorderEvent<T>) => void
  /** Row content. The row surface, focus ring and drag behavior are provided. */
  renderItem: (item: T, context: SortableItemContext) => React.ReactNode
  /** Stable item id. Defaults to `item.id`. */
  getItemId?: (item: T) => string
  /** Item name in screen-reader announcements, e.g. its title. */
  getItemLabel?: (item: T) => string
  /**
   * Drag only by a `<SortableHandle />` placed inside each row (the handle also takes keyboard
   * focus). Otherwise the whole row is draggable.
   */
  handle?: boolean
  /** @default 'vertical' */
  orientation?: 'vertical' | 'horizontal'
  /** `card`: separate bordered rows · `plain`: flat rows for dense panels. @default 'card' */
  variant?: 'card' | 'plain'
  disabled?: boolean
  /** Override built-in text (announcements, handle label) for this instance. */
  labels?: Partial<MomiMessages['sortableList']>
  itemClassName?: string
}

type DragState<T> = SortableDragState<T, number>

type HandleProps = React.ComponentProps<'button'> & { 'data-sortable-handle'?: string }

interface HandleContextValue {
  /** Props for an interactive handle; `null` renders a decorative grip. */
  props: HandleProps | null
}

const HandleContext = React.createContext<HandleContextValue>({ props: null })

const NO_ITEMS: never[] = []

function defaultItemId(item: unknown): string {
  if (item && typeof item === 'object' && 'id' in item) {
    const id = (item as { id: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  throw new Error('SortableList: items need an `id`, or pass `getItemId`.')
}

const variantClass = {
  card: 'gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-card-foreground shadow-xs',
  plain: 'gap-2 rounded-md px-2 py-1.5',
} as const

const liftedClass = {
  card: 'data-[lifted]:z-10 data-[lifted]:border-primary data-[lifted]:shadow-lg data-[lifted]:ring-[3px] data-[lifted]:ring-primary/25',
  plain:
    'data-[lifted]:z-10 data-[lifted]:bg-accent data-[lifted]:ring-2 data-[lifted]:ring-primary/40',
} as const

const overlayClass = {
  card: 'scale-[1.02] border-foreground/10 shadow-xl',
  plain: 'bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10',
} as const

/** Grip that drags its row. Interactive inside a `handle` list, decorative otherwise. */
export function SortableHandle({ className, children, ...props }: React.ComponentProps<'button'>) {
  const { props: handleProps } = React.useContext(HandleContext)
  const icon = children ?? <GripVerticalIcon className="size-4" />
  if (!handleProps) {
    return (
      <span
        aria-hidden
        data-slot="sortable-handle"
        className={cn(
          'inline-flex size-6 shrink-0 items-center justify-center text-muted-foreground/60',
          className,
        )}
      >
        {icon}
      </span>
    )
  }
  return (
    <button
      type="button"
      data-slot="sortable-handle"
      {...handleProps}
      {...props}
      className={cn(
        '-m-1 inline-flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground/70 transition-colors outline-none select-none',
        'hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 active:cursor-grabbing',
        'disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
    >
      {icon}
    </button>
  )
}

/**
 * A list reordered by drag and drop: mouse, touch (press and hold, or drag a handle) and keyboard
 * (Space to pick up, arrows to move, Space to drop, Esc to cancel).
 */
export function SortableList<T>({
  value,
  defaultValue = NO_ITEMS,
  onValueChange,
  onReorder,
  renderItem,
  getItemId: getId = defaultItemId,
  getItemLabel,
  handle = false,
  orientation = 'vertical',
  variant = 'card',
  disabled = false,
  labels,
  itemClassName,
  className,
  style,
  ref,
  ...props
}: SortableListProps<T>) {
  const t = useMessages('sortableList', labels)
  const overlayContainer = usePortalContainer()
  const helpId = `${React.useId()}-help`
  const vertical = orientation === 'vertical'
  const label = (item: T) => getItemLabel?.(item) ?? t.item
  const [items, setItems] = useControllableState<T[]>({
    value,
    defaultValue,
    onChange: onValueChange,
  })

  const focusItem = (root: HTMLElement | null, id: string) => {
    for (const row of root?.children ?? []) {
      if (!(row instanceof HTMLElement) || row.dataset.sortableItem !== id) continue
      const target = handle ? row.querySelector<HTMLElement>('[data-sortable-handle]') : row
      target?.focus()
      return Boolean(target)
    }
    return false
  }

  function targetAt(root: HTMLElement, x: number, y: number, d: DragState<T>) {
    const rtl = getComputedStyle(root).direction === 'rtl'
    let index = 0
    for (const row of root.children) {
      if (!(row instanceof HTMLElement) || row.dataset.sortableItem === undefined) continue
      if (row.dataset.sortableItem === d.id) continue
      const rect = row.getBoundingClientRect()
      const before = vertical
        ? y < rect.top + rect.height / 2
        : rtl
          ? x > rect.left + rect.width / 2
          : x < rect.left + rect.width / 2
      if (before) break
      index++
    }
    return index
  }

  const engine = useSortableDrag<T, number>({
    disabled,
    samePosition: (a, b) => a === b,
    targetAt,
    autoScroll: (root, x, y) => {
      const axis = vertical ? 'y' : 'x'
      return scrollNearEdge(scrollParent(root, axis), x, y, axis)
    },
    onDrop: (d) => {
      setItems(moveIndex(items, d.from, d.to))
      onReorder?.({ item: d.item, itemId: d.id, from: d.from, to: d.to })
    },
    focusItem,
    announce: {
      pickedUp: (d, at) => t.pickedUp(label(d.item), at + 1, items.length),
      moved: (d, to) => t.moved(label(d.item), to + 1, items.length),
      dropped: (d, at) => t.dropped(label(d.item), at + 1, items.length),
      cancelled: (d) => t.cancelled(label(d.item)),
    },
  })
  const { drag, pointerDragging, keyboardDragging, announcement, attachRoot, attachOverlay } =
    engine

  function onKeyDown(event: React.KeyboardEvent<HTMLElement>, item: T, id: string, index: number) {
    if (event.target !== event.currentTarget || event.nativeEvent.isComposing) return
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'
    const back = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
    const forward = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
    const last = items.length - 1
    const d = engine.getDrag()

    if (d?.mode === 'keyboard' && d.id === id) {
      if (event.key === back) {
        if (d.to > 0) engine.moveTo(d.to - 1)
      } else if (event.key === forward) {
        if (d.to < last) engine.moveTo(d.to + 1)
      } else if (event.key === 'Home') engine.moveTo(0)
      else if (event.key === 'End') engine.moveTo(last)
      else if (event.key === ' ' || event.key === 'Enter') engine.drop()
      else if (event.key === 'Escape' || event.key === 'Tab') engine.cancel()
      else return
      if (event.key !== 'Tab') event.preventDefault()
      return
    }
    if (d) return

    if (event.key === ' ' && !disabled) {
      event.preventDefault()
      engine.pickUp(item, id, index)
    } else if (event.key === back || event.key === forward) {
      const next = items[index + (event.key === back ? -1 : 1)]
      if (next !== undefined && focusItem(engine.getRoot(), getId(next))) event.preventDefault()
    }
  }

  const rowClass = cn(
    'relative flex items-center text-sm outline-none',
    variantClass[variant],
    liftedClass[variant],
    'focus-visible:ring-[3px] focus-visible:ring-ring/40',
    variant === 'card' && 'focus-visible:border-ring',
    'data-[dragging]:opacity-40',
  )

  // Where the drop line shows during a pointer drag (rows stay in place meanwhile).
  let indicator: { id: string; side: 'before' | 'after' } | null = null
  if (pointerDragging && drag && drag.to !== drag.from) {
    const others = items.filter((item) => getId(item) !== drag.id)
    const next = others[drag.to]
    const prev = others[others.length - 1]
    if (next !== undefined) indicator = { id: getId(next), side: 'before' }
    else if (prev !== undefined) indicator = { id: getId(prev), side: 'after' }
  }

  const offset = 'calc(var(--sortable-gap) / -2 - 1px)'
  const indicatorStyle = (side: 'before' | 'after'): React.CSSProperties =>
    vertical
      ? side === 'before'
        ? { top: offset }
        : { bottom: offset }
      : side === 'before'
        ? { insetInlineStart: offset }
        : { insetInlineEnd: offset }

  const rootRef = React.useMemo(() => mergeRefs(attachRoot, ref), [attachRoot, ref])

  // Keyboard drags preview the new order; pointer drags keep rows still and draw a drop line.
  const display = keyboardDragging && drag ? moveIndex(items, drag.from, drag.to) : items

  return (
    <>
      <ul
        ref={rootRef}
        data-slot="sortable-list"
        data-orientation={orientation}
        data-dragging={drag ? drag.mode : undefined}
        className={cn(
          'flex gap-(--sortable-gap)',
          vertical ? 'flex-col' : 'flex-row',
          variant === 'card' ? '[--sortable-gap:0.5rem]' : '[--sortable-gap:0.125rem]',
          className,
        )}
        style={style}
        {...props}
      >
        {display.map((item, index) => {
          const id = getId(item)
          const lifted = keyboardDragging && drag?.id === id
          const dragging = pointerDragging && drag?.id === id
          const draggable = !disabled
          const start = (e: React.PointerEvent<HTMLElement>, element?: Element | null) =>
            engine.onItemPointerDown(e, {
              item,
              id,
              from: index,
              element,
              touchImmediate: Boolean(element),
            })
          const handleProps: HandleProps | null = handle
            ? {
                disabled,
                'aria-label': t.handle(label(item)),
                'aria-roledescription': t.itemRole,
                'aria-describedby': helpId,
                'data-sortable-handle': id,
                onPointerDown: (e) => start(e, e.currentTarget.closest('[data-sortable-item]')),
                onKeyDown: (e) => onKeyDown(e, item, id, index),
                onDragStart: (e) => e.preventDefault(),
              }
            : null
          return (
            <li
              key={id}
              data-slot="sortable-item"
              data-sortable-item={id}
              data-lifted={lifted || undefined}
              data-dragging={dragging || undefined}
              tabIndex={!handle && draggable ? 0 : undefined}
              aria-roledescription={!handle && draggable ? t.itemRole : undefined}
              aria-describedby={!handle && draggable ? helpId : undefined}
              onPointerDown={!handle ? (e) => start(e) : undefined}
              onKeyDown={!handle ? (e) => onKeyDown(e, item, id, index) : undefined}
              onDragStart={!handle ? (e) => e.preventDefault() : undefined}
              onContextMenu={(e) => {
                if (engine.touchPending()) e.preventDefault()
              }}
              onClickCapture={(e) => {
                if (!engine.clickSuppressed()) return
                e.preventDefault()
                e.stopPropagation()
              }}
              className={cn(
                rowClass,
                !handle &&
                  draggable &&
                  'cursor-grab touch-manipulation select-none [-webkit-touch-callout:none]',
                !handle && draggable && variant === 'plain' && 'hover:bg-accent/60',
                !handle && draggable && variant === 'card' && 'hover:border-foreground/15',
                itemClassName,
              )}
            >
              <HandleContext value={{ props: handleProps }}>
                {renderItem(item, { index, overlay: false, dragging, lifted })}
              </HandleContext>
              {indicator?.id === id && (
                <span
                  aria-hidden
                  data-slot="sortable-indicator"
                  className={cn(
                    'pointer-events-none absolute z-10 rounded-full bg-primary',
                    vertical ? 'inset-x-0 h-0.5' : 'inset-y-0 w-0.5',
                  )}
                  style={indicatorStyle(indicator.side)}
                >
                  {vertical && (
                    <span className="absolute -start-1 top-1/2 size-2 -translate-y-1/2 rounded-full border-2 border-primary bg-background" />
                  )}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      {!disabled && (
        <>
          <span id={helpId} className="sr-only">
            {t.instructions}
          </span>
          <div aria-live="assertive" aria-atomic className="sr-only">
            {announcement}
          </div>
        </>
      )}

      {pointerDragging &&
        drag &&
        createPortal(
          <div
            ref={attachOverlay}
            aria-hidden
            data-slot="sortable-overlay"
            className="pointer-events-none fixed top-0 left-0 z-[100]"
            style={{ width: drag.width }}
          >
            <div
              className={cn(
                'relative flex items-center text-sm',
                variantClass[variant],
                overlayClass[variant],
                itemClassName,
              )}
            >
              <HandleContext value={{ props: null }}>
                {renderItem(drag.item, {
                  index: drag.from,
                  overlay: true,
                  dragging: false,
                  lifted: false,
                })}
              </HandleContext>
            </div>
          </div>,
          overlayContainer ?? document.body,
        )}
    </>
  )
}
