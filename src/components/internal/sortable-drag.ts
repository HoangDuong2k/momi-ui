import * as React from 'react'

/**
 * Shared drag-and-drop engine behind Kanban and SortableList: pointer sessions (mouse distance or
 * touch press-and-hold), keyboard pick-up / move / drop / cancel, auto-scroll, focus restore and
 * live-region announcements. Layout-specific parts (where a point lands, what scrolls, how a move
 * is applied) come from the component through `options`.
 */

export interface SortableDragState<T, P> {
  item: T
  id: string
  mode: 'pointer' | 'keyboard'
  from: P
  to: P
  /** Key of the area under the pointer that refused the drop (`isAllowed` returned false). */
  blocked: string | null
  /** Size of the dragged element (pointer drags) — for placeholders and the overlay. */
  width: number
  height: number
}

export interface SortableDragAnnouncements<T, P> {
  pickedUp: (drag: SortableDragState<T, P>, at: P) => string
  moved: (drag: SortableDragState<T, P>, to: P) => string
  dropped: (drag: SortableDragState<T, P>, at: P) => string
  cancelled: (drag: SortableDragState<T, P>) => string
}

export interface SortableDragOptions<T, P> {
  disabled?: boolean
  samePosition: (a: P, b: P) => boolean
  /** Drop position under a viewport point, from the items rendered in `root`. */
  targetAt: (root: HTMLElement, x: number, y: number, drag: SortableDragState<T, P>) => P | null
  /** Return false to refuse a drop position. */
  isAllowed?: (drag: SortableDragState<T, P>, to: P) => boolean
  /** Which area to mark as refusing the drop (e.g. a column id). */
  blockedKey?: (to: P) => string
  /** Scroll whatever is near the pointer; return true when something scrolled. */
  autoScroll?: (root: HTMLElement, x: number, y: number) => boolean
  /** Apply a move (only called when the position changed). */
  onDrop: (drag: SortableDragState<T, P>) => void
  /** Focus the element of an item, e.g. after a keyboard move remounted it. */
  focusItem: (root: HTMLElement, id: string) => void
  announce: SortableDragAnnouncements<T, P>
}

export interface SortableDragStart<T, P> {
  item: T
  id: string
  from: P
  /** Element measured for the overlay. Defaults to the event's current target. */
  element?: Element | null
  /**
   * Start touch drags by moving instead of press-and-hold — for drag handles with
   * `touch-action: none`, where a touch can't mean "scroll".
   */
  touchImmediate?: boolean
}

interface PointerSession<T, P> {
  item: T
  id: string
  from: P
  pointerId: number
  touch: boolean
  startX: number
  startY: number
  x: number
  y: number
  offsetX: number
  offsetY: number
  width: number
  height: number
  active: boolean
  timer: number
}

interface Handlers {
  onPointerMove: (event: PointerEvent) => void
  onPointerUp: (event: PointerEvent) => void
  onPointerCancel: () => void
  updateTarget: () => void
  /** `remeasure`: the portal container may have moved (a scroll) since the last call. */
  positionOverlay: (remeasure?: boolean) => void
  cancel: () => void
}

/** Mouse/pen: pixels to move before a press becomes a drag (so clicks still work). */
const DRAG_DISTANCE = 5
/** Touch: hold this long without moving to pick an item up; moving earlier scrolls. */
const TOUCH_DELAY = 220
const TOUCH_TOLERANCE = 8
const EDGE = 56

/** Presses on these (inside a draggable item) keep their own behavior instead of dragging. */
export const INTERACTIVE =
  'a, button, input, textarea, select, label, [contenteditable=""], [contenteditable="true"], [data-no-drag], [data-kanban-no-drag]'

/** Move one entry of an array; `to` is its index once it has left its old place. */
export function moveIndex<T>(items: T[], from: number, to: number): T[] {
  const next = [...items]
  const [item] = next.splice(from, 1)
  if (item === undefined) return items
  next.splice(to, 0, item)
  return next
}

/** Scroll speed for a pointer near (or past) the edges of a scroll area. */
export function edgeSpeed(pos: number, start: number, end: number) {
  if (end - start < EDGE * 2) return 0
  if (pos < start + EDGE) return -Math.min(20, (start + EDGE - pos) / 3 + 1)
  if (pos > end - EDGE) return Math.min(20, (pos - (end - EDGE)) / 3 + 1)
  return 0
}

/** Nearest ancestor (or the element itself) that scrolls along `axis`, else the page. */
export function scrollParent(el: Element | null, axis: 'x' | 'y'): Element | null {
  for (let node = el; node && node !== document.body; node = node.parentElement) {
    const style = getComputedStyle(node)
    const overflow = axis === 'y' ? style.overflowY : style.overflowX
    const scrolls =
      axis === 'y' ? node.scrollHeight > node.clientHeight : node.scrollWidth > node.clientWidth
    if (scrolls && /auto|scroll|overlay/.test(overflow)) return node
  }
  return document.scrollingElement
}

/** Scroll `el` when (x, y) is near its edges along `axis`. Returns true when it scrolled. */
export function scrollNearEdge(el: Element | null, x: number, y: number, axis: 'x' | 'y') {
  if (!el) return false
  const page = el === document.scrollingElement
  const rect = page
    ? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
    : el.getBoundingClientRect()
  if (axis === 'y') {
    if (el.scrollHeight <= el.clientHeight || x < rect.left || x > rect.right) return false
    const dy = edgeSpeed(y, rect.top, rect.bottom)
    if (!dy) return false
    const before = el.scrollTop
    el.scrollTop += dy
    return el.scrollTop !== before
  }
  if (el.scrollWidth <= el.clientWidth) return false
  const dx = edgeSpeed(x, rect.left, rect.right)
  if (!dx) return false
  const before = el.scrollLeft
  el.scrollLeft += dx
  return el.scrollLeft !== before
}

export function useSortableDrag<T, P>(options: SortableDragOptions<T, P>) {
  const optionsRef = React.useRef(options)
  const [drag, setDragState] = React.useState<SortableDragState<T, P> | null>(null)
  const dragRef = React.useRef<SortableDragState<T, P> | null>(null)
  const sessionRef = React.useRef<PointerSession<T, P> | null>(null)
  const rootRef = React.useRef<HTMLElement | null>(null)
  const overlayRef = React.useRef<HTMLDivElement | null>(null)
  // Callback refs, so components never read a ref object during render.
  const setRoot = React.useCallback((el: HTMLElement | null) => {
    rootRef.current = el
  }, [])
  const setOverlay = React.useCallback((el: HTMLDivElement | null) => {
    overlayRef.current = el
  }, [])
  const focusIdRef = React.useRef<string | null>(null)
  const suppressClickRef = React.useRef(false)
  const [announcement, setAnnouncement] = React.useState('')

  // Runs before the focus effect below, so it always sees this render's options.
  React.useEffect(() => {
    optionsRef.current = options
  })

  // Window listeners are stable (so they can be removed) and call the latest handlers.
  const handlers = React.useRef<Handlers | null>(null)
  const windowListeners = React.useMemo(() => {
    const move = (e: PointerEvent) => handlers.current?.onPointerMove(e)
    const up = (e: PointerEvent) => handlers.current?.onPointerUp(e)
    const cancel = () => handlers.current?.onPointerCancel()
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !sessionRef.current?.active) return
      e.preventDefault()
      handlers.current?.onPointerCancel()
    }
    // Once a touch drag is active, stop the page from scrolling under the finger.
    const touchmove = (e: TouchEvent) => {
      if (sessionRef.current?.active) e.preventDefault()
    }
    return {
      add() {
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', up)
        window.addEventListener('pointercancel', cancel)
        window.addEventListener('keydown', key, true)
        window.addEventListener('touchmove', touchmove, { passive: false })
      },
      remove() {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', cancel)
        window.removeEventListener('keydown', key, true)
        window.removeEventListener('touchmove', touchmove)
      },
    }
  }, [])

  React.useEffect(() => windowListeners.remove, [windowListeners])

  function endSession() {
    const s = sessionRef.current
    if (s) window.clearTimeout(s.timer)
    sessionRef.current = null
    windowListeners.remove()
  }

  const setDrag = (next: SortableDragState<T, P> | null) => {
    dragRef.current = next
    setDragState(next)
  }

  /* Dropping ----------------------------------------------------------------------------------- */
  function drop() {
    const d = dragRef.current
    if (!d) return
    const o = optionsRef.current
    setDrag(null)
    if (d.mode === 'keyboard') focusIdRef.current = d.id
    if (!o.samePosition(d.from, d.to)) o.onDrop(d)
    setAnnouncement(o.announce.dropped(d, d.to))
  }

  function cancel() {
    const d = dragRef.current
    if (!d) return
    setDrag(null)
    if (d.mode === 'keyboard') focusIdRef.current = d.id
    setAnnouncement(optionsRef.current.announce.cancelled(d))
  }

  /* Pointer ------------------------------------------------------------------------------------ */
  function updateTarget() {
    const s = sessionRef.current
    const d = dragRef.current
    if (!s || !d || d.mode !== 'pointer') return
    const o = optionsRef.current
    const root = rootRef.current
    const target = root ? o.targetAt(root, s.x, s.y, d) : null
    if (target === null) return
    const allowed = o.samePosition(target, d.from) || !o.isAllowed || o.isAllowed(d, target)
    const to = allowed ? target : d.from
    const blocked = allowed ? null : (o.blockedKey?.(target) ?? '')
    if (o.samePosition(to, d.to) && blocked === d.blocked) return
    if (!o.samePosition(to, d.to)) setAnnouncement(o.announce.moved(d, to))
    setDrag({ ...d, to, blocked })
  }

  // Where the overlay's `fixed; top: 0; left: 0` actually lands, and at what scale. (0, 0) and 1
  // in <body>; inside a portal container that is a containing block (transform, filter, contain…)
  // it is that container's corner — which moves when the container scrolls — and its scale.
  const overlayOriginRef = React.useRef<{ x: number; y: number; scale: number } | null>(null)

  function positionOverlay(remeasure = false) {
    const s = sessionRef.current
    const el = overlayRef.current
    if (!s || !el) return
    if (!overlayOriginRef.current || remeasure) {
      el.style.transform = 'none'
      const rect = el.getBoundingClientRect()
      const scale = el.offsetWidth > 0 && rect.width > 0 ? rect.width / el.offsetWidth : 1
      overlayOriginRef.current = { x: rect.left, y: rect.top, scale }
    }
    const { x, y, scale } = overlayOriginRef.current
    el.style.transform = `translate3d(${(s.x - s.offsetX - x) / scale}px, ${(s.y - s.offsetY - y) / scale}px, 0)`
  }

  function activate() {
    const s = sessionRef.current
    if (!s || s.active) return
    overlayOriginRef.current = null
    s.active = true
    window.clearTimeout(s.timer)
    const d: SortableDragState<T, P> = {
      item: s.item,
      id: s.id,
      mode: 'pointer',
      from: s.from,
      to: s.from,
      blocked: null,
      width: s.width,
      height: s.height,
    }
    setDrag(d)
    setAnnouncement(optionsRef.current.announce.pickedUp(d, s.from))
  }

  function onPointerMove(event: PointerEvent) {
    const s = sessionRef.current
    if (!s || event.pointerId !== s.pointerId) return
    s.x = event.clientX
    s.y = event.clientY
    if (!s.active) {
      const distance = Math.hypot(s.x - s.startX, s.y - s.startY)
      // A touch that moves before the hold delay is a scroll, not a drag.
      if (s.touch) {
        if (distance > TOUCH_TOLERANCE) endSession()
        return
      }
      if (distance < DRAG_DISTANCE) return
      activate()
    }
    positionOverlay()
    updateTarget()
  }

  function onPointerUp(event: PointerEvent) {
    const s = sessionRef.current
    if (!s || event.pointerId !== s.pointerId) return
    const wasActive = s.active
    endSession()
    if (!wasActive) return
    // The click that follows a drag must not activate the item.
    suppressClickRef.current = true
    window.setTimeout(() => (suppressClickRef.current = false))
    drop()
  }

  function onPointerCancel() {
    const wasActive = sessionRef.current?.active
    endSession()
    if (wasActive) cancel()
  }

  /** Call from an item's (or handle's) `onPointerDown`. */
  function onItemPointerDown(event: React.PointerEvent, start: SortableDragStart<T, P>) {
    const o = optionsRef.current
    if (o.disabled || event.button !== 0 || dragRef.current || sessionRef.current) return
    const interactive = (event.target as Element).closest(INTERACTIVE)
    if (
      interactive &&
      interactive !== event.currentTarget &&
      event.currentTarget.contains(interactive)
    )
      return
    const source = start.element ?? event.currentTarget
    const rect = source.getBoundingClientRect()
    // Layout size, not the on-screen one: inside a scaled container the preview is scaled too.
    const size = source instanceof HTMLElement && source.offsetWidth > 0 ? source : null
    const touch = event.pointerType === 'touch' && !start.touchImmediate
    sessionRef.current = {
      item: start.item,
      id: start.id,
      from: start.from,
      pointerId: event.pointerId,
      touch,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: size ? size.offsetWidth : rect.width,
      height: size ? size.offsetHeight : rect.height,
      active: false,
      timer: touch ? window.setTimeout(activate, TOUCH_DELAY) : 0,
    }
    windowListeners.add()
  }

  React.useEffect(() => {
    handlers.current = {
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      updateTarget,
      positionOverlay,
      cancel,
    }
  })

  const pointerDragging = drag?.mode === 'pointer'

  // Place the overlay under the pointer as soon as it mounts.
  React.useLayoutEffect(() => {
    if (pointerDragging) handlers.current?.positionOverlay()
  }, [pointerDragging])

  React.useEffect(() => {
    if (!pointerDragging) return
    const body = document.body
    const previous = { cursor: body.style.cursor, userSelect: body.style.userSelect }
    body.style.cursor = 'grabbing'
    body.style.userSelect = 'none'
    // Auto-scroll, the wheel or a moving container shift where the overlay's origin is.
    const onScroll = () => handlers.current?.positionOverlay(true)
    window.addEventListener('scroll', onScroll, true)
    let frame = 0
    const tick = () => {
      const s = sessionRef.current
      const root = rootRef.current
      if (s && root && optionsRef.current.autoScroll?.(root, s.x, s.y)) {
        handlers.current?.updateTarget()
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      cancelAnimationFrame(frame)
      body.style.cursor = previous.cursor
      body.style.userSelect = previous.userSelect
    }
  }, [pointerDragging])

  /* Keyboard ----------------------------------------------------------------------------------- */
  const keyboardDragging = drag?.mode === 'keyboard'

  // A keyboard drag ends if the user clicks elsewhere.
  React.useEffect(() => {
    if (!keyboardDragging) return
    const onPointerDown = () => handlers.current?.cancel()
    // Escape cancels the move; keep it from also closing a surrounding Dialog/Popover (Radix skips
    // default-prevented events). The item's own keydown handler still sees it.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault()
    }
    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [keyboardDragging])

  // Keep focus on an item after a keyboard move (it may have moved or remounted).
  React.useEffect(() => {
    const id = focusIdRef.current
    if (!id) return
    focusIdRef.current = null
    if (rootRef.current) optionsRef.current.focusItem(rootRef.current, id)
  })

  /** Pick an item up with the keyboard. */
  function pickUp(item: T, id: string, from: P) {
    const o = optionsRef.current
    if (o.disabled || dragRef.current) return
    const lifted: SortableDragState<T, P> = {
      item,
      id,
      mode: 'keyboard',
      from,
      to: from,
      blocked: null,
      width: 0,
      height: 0,
    }
    setDrag(lifted)
    setAnnouncement(o.announce.pickedUp(lifted, from))
  }

  /** Move the keyboard-lifted item. Returns false when the move is refused. */
  function moveTo(to: P) {
    const d = dragRef.current
    if (!d || d.mode !== 'keyboard') return false
    const o = optionsRef.current
    if (!o.samePosition(to, d.from) && o.isAllowed && !o.isAllowed(d, to)) return false
    focusIdRef.current = d.id
    setDrag({ ...d, to })
    setAnnouncement(o.announce.moved(d, to))
    return true
  }

  return {
    drag,
    pointerDragging,
    keyboardDragging,
    announcement,
    /** Pass as `ref` to the element that contains the items. */
    attachRoot: setRoot,
    /** Pass as `ref` to the floating copy that follows the pointer. */
    attachOverlay: setOverlay,
    /** The element passed to `attachRoot`, for event handlers. */
    getRoot: () => rootRef.current,
    /** The current drag, readable in event handlers before a re-render. */
    getDrag: () => dragRef.current,
    /** True right after a pointer drag, so the click that follows can be ignored. */
    clickSuppressed: () => suppressClickRef.current,
    /** True while a touch press may become a drag (block the long-press context menu). */
    touchPending: () => Boolean(sessionRef.current?.touch),
    onItemPointerDown,
    pickUp,
    moveTo,
    drop,
    cancel,
  }
}
