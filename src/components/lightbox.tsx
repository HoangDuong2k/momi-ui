import { Dialog as DialogPrimitive } from 'radix-ui'
import * as React from 'react'
import { useMessages } from '../i18n/locale-provider'
import type { MomiMessages } from '../i18n/messages'
import { cn } from '../lib/cn'
import { usePortalContainer } from './portal-provider'
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from '../lib/icons'
import { useControllableState } from '../lib/use-controllable-state'

export interface LightboxItem {
  /** Image URL, or the video URL when `type` is `'video'`. */
  src: string
  /** @default 'image' */
  type?: 'image' | 'video'
  /** Video only: extra sources, e.g. webm then mp4. Replaces `src` when given. */
  sources?: Array<{ src: string; type?: string }>
  /** Video only: image shown before playback. */
  poster?: string
  alt?: string
  caption?: React.ReactNode
}

export interface LightboxProps {
  items: LightboxItem[]
  /**
   * Index of the open item, or `null` when closed. One value for "open" and "which item",
   * so a grid can open it with `onClick={() => setIndex(i)}`.
   */
  index?: number | null
  defaultIndex?: number | null
  onIndexChange?: (index: number | null) => void
  /** Go from the last item back to the first (and the other way). @default false */
  loop?: boolean
  /** Override built-in text for this instance. */
  labels?: Partial<MomiMessages['lightbox']>
  /** Mount it here instead of `PortalProvider`'s container (or `document.body`). */
  container?: Element | DocumentFragment | null
  className?: string
}

const SWIPE_DISTANCE = 60

const controlClass =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/10 backdrop-blur-md transition-[background-color,opacity] outline-none hover:bg-white/20 focus-visible:ring-[3px] focus-visible:ring-white/60 aria-disabled:cursor-default aria-disabled:opacity-0'

/** Pauses when the viewer closes or moves on (the element unmounts). */
function LightboxVideo({
  item,
  active,
  ...props
}: { item: LightboxItem; active: boolean } & React.ComponentProps<'video'>) {
  const ref = React.useRef<HTMLVideoElement>(null)
  React.useEffect(() => {
    const video = ref.current
    if (!active) video?.pause()
    return () => video?.pause()
  }, [active])
  return (
    <video
      ref={ref}
      controls
      autoPlay
      playsInline
      poster={item.poster}
      aria-label={item.alt}
      {...props}
    >
      {(item.sources ?? [{ src: item.src }]).map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
    </video>
  )
}

/** Full-screen viewer for images and videos: arrows, swipe, captions, Esc to close. */
export function Lightbox({
  items,
  index: indexProp,
  defaultIndex = null,
  onIndexChange,
  loop = false,
  labels,
  container,
  className,
}: LightboxProps) {
  const t = useMessages('lightbox', labels)
  const portalContainer = usePortalContainer(container)
  const common = useMessages('common')
  const [index, setIndex] = useControllableState<number | null>({
    value: indexProp,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  })
  const open = index !== null && index >= 0 && index < items.length

  // Keep showing the last item while the viewer animates closed.
  const [shown, setShown] = React.useState(open ? index : 0)
  if (open && index !== shown) setShown(index)

  const total = items.length
  const item = items[shown]
  const canPrev = loop ? total > 1 : shown > 0
  const canNext = loop ? total > 1 : shown < total - 1

  const go = (delta: number) => {
    if (!open) return
    const next = shown + delta
    if (next >= 0 && next < total) setIndex(next)
    else if (loop && total > 1) setIndex((next + total) % total)
  }

  // Warm the cache for the neighbors.
  React.useEffect(() => {
    if (!open) return
    for (const neighbor of [items[shown - 1], items[shown + 1]]) {
      if (neighbor && neighbor.type !== 'video') new Image().src = neighbor.src
    }
  }, [open, shown, items])

  /* Swipe ---------------------------------------------------------------------------------------- */
  const swipeRef = React.useRef<{
    id: number
    x: number
    y: number
    moved: boolean
    /** Started on the empty area around the media. */
    backdrop: boolean
  } | null>(null)
  const [dragX, setDragX] = React.useState(0)
  const isRtl = (el: Element) => getComputedStyle(el).direction === 'rtl'

  function onStagePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as Element).closest('button, video')) return
    swipeRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      backdrop: event.target === event.currentTarget,
    }
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // The swipe still works while the pointer stays over the stage.
    }
  }

  function onStagePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const swipe = swipeRef.current
    if (!swipe || swipe.id !== event.pointerId) return
    const dx = event.clientX - swipe.x
    const dy = event.clientY - swipe.y
    if (Math.abs(dx) < 4 || Math.abs(dy) > Math.abs(dx)) return
    swipe.moved = true
    setDragX(dx)
  }

  function onStagePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const swipe = swipeRef.current
    if (!swipe || swipe.id !== event.pointerId) return
    swipeRef.current = null
    const dx = event.clientX - swipe.x
    setDragX(0)
    if (swipe.moved && Math.abs(dx) > SWIPE_DISTANCE) {
      const forward = dx < 0 !== isRtl(event.currentTarget)
      go(forward ? 1 : -1)
    } else if (!swipe.moved && swipe.backdrop) {
      // A tap on the empty area around the media closes the viewer.
      setIndex(null)
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented || (event.target as Element).closest('video, input')) return
    const rtl = isRtl(event.currentTarget)
    if (event.key === 'ArrowRight') go(rtl ? -1 : 1)
    else if (event.key === 'ArrowLeft') go(rtl ? 1 : -1)
    else if (event.key === 'Home') setIndex(0)
    else if (event.key === 'End') setIndex(total - 1)
    else return
    event.preventDefault()
  }

  const mediaClass =
    'max-h-full max-w-full rounded-md object-contain shadow-2xl select-none motion-safe:animate-fade-in'
  const mediaStyle: React.CSSProperties | undefined = dragX
    ? { translate: `${dragX}px 0`, opacity: Math.max(0.4, 1 - Math.abs(dragX) / 600) }
    : undefined

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && setIndex(null)}>
      <DialogPrimitive.Portal container={portalContainer}>
        <DialogPrimitive.Overlay
          data-slot="lightbox-overlay"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in"
        />
        <DialogPrimitive.Content
          data-slot="lightbox"
          onKeyDown={onKeyDown}
          className={cn(
            'fixed inset-0 z-50 flex flex-col text-white outline-none data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in',
            className,
          )}
        >
          <DialogPrimitive.Title className="sr-only">{t.title}</DialogPrimitive.Title>
          <div className="flex h-14 shrink-0 items-center justify-between gap-4 px-3 sm:px-4">
            <span
              aria-hidden
              data-slot="lightbox-counter"
              className="ps-2 font-mono text-sm text-white/70 tabular-nums"
            >
              {total > 1 && t.counter(shown + 1, total)}
            </span>
            <DialogPrimitive.Close aria-label={common.close} className={controlClass}>
              <XIcon className="size-4.5" />
            </DialogPrimitive.Close>
          </div>

          <div
            data-slot="lightbox-stage"
            onPointerDown={onStagePointerDown}
            onPointerMove={onStagePointerMove}
            onPointerUp={onStagePointerUp}
            onPointerCancel={() => {
              swipeRef.current = null
              setDragX(0)
            }}
            className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-3 sm:px-20"
          >
            {item &&
              (item.type === 'video' ? (
                <LightboxVideo
                  key={shown}
                  item={item}
                  active={open}
                  className={mediaClass}
                  style={mediaStyle}
                />
              ) : (
                <img
                  key={shown}
                  src={item.src}
                  alt={item.alt ?? ''}
                  draggable={false}
                  className={mediaClass}
                  style={mediaStyle}
                />
              ))}
            {total > 1 && (
              <>
                <button
                  type="button"
                  aria-label={t.previous}
                  // aria-disabled, not disabled: a focused button that becomes disabled drops focus
                  // to <body>, and the viewer's arrow keys stop working.
                  aria-disabled={!canPrev || undefined}
                  onClick={() => canPrev && go(-1)}
                  className={cn(controlClass, 'absolute start-2 sm:start-4')}
                >
                  <ChevronLeftIcon className="size-5 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  aria-label={t.next}
                  aria-disabled={!canNext || undefined}
                  onClick={() => canNext && go(1)}
                  className={cn(controlClass, 'absolute end-2 sm:end-4')}
                >
                  <ChevronRightIcon className="size-5 rtl:rotate-180" />
                </button>
              </>
            )}
          </div>

          <div className="flex min-h-16 shrink-0 items-center justify-center px-6 pt-3 pb-6">
            <DialogPrimitive.Description
              aria-live="polite"
              className="max-w-2xl flex-1 text-center text-sm text-pretty text-white/80"
            >
              <span className="sr-only">{t.position(shown + 1, total)}.</span> {item?.caption}
            </DialogPrimitive.Description>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
