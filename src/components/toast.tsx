import { Toast as ToastPrimitive } from 'radix-ui'
import * as React from 'react'
import { useMessages } from '../i18n/locale-provider'
import type { MomiMessages } from '../i18n/messages'
import { cn } from '../lib/cn'
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, XIcon } from '../lib/icons'
import { Button } from './button'
import { Spinner } from './spinner'

/* -------------------------------------------------------------------------------------------------
 * Store
 * -----------------------------------------------------------------------------------------------*/

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'loading'

export interface ToastOptions {
  /** Reuse an id to update an existing toast in place. */
  id?: string
  description?: React.ReactNode
  /** @default 'neutral' */
  tone?: ToastTone
  /** Milliseconds before auto-dismiss. `Infinity` keeps it open. Loading toasts never auto-dismiss. */
  duration?: number
  action?: { label: string; onClick: () => void }
  /** Called once the toast is dismissed (by timeout, swipe, close button or code). */
  onDismiss?: () => void
}

export interface ToastRecord extends ToastOptions {
  id: string
  title: React.ReactNode
  open: boolean
}

type Listener = () => void

let records: ToastRecord[] = []
let counter = 0
const listeners = new Set<Listener>()
const EXIT_MS = 300

function emit() {
  for (const listener of listeners) listener()
}

function setRecords(next: ToastRecord[]) {
  records = next
  emit()
}

function upsert(title: React.ReactNode, options: ToastOptions = {}): string {
  const id = options.id ?? `toast-${++counter}`
  const existing = records.find((r) => r.id === id)
  if (existing) {
    setRecords(records.map((r) => (r.id === id ? { ...r, ...options, id, title, open: true } : r)))
  } else {
    setRecords([...records, { ...options, id, title, open: true }])
  }
  return id
}

function dismiss(id?: string) {
  const targets = records.filter((r) => r.open && (id === undefined || r.id === id))
  if (targets.length === 0) return
  setRecords(records.map((r) => (targets.includes(r) ? { ...r, open: false } : r)))
  for (const t of targets) t.onDismiss?.()
  // Remove after the exit animation has played.
  window.setTimeout(() => {
    setRecords(records.filter((r) => !targets.some((t) => t.id === r.id) || r.open))
  }, EXIT_MS)
}

type ToastFn = (title: React.ReactNode, options?: ToastOptions) => string

interface PromiseMessages<T> {
  loading: React.ReactNode
  success: React.ReactNode | ((value: T) => React.ReactNode)
  error: React.ReactNode | ((error: unknown) => React.ReactNode)
}

/**
 * Show a toast from anywhere: `toast('Saved')`, `toast.success('Done')`, `toast.promise(save(), {...})`.
 * Requires a single `<Toaster />` mounted in the app.
 */
export const toast = Object.assign(((title, options) => upsert(title, options)) as ToastFn, {
  success: ((title, options) => upsert(title, { ...options, tone: 'success' })) as ToastFn,
  error: ((title, options) => upsert(title, { ...options, tone: 'danger' })) as ToastFn,
  warning: ((title, options) => upsert(title, { ...options, tone: 'warning' })) as ToastFn,
  info: ((title, options) => upsert(title, { ...options, tone: 'info' })) as ToastFn,
  loading: ((title, options) => upsert(title, { ...options, tone: 'loading' })) as ToastFn,
  dismiss,
  promise<T>(promise: Promise<T>, messages: PromiseMessages<T>, options?: ToastOptions) {
    const id = upsert(messages.loading, { ...options, tone: 'loading' })
    promise.then(
      (value) => {
        const title =
          typeof messages.success === 'function' ? messages.success(value) : messages.success
        upsert(title, { ...options, id, tone: 'success' })
      },
      (error: unknown) => {
        const title = typeof messages.error === 'function' ? messages.error(error) : messages.error
        upsert(title, { ...options, id, tone: 'danger' })
      },
    )
    return promise
  },
})

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => records
const getServerSnapshot = () => [] as ToastRecord[]

/* -------------------------------------------------------------------------------------------------
 * Toaster
 * -----------------------------------------------------------------------------------------------*/

type ToastPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

/** Placement of the fixed region (toast stack + "Clear all" button). */
const positionClasses: Record<ToastPosition, string> = {
  'top-left': 'top-0 start-0 items-start [--momi-pop-y:-12px]',
  'top-center': 'top-0 inset-x-0 mx-auto items-center [--momi-pop-y:-12px]',
  'top-right': 'top-0 end-0 items-end [--momi-pop-y:-12px]',
  'bottom-left': 'bottom-0 start-0 items-start [--momi-pop-y:12px]',
  'bottom-center': 'bottom-0 inset-x-0 mx-auto items-center [--momi-pop-y:12px]',
  'bottom-right': 'bottom-0 end-0 items-end [--momi-pop-y:12px]',
}

/** Side the "Clear all" pill lines up with. */
const clearAllAlign: Record<ToastPosition, string> = {
  'top-left': 'self-start',
  'top-center': 'self-center',
  'top-right': 'self-end',
  'bottom-left': 'self-start',
  'bottom-center': 'self-center',
  'bottom-right': 'self-end',
}

const swipeDirections: Record<ToastPosition, 'up' | 'down' | 'left' | 'right'> = {
  'top-left': 'left',
  'top-center': 'up',
  'top-right': 'right',
  'bottom-left': 'left',
  'bottom-center': 'down',
  'bottom-right': 'right',
}

export interface ToasterProps {
  /** @default 'bottom-right' */
  position?: ToastPosition
  /** Default auto-dismiss time in ms. @default 4000 */
  duration?: number
  /** Max toasts visible at once. @default 4 */
  visibleToasts?: number
  /** Show a close button on hover. @default true */
  closeButton?: boolean
  /**
   * Show a "Clear all" button once at least this many toasts are open. `false` hides it.
   * @default 2
   */
  clearAll?: number | false
  /** @default messages.toast.clearAll ('Clear all') */
  clearAllLabel?: string
  /** Override built-in text for this instance. */
  labels?: Partial<MomiMessages['toast']>
  className?: string
}

/** Renders toasts created with `toast()`. Mount once, near the root of your app. */
export function Toaster({
  position = 'bottom-right',
  duration = 4000,
  visibleToasts = 4,
  closeButton = true,
  clearAll = 2,
  clearAllLabel,
  labels,
  className,
}: ToasterProps) {
  const t = useMessages('toast', labels)
  const items = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const open = items.filter((t) => t.open)
  // Keep the newest `visibleToasts` open toasts, plus any that are still animating out.
  const visibleIds = new Set(open.slice(-visibleToasts).map((t) => t.id))
  const rendered = items.filter((t) => !t.open || visibleIds.has(t.id))
  const isTop = position.startsWith('top')
  const showClearAll = clearAll !== false && open.length >= Math.max(clearAll, 1)
  const viewportRef = React.useRef<HTMLOListElement>(null)

  // Timers pause while the pointer is over the toasts, focus is inside them or the window is
  // in the background.
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [windowBlurred, setWindowBlurred] = React.useState(false)
  React.useEffect(() => {
    const onBlur = () => setWindowBlurred(true)
    const onFocus = () => setWindowBlurred(false)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  // Escape closes the toast that has focus — and only it: preventing the event here (window,
  // capture phase) keeps a dialog or menu that is open at the same time from closing too.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !(event.target instanceof Element)) return
      const toastElement = event.target.closest<HTMLElement>('[data-toast-id]')
      if (!toastElement || !viewportRef.current?.contains(toastElement)) return
      event.preventDefault()
      dismiss(toastElement.dataset.toastId)
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])

  // Inside the viewport (a dismissable-layer branch), so it works over an open dialog. It is the
  // first item: above the stack at the bottom, below it at the top (the list is reversed there).
  const clearAllButton = showClearAll && (
    <li
      role="none"
      className={cn('flex', clearAllAlign[position])}
      style={{ pointerEvents: 'auto' }}
    >
      <button
        type="button"
        data-slot="toast-clear-all"
        onClick={() => dismiss()}
        aria-label={
          clearAllLabel ? `${clearAllLabel} (${open.length})` : t.clearAllLabel(open.length)
        }
        className={cn(
          'pointer-events-auto inline-flex h-7 shrink-0 animate-fade-in items-center gap-1.5 rounded-full border border-border-strong bg-surface-raised px-3',
          'text-xs font-medium text-muted-foreground shadow-md transition-colors outline-none',
          'hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40',
        )}
      >
        <XIcon className="size-3" />
        {clearAllLabel ?? t.clearAll}
        <span className="text-muted-foreground/70 tabular-nums">{open.length}</span>
      </button>
    </li>
  )

  return (
    // Radix's Provider + Viewport give the region its F8 hotkey and make it a dismissable-layer
    // *branch*: pressing a toast doesn't dismiss the dialog or menu behind it. The toasts
    // themselves are not Radix toasts, which would each be a dismissable *layer* and take
    // Escape away from that dialog or menu whenever a notification is showing.
    <ToastPrimitive.Provider label={t.region}>
      <div
        data-slot="toaster"
        className={cn(
          'pointer-events-none fixed z-[100] flex max-h-full w-full flex-col gap-2 p-4 sm:max-w-sm',
          // Radix's region wrapper around the list would otherwise shrink to its content.
          '[&>[role=region]]:w-full',
          positionClasses[position],
          className,
        )}
      >
        <ToastPrimitive.Viewport
          ref={viewportRef}
          data-slot="toast-viewport"
          aria-live="polite"
          aria-relevant="additions text"
          onPointerMove={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false)
          }}
          className={cn(
            'pointer-events-none flex w-full gap-2 outline-none',
            isTop ? 'flex-col-reverse' : 'flex-col',
          )}
        >
          {clearAllButton}
          {rendered.map((item) => (
            <ToastItem
              key={item.id}
              item={item}
              closeButton={closeButton}
              defaultDuration={duration}
              swipeDirection={swipeDirections[position]}
              paused={hovered || focused || windowBlurred}
            />
          ))}
        </ToastPrimitive.Viewport>
      </div>
    </ToastPrimitive.Provider>
  )
}

const toneIcons: Record<Exclude<ToastTone, 'neutral' | 'loading'>, React.ReactNode> = {
  success: <CircleCheckIcon className="text-success" />,
  warning: <TriangleAlertIcon className="text-warning" />,
  danger: <CircleAlertIcon className="text-destructive" />,
  info: <InfoIcon className="text-info" />,
}

/** Distance (px) a toast must be swiped to dismiss it. */
const SWIPE_THRESHOLD = 50

type SwipeDirection = 'up' | 'down' | 'left' | 'right'
type SwipeState = 'move' | 'cancel' | 'end'

function ToastItem({
  item,
  closeButton,
  defaultDuration,
  swipeDirection,
  paused,
}: {
  item: ToastRecord
  closeButton: boolean
  defaultDuration: number
  swipeDirection: SwipeDirection
  paused: boolean
}) {
  const t = useMessages('common')
  const tone = item.tone ?? 'neutral'
  const icon =
    tone === 'loading' ? (
      <Spinner size="sm" aria-hidden role={undefined} aria-label={undefined} />
    ) : tone === 'neutral' ? null : (
      toneIcons[tone]
    )

  /* Auto-dismiss: restarts when the toast is updated (same id), keeps the remaining time while
     paused. Loading toasts stay until they change. */
  const duration = tone === 'loading' ? Infinity : (item.duration ?? defaultDuration)
  const remainingRef = React.useRef(duration)
  React.useEffect(() => {
    remainingRef.current = duration
  }, [item, duration])
  React.useEffect(() => {
    if (!item.open || paused || !Number.isFinite(duration)) return
    const startedAt = Date.now()
    const timer = window.setTimeout(() => dismiss(item.id), remainingRef.current)
    return () => {
      window.clearTimeout(timer)
      remainingRef.current -= Date.now() - startedAt
    }
  }, [item, paused, duration])

  /* Swipe to dismiss, towards the edge the toasts sit on. */
  const [swipe, setSwipe] = React.useState<SwipeState | null>(null)
  const swipeRef = React.useRef<{
    x: number
    y: number
    dx: number
    dy: number
    on: boolean
  } | null>(null)
  const suppressClickRef = React.useRef(false)
  const horizontal = swipeDirection === 'left' || swipeDirection === 'right'
  const sign = swipeDirection === 'left' || swipeDirection === 'up' ? -1 : 1

  function onPointerDown(event: React.PointerEvent<HTMLLIElement>) {
    if (event.button !== 0 || !item.open) return
    swipeRef.current = { x: event.clientX, y: event.clientY, dx: 0, dy: 0, on: false }
  }

  function onPointerMove(event: React.PointerEvent<HTMLLIElement>) {
    const s = swipeRef.current
    if (!s) return
    // Only movement towards the edge counts; the other axis is ignored.
    const raw = horizontal ? event.clientX - s.x : event.clientY - s.y
    const delta = sign > 0 ? Math.max(0, raw) : Math.min(0, raw)
    if (!s.on) {
      if (Math.abs(delta) < 6) return
      s.on = true
      event.currentTarget.setPointerCapture?.(event.pointerId)
      setSwipe('move')
    }
    s.dx = horizontal ? delta : 0
    s.dy = horizontal ? 0 : delta
    event.currentTarget.style.setProperty('--momi-swipe-x', `${s.dx}px`)
    event.currentTarget.style.setProperty('--momi-swipe-y', `${s.dy}px`)
  }

  function onPointerEnd(event: React.PointerEvent<HTMLLIElement>, cancelled = false) {
    const s = swipeRef.current
    swipeRef.current = null
    if (!s?.on) return
    const el = event.currentTarget
    suppressClickRef.current = true
    window.setTimeout(() => (suppressClickRef.current = false))
    if (!cancelled && Math.abs(s.dx + s.dy) >= SWIPE_THRESHOLD) {
      el.style.setProperty('--momi-swipe-end-x', `${s.dx}px`)
      el.style.setProperty('--momi-swipe-end-y', `${s.dy}px`)
      setSwipe('end')
      dismiss(item.id)
    } else {
      el.style.removeProperty('--momi-swipe-x')
      el.style.removeProperty('--momi-swipe-y')
      setSwipe('cancel')
    }
  }

  return (
    <li
      data-slot="toast"
      data-toast-id={item.id}
      data-tone={tone}
      data-state={item.open ? 'open' : 'closed'}
      data-swipe={swipe ?? undefined}
      data-swipe-direction={swipeDirection}
      role={tone === 'danger' ? 'alert' : 'status'}
      aria-atomic
      tabIndex={0}
      // A modal dialog sets `pointer-events: none` on <body>; toasts must stay pressable.
      style={{ pointerEvents: 'auto' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => onPointerEnd(e)}
      onPointerCancel={(e) => onPointerEnd(e, true)}
      onClickCapture={(e) => {
        // The click that ends a swipe must not press a button inside the toast.
        if (!suppressClickRef.current) return
        e.preventDefault()
        e.stopPropagation()
      }}
      className={cn(
        'group pointer-events-auto relative flex w-full touch-none items-start gap-3 overflow-hidden rounded-xl border border-border-strong bg-surface-raised p-4 text-popover-foreground shadow-lg outline-none select-none',
        'focus-visible:ring-[3px] focus-visible:ring-ring/40',
        closeButton && 'pe-10',
        'data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in',
        'data-[swipe=move]:translate-x-(--momi-swipe-x) data-[swipe=move]:translate-y-(--momi-swipe-y)',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:translate-y-0 data-[swipe=cancel]:transition-[translate]',
        'data-[swipe=end]:data-[state=closed]:animate-swipe-out',
      )}
    >
      {icon && <span className="mt-px flex shrink-0 [&_svg]:size-4">{icon}</span>}
      <div className="grid min-w-0 flex-1 gap-1">
        <div data-slot="toast-title" className="text-sm leading-5 font-medium">
          {item.title}
        </div>
        {item.description && (
          <div data-slot="toast-description" className="text-[0.8125rem] text-muted-foreground">
            {item.description}
          </div>
        )}
      </div>
      {item.action && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 shrink-0 px-2.5 text-xs"
          onClick={() => {
            item.action?.onClick()
            dismiss(item.id)
          }}
        >
          {item.action.label}
        </Button>
      )}
      {closeButton && (
        <button
          type="button"
          aria-label={t.close}
          onClick={() => dismiss(item.id)}
          className="absolute end-2.5 top-2.5 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity outline-none group-focus-within:opacity-100 group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </li>
  )
}
