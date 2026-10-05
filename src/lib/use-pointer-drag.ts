import * as React from 'react'

export interface PointerDragInfo {
  clientX: number
  clientY: number
  /** Movement since the previous event. */
  deltaX: number
  deltaY: number
  /** Element bounds when the drag started. */
  rect: DOMRect
  shiftKey: boolean
  altKey: boolean
}

export interface PointerDragOptions {
  /** Called when the drag starts (after `threshold`). */
  onStart?: (info: PointerDragInfo) => void
  onMove?: (info: PointerDragInfo) => void
  /** `cancelled` is true for Escape or a lost pointer. */
  onEnd?: (info: PointerDragInfo, cancelled: boolean) => void
  /** Pointer released without passing `threshold` — a click. */
  onClick?: () => void
  /** Pixels to move before a press counts as a drag. @default 0 */
  threshold?: number
  disabled?: boolean
}

/** Step multiplier for fine/coarse dragging: Shift ×10, Alt ×0.1. */
export function dragStepFactor(event: { shiftKey: boolean; altKey: boolean }) {
  return event.shiftKey ? 10 : event.altKey ? 0.1 : 1
}

/**
 * Pointer dragging on one element with pointer capture: movement deltas, modifier keys, a click
 * threshold and Escape to cancel. Spread `onPointerDown` on the element.
 */
export function usePointerDrag(options: PointerDragOptions) {
  const latest = React.useRef(options)
  React.useEffect(() => {
    latest.current = options
  })
  const [dragging, setDragging] = React.useState(false)
  const cleanup = React.useRef<(() => void) | null>(null)

  React.useEffect(() => () => cleanup.current?.(), [])

  const onPointerDown = React.useCallback((event: React.PointerEvent<HTMLElement>) => {
    const opts = latest.current
    if (opts.disabled || event.button !== 0 || cleanup.current) return
    const el = event.currentTarget
    const rect = el.getBoundingClientRect()
    const pointerId = event.pointerId
    const threshold = opts.threshold ?? 0
    const startX = event.clientX
    const startY = event.clientY
    let lastX = startX
    let lastY = startY
    let started = false

    const info = (e: { clientX: number; clientY: number; shiftKey: boolean; altKey: boolean }) => {
      const result: PointerDragInfo = {
        clientX: e.clientX,
        clientY: e.clientY,
        deltaX: e.clientX - lastX,
        deltaY: e.clientY - lastY,
        rect,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
      }
      lastX = e.clientX
      lastY = e.clientY
      return result
    }

    const begin = () => {
      started = true
      setDragging(true)
      latest.current.onStart?.({
        clientX: startX,
        clientY: startY,
        deltaX: 0,
        deltaY: 0,
        rect,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
      })
    }

    const finish = (e: PointerEvent | null, cancelled: boolean) => {
      cleanup.current?.()
      if (!started) {
        if (!cancelled) latest.current.onClick?.()
        return
      }
      setDragging(false)
      latest.current.onEnd?.(
        info(e ?? { clientX: lastX, clientY: lastY, shiftKey: false, altKey: false }),
        cancelled,
      )
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      if (!started) {
        if (Math.hypot(e.clientX - startX, e.clientY - startY) < threshold) return
        // The distance moved before the threshold still counts.
        begin()
      }
      latest.current.onMove?.(info(e))
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerId === pointerId) finish(e, false)
    }
    const onCancel = () => finish(null, true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !started) return
      e.preventDefault()
      e.stopPropagation()
      finish(null, true)
    }

    try {
      el.setPointerCapture(pointerId)
    } catch {
      // Not an active pointer (synthetic events) — dragging still works over the element.
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onCancel)
    el.addEventListener('lostpointercapture', onCancel)
    window.addEventListener('keydown', onKey, true)
    cleanup.current = () => {
      cleanup.current = null
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onCancel)
      el.removeEventListener('lostpointercapture', onCancel)
      window.removeEventListener('keydown', onKey, true)
      try {
        if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId)
      } catch {
        // Already released.
      }
    }

    if (threshold <= 0) begin()
  }, [])

  return { onPointerDown, dragging }
}
