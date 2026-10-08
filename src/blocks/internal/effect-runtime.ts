/**
 * Shared runtime for the canvas effects (ParticleWave, Fireflies): a frame loop capped at `fps`
 * that only runs while the effect is on screen and the tab is visible, a still frame for
 * reduced motion (also when the setting changes while the page is open), automatic quality drop
 * on slow devices, and pointer tracking relative to the effect.
 */
import * as React from 'react'
import { parseColor } from '../../lib/color'
import { loadImage } from './effect-media'

/* -------------------------------------------------------------------------------------------------
 * Math
 * -----------------------------------------------------------------------------------------------*/

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const smoothstep = (t: number) => {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

/** Deterministic pseudo-random number in [0, 1) for an integer and a seed. */
export function hash01(i: number, seed = 0) {
  let h = (Math.imul(i | 0, 0x27d4eb2d) ^ Math.imul((seed | 0) + 0x9e3779b9, 0x165667b1)) >>> 0
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b) >>> 0
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0
  h = (h ^ (h >>> 16)) >>> 0
  return h / 4294967296
}

/** Smooth 1-D value noise in [0, 1]. */
export function noise1(x: number, seed = 0) {
  const i = Math.floor(x)
  const f = x - i
  const a = hash01(i, seed)
  return a + (hash01(i + 1, seed) - a) * smoothstep(f)
}

/* -------------------------------------------------------------------------------------------------
 * Pointer, shared by every effect on the page
 * -----------------------------------------------------------------------------------------------*/

const pointer = { x: 0, y: 0, active: false }
let tracking = false

function trackPointer() {
  if (tracking || typeof window === 'undefined') return
  tracking = true
  const move = (event: PointerEvent) => {
    pointer.x = event.clientX
    pointer.y = event.clientY
    pointer.active = true
  }
  const off = () => {
    pointer.active = false
  }
  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerdown', move, { passive: true })
  // A finger lifting (or the browser taking over to scroll) ends the touch.
  window.addEventListener('pointerup', (e) => e.pointerType !== 'mouse' && off(), { passive: true })
  window.addEventListener('pointercancel', off, { passive: true })
  window.addEventListener('blur', off)
  document.documentElement.addEventListener('mouseleave', off)
}

/* -------------------------------------------------------------------------------------------------
 * Frame loop
 * -----------------------------------------------------------------------------------------------*/

export interface EffectPointer {
  /** In CSS px, relative to the effect's top-left corner. */
  x: number
  y: number
  /** The pointer is over the effect's box. */
  inside: boolean
  /** The pointer is in the window (not left it, not a lifted finger). */
  active: boolean
  /** Viewport position in -1..1 on each axis (for parallax). */
  viewX: number
  viewY: number
}

export interface EffectFrame {
  /** Effect clock in seconds: only advances while frames are drawn. */
  time: number
  /** Seconds since the previous frame; 0 for still frames. */
  dt: number
  width: number
  height: number
  /** Device pixel ratio used for the canvas, capped at 2. */
  dpr: number
  /** `null` when not interactive or drawing a still frame. */
  pointer: EffectPointer | null
  /** Drops to `'low'` (and 30 fps) when frames keep arriving late. */
  quality: 'high' | 'low'
  /** Reduced motion: a single frame, redrawn on resize. */
  still: boolean
}

export interface EffectLoopOptions {
  draw: (frame: EffectFrame) => void
  /** Size the canvases (CSS px × dpr) before the next draw. */
  resize?: (size: { width: number; height: number; dpr: number }) => void
  /** A press (click, tap) inside the effect's box while it runs. */
  press?: (x: number, y: number, time: number) => void
  /** @default true */
  interactive?: boolean
  /** @default 60 */
  fps?: number
  /** Clock time of the reduced-motion still frame. @default 3 */
  stillTime?: number
  /** Average frame interval (ms) above which quality drops. @default 25 */
  slowFrameMs?: number
}

/** Runs `draw` for the element in `target` (the effect's root) — see the module comment. */
export function useEffectLoop(
  target: React.RefObject<HTMLElement | null>,
  options: EffectLoopOptions,
) {
  const latest = React.useRef(options)
  React.useEffect(() => {
    latest.current = options
  })
  const interactive = options.interactive ?? true

  React.useEffect(() => {
    const el = target.current
    if (!el || typeof window === 'undefined') return
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    let still = motion?.matches ?? false
    let width = 1
    let height = 1
    let dpr = 1
    let raf = 0
    let last = 0
    let running = false
    let visible = typeof IntersectionObserver === 'undefined'
    let clock = 0
    let frames = 0
    let interval = 1000 / (latest.current.fps ?? 60)
    let quality: EffectFrame['quality'] = 'high'

    const measure = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = el.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      latest.current.resize?.({ width, height, dpr })
    }

    const pointerFrame = (): EffectPointer | null => {
      if (!interactive || still) return null
      const rect = el.getBoundingClientRect()
      const x = pointer.x - rect.left
      const y = pointer.y - rect.top
      return {
        x,
        y,
        inside: pointer.active && x >= 0 && y >= 0 && x <= rect.width && y <= rect.height,
        active: pointer.active,
        viewX: pointer.active
          ? Math.max(-1, Math.min(1, (pointer.x / window.innerWidth) * 2 - 1))
          : 0,
        viewY: pointer.active
          ? Math.max(-1, Math.min(1, (pointer.y / window.innerHeight) * 2 - 1))
          : 0,
      }
    }

    const drawNow = (dt: number) =>
      latest.current.draw(
        still
          ? {
              time: latest.current.stillTime ?? 3,
              dt: 0,
              width,
              height,
              dpr,
              pointer: null,
              quality: 'high',
              still: true,
            }
          : { time: clock, dt, width, height, dpr, pointer: pointerFrame(), quality, still: false },
      )

    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop)
      const cap = latest.current.fps ?? 60
      const fps = quality === 'low' ? Math.min(30, cap) : cap
      if (last && ts - last < 1000 / fps - 2) return
      if (last) {
        interval = interval * 0.95 + (ts - last) * 0.05
        if (quality === 'high' && ++frames > 90 && interval > (latest.current.slowFrameMs ?? 25)) {
          quality = 'low'
        }
      }
      const dt = last ? Math.min(0.1, (ts - last) / 1000) : 1 / fps
      last = ts
      clock += dt
      drawNow(dt)
    }

    const update = () => {
      const run = visible && !still && document.visibilityState !== 'hidden'
      if (run === running) return
      running = run
      last = 0
      if (run) raf = requestAnimationFrame(loop)
      else cancelAnimationFrame(raf)
    }

    measure()
    drawNow(0)

    const resized = new ResizeObserver(() => {
      measure()
      // Resizing clears the canvases: repaint right away, running or not.
      drawNow(0)
    })
    resized.observe(el)
    const seen =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            update()
          })
    seen?.observe(el)
    const onVisibility = () => update()
    document.addEventListener('visibilitychange', onVisibility)
    const onMotion = (event: MediaQueryListEvent) => {
      still = event.matches
      update()
      drawNow(0)
    }
    motion?.addEventListener?.('change', onMotion)
    const onPress = (event: PointerEvent) => {
      if (!running || !interactive) return
      const rect = el.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return
      latest.current.press?.(x, y, clock)
    }
    if (interactive) {
      trackPointer()
      window.addEventListener('pointerdown', onPress, { passive: true })
    }
    update()

    return () => {
      cancelAnimationFrame(raf)
      running = false
      resized.disconnect()
      seen?.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      motion?.removeEventListener?.('change', onMotion)
      window.removeEventListener('pointerdown', onPress)
    }
  }, [target, interactive])
}

/* -------------------------------------------------------------------------------------------------
 * Colors
 * -----------------------------------------------------------------------------------------------*/

export type Rgb = [number, number, number]

let scratch: CanvasRenderingContext2D | null | undefined

/** sRGB channels (0..255) and alpha (0..1) of any CSS color the browser understands. */
function toRgba(css: string): [number, number, number, number] | null {
  const parsed = parseColor(css)
  if (parsed) return [parsed.r, parsed.g, parsed.b, parsed.a]
  // oklch(), color(), named colors…: let a 1×1 canvas convert it.
  if (scratch === undefined) {
    try {
      scratch = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    } catch {
      scratch = null
    }
  }
  if (!scratch) return null
  scratch.clearRect(0, 0, 1, 1)
  scratch.fillStyle = '#000'
  scratch.fillStyle = css
  scratch.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = scratch.getImageData(0, 0, 1, 1).data
  return [r, g, b, a / 255]
}

/**
 * Resolve CSS colors — `#hex`, `rgb()`, `oklch()`, `var(--primary)`… — to sRGB as seen from `el`
 * (so theme variables follow the element's theme). Unresolvable values fall back to white.
 */
export function resolveColors(el: HTMLElement, values: string[]): Rgb[] {
  const probe = document.createElement('span')
  probe.style.display = 'none'
  el.appendChild(probe)
  const colors = values.map((value): Rgb => {
    probe.style.color = ''
    probe.style.color = value
    const rgba = toRgba(getComputedStyle(probe).color || value) ?? toRgba(value)
    return rgba ? [rgba[0], rgba[1], rgba[2]] : [255, 255, 255]
  })
  probe.remove()
  return colors
}

/** Whether the first opaque background behind `el` is light (for choosing a blend mode). */
export function onLightBackground(el: HTMLElement) {
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    const rgba = toRgba(getComputedStyle(node).backgroundColor || 'transparent')
    if (rgba && rgba[3] > 0.5) {
      return (0.2126 * rgba[0] + 0.7152 * rgba[1] + 0.0722 * rgba[2]) / 255 > 0.5
    }
  }
  return !window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

/** Changes whenever the page theme may have changed (class / data-theme / style on <html>, OS scheme). */
export function useThemeVersion() {
  const [version, setVersion] = React.useState(0)
  React.useEffect(() => {
    const bump = () => setVersion((v) => v + 1)
    const observer = new MutationObserver(bump)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    })
    const scheme = window.matchMedia?.('(prefers-color-scheme: dark)')
    scheme?.addEventListener?.('change', bump)
    return () => {
      observer.disconnect()
      scheme?.removeEventListener?.('change', bump)
    }
  }, [])
  return version
}

export const rgba = ([r, g, b]: Rgb, alpha: number) =>
  `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${clamp01(alpha)})`

export const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]

/** The image at `src` once loaded (cached per URL), else `null`. */
export function useImage(src: string | undefined) {
  const [loaded, setLoaded] = React.useState<{ src: string; image: HTMLImageElement } | null>(null)
  React.useEffect(() => {
    if (!src) return
    let alive = true
    loadImage(src).then(
      (image) => alive && setLoaded({ src, image }),
      () => alive && setLoaded(null),
    )
    return () => {
      alive = false
    }
  }, [src])
  return loaded && loaded.src === src ? loaded.image : null
}
