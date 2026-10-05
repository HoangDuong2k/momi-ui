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

  const clearAllButton = showClearAll && (
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
  )

  return (
    <ToastPrimitive.Provider
      duration={duration}
      swipeDirection={swipeDirections[position]}
      label={t.region}
    >
      {rendered.map((item) => (
        <ToastItem key={item.id} item={item} closeButton={closeButton} />
      ))}
      <div
        data-slot="toaster"
        className={cn(
          'pointer-events-none fixed z-[100] flex max-h-dvh w-full flex-col gap-2 p-4 sm:max-w-sm',
          positionClasses[position],
          className,
        )}
      >
        {!isTop && clearAllButton}
        <ToastPrimitive.Viewport
          data-slot="toast-viewport"
          className={cn(
            'pointer-events-none flex w-full gap-2 outline-none',
            isTop ? 'flex-col-reverse' : 'flex-col',
          )}
        />
        {isTop && clearAllButton}
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

function ToastItem({ item, closeButton }: { item: ToastRecord; closeButton: boolean }) {
  const t = useMessages('common')
  const tone = item.tone ?? 'neutral'
  const icon =
    tone === 'loading' ? (
      <Spinner size="sm" aria-hidden role={undefined} aria-label={undefined} />
    ) : tone === 'neutral' ? null : (
      toneIcons[tone]
    )

  return (
    <ToastPrimitive.Root
      data-slot="toast"
      data-tone={tone}
      open={item.open}
      onOpenChange={(open) => {
        if (!open) dismiss(item.id)
      }}
      duration={tone === 'loading' ? Infinity : item.duration}
      className={cn(
        'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border border-border-strong bg-surface-raised p-4 text-popover-foreground shadow-lg',
        closeButton && 'pe-10',
        'data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in',
        'data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=move]:translate-y-(--radix-toast-swipe-move-y)',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:translate-y-0 data-[swipe=cancel]:transition-[translate]',
        'data-[swipe=end]:animate-swipe-out',
      )}
    >
      {icon && <span className="mt-px flex shrink-0 [&_svg]:size-4">{icon}</span>}
      <div className="grid min-w-0 flex-1 gap-1">
        <ToastPrimitive.Title className="text-sm leading-5 font-medium">
          {item.title}
        </ToastPrimitive.Title>
        {item.description && (
          <ToastPrimitive.Description className="text-[0.8125rem] text-muted-foreground">
            {item.description}
          </ToastPrimitive.Description>
        )}
      </div>
      {item.action && (
        <ToastPrimitive.Action altText={item.action.label} asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-7 shrink-0 px-2.5 text-xs"
            onClick={item.action.onClick}
          >
            {item.action.label}
          </Button>
        </ToastPrimitive.Action>
      )}
      {closeButton && (
        <ToastPrimitive.Close
          aria-label={t.close}
          className="absolute end-2.5 top-2.5 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity outline-none group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <XIcon className="size-3.5" />
        </ToastPrimitive.Close>
      )}
    </ToastPrimitive.Root>
  )
}
