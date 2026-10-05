import * as React from 'react'
import { useMessages } from '../i18n/locale-provider'
import type { MomiMessages } from '../i18n/messages'
import { cn } from '../lib/cn'
import { mergeRefs } from '../lib/merge-refs'
import { AspectRatio } from '../components/aspect-ratio'

export interface VideoSource {
  src: string
  /** MIME type, e.g. `video/webm`. Inferred from the extension when omitted. */
  type?: string
}

export interface VideoPlayerProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** List webm first, then mp4: the browser plays the first one it supports. */
  sources: VideoSource[]
  /** Image shown before the video loads, and instead of it with reduced motion. */
  poster?: string
  /** Width / height. @default 16 / 9 */
  ratio?: number
  /** Play muted and looped while in view, pause when scrolled away. @default true */
  autoPlay?: boolean
  /** @default true */
  loop?: boolean
  /** Show the browser's control bar (hides the floating play button). */
  controls?: boolean
  /** How far ahead of the viewport the video starts loading. @default '300px' */
  loadMargin?: string
  /** Override built-in text for this instance. */
  labels?: Partial<MomiMessages['videoPlayer']>
  videoClassName?: string
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mql = window.matchMedia(REDUCED_MOTION)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

const getReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.(REDUCED_MOTION).matches

/** True when the user asked the OS for less motion. SSR-safe (false on the server). */
function usePrefersReducedMotion() {
  return React.useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false)
}

function sourceType({ src, type }: VideoSource) {
  if (type) return type
  const ext = src.split(/[?#]/)[0].split('.').pop()?.toLowerCase()
  if (ext === 'webm') return 'video/webm'
  if (ext === 'mp4' || ext === 'm4v') return 'video/mp4'
  if (ext === 'ogv' || ext === 'ogg') return 'video/ogg'
  return undefined
}

function PlayIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
    </svg>
  )
}

function PauseIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  )
}

/**
 * Lightweight demo video for landing pages: loads only when it is about to scroll into view,
 * plays muted while visible, pauses when it leaves. With reduced motion it waits for a click.
 */
export function VideoPlayer({
  sources,
  poster,
  ratio = 16 / 9,
  autoPlay = true,
  loop = true,
  controls = false,
  loadMargin = '300px',
  labels,
  className,
  videoClassName,
  'aria-label': ariaLabel,
  ref,
  ...props
}: VideoPlayerProps) {
  const t = useMessages('videoPlayer', labels)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const setRoot = React.useMemo(() => mergeRefs(rootRef, ref), [ref])
  const reducedMotion = usePrefersReducedMotion()
  const [near, setNear] = React.useState(false)
  const [inView, setInView] = React.useState(false)
  const [playing, setPlaying] = React.useState(false)
  const [started, setStarted] = React.useState(false)
  /** The user paused on purpose: don't resume automatically. */
  const userPausedRef = React.useRef(false)
  const shouldAutoPlay = autoPlay && !reducedMotion

  // Load when close to the viewport; play/pause on visibility.
  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => {
        setNear(true)
        setInView(true)
      })
      return () => cancelAnimationFrame(frame)
    }
    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true)
          loadObserver.disconnect()
        }
      },
      { rootMargin: loadMargin },
    )
    const viewObserver = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.35 },
    )
    loadObserver.observe(el)
    viewObserver.observe(el)
    return () => {
      loadObserver.disconnect()
      viewObserver.disconnect()
    }
  }, [loadMargin])

  // <source> children added after mount need an explicit load().
  React.useEffect(() => {
    const video = videoRef.current
    if (!near || !video) return
    video.muted = true
    video.load()
  }, [near])

  React.useEffect(() => {
    const video = videoRef.current
    if (!video || !near) return
    if (!inView) {
      video.pause()
      return
    }
    if (shouldAutoPlay && !userPausedRef.current) {
      video.play()?.catch(() => setPlaying(false))
    }
  }, [inView, near, shouldAutoPlay])

  function toggle() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      userPausedRef.current = false
      if (!near) setNear(true)
      video.play()?.catch(() => setPlaying(false))
    } else {
      userPausedRef.current = true
      video.pause()
    }
  }

  // Without autoplay (or with reduced motion) the poster gets a large play button.
  const showBigButton = !controls && !started && !shouldAutoPlay

  return (
    <div
      ref={setRoot}
      data-slot="video-player"
      data-playing={playing || undefined}
      className={cn('group/video relative overflow-hidden rounded-xl bg-muted', className)}
      {...props}
    >
      <AspectRatio ratio={ratio}>
        <video
          ref={videoRef}
          aria-label={ariaLabel}
          poster={poster}
          muted
          loop={loop}
          playsInline
          controls={controls}
          preload={near ? 'auto' : 'none'}
          onPlay={() => {
            setPlaying(true)
            setStarted(true)
          }}
          onPause={() => setPlaying(false)}
          className={cn('absolute inset-0 size-full object-cover', videoClassName)}
        >
          {near &&
            sources.map((source) => (
              <source key={source.src} src={source.src} type={sourceType(source)} />
            ))}
        </video>
      </AspectRatio>

      {!controls && (
        <button
          type="button"
          data-slot="video-player-toggle"
          aria-label={playing ? t.pause : t.play}
          onClick={toggle}
          className={cn(
            'absolute inline-flex items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md transition-[opacity,background-color,scale] outline-none',
            'hover:bg-black/60 focus-visible:ring-[3px] focus-visible:ring-white/70 motion-safe:active:scale-95',
            showBigButton
              ? 'top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2'
              : 'end-3 bottom-3 size-9',
            !showBigButton &&
              playing &&
              'opacity-0 group-hover/video:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100',
          )}
        >
          {playing ? (
            <PauseIcon className={showBigButton ? 'size-6' : 'size-4'} />
          ) : (
            // Nudged right so the triangle looks centered (not mirrored in RTL).
            <PlayIcon
              className={showBigButton ? 'size-7 translate-x-[3px]' : 'size-4 translate-x-px'}
            />
          )}
        </button>
      )}
    </div>
  )
}
