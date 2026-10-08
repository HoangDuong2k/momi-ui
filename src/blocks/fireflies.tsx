import * as React from 'react'
import { cn } from '../lib/cn'
import {
  hash01,
  noise1,
  onLightBackground,
  resolveColors,
  rgba,
  smoothstep,
  useEffectLoop,
  useThemeVersion,
  type EffectFrame,
  type Rgb,
} from './internal/effect-runtime'

/** Pointer reach (px), the distance flies keep from it, pull and swirl strength, spring back home. */
const REACH = 240
const KEEP_AWAY = 46
const PULL = 420
const SWIRL = 170
const SPRING = 6
const DAMPING = 3.2
const WHITE: Rgb = [255, 255, 255]

interface Fly {
  ox: number
  oy: number
  vx: number
  vy: number
  /** Extra brightness near the pointer, 0..1 (eased). */
  glow: number
}

export interface FirefliesProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /**
   * One swarm per color, each at its own depth (the first is nearest). Any CSS color, including
   * theme variables. @default ['#62d0ff', '#b48cff']
   */
  colors?: string[]
  /** Flies per swarm (halved on narrow screens). @default 16 */
  count?: number
  /** @default 1 */
  size?: number
  /** @default 1 */
  speed?: number
  /** Peak opacity. @default 0.7 */
  opacity?: number
  /** Flies drift over to the pointer and circle it; swarms shift with it for depth. @default true */
  interactive?: boolean
  /** `add` for dark backgrounds, `normal` for light ones, `auto` picks and follows the theme. @default 'auto' */
  blend?: 'auto' | 'add' | 'normal'
}

const DEFAULT_COLORS = ['#62d0ff', '#b48cff']

/**
 * Glowing specks that drift and blink slowly, fading out at the edges, and come over curious when
 * the pointer is near. A 2-D canvas background: place it inside a `relative` (and `isolate`)
 * parent. It pauses off screen, drops to 30 fps on slow devices and shows a still frame with
 * reduced motion.
 */
export function Fireflies({
  colors = DEFAULT_COLORS,
  count = 16,
  size = 1,
  speed = 1,
  opacity = 0.7,
  interactive = true,
  blend = 'auto',
  className,
  ...props
}: FirefliesProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const palette = React.useRef<{ colors: Rgb[]; light: boolean }>({ colors: [], light: false })
  const swarms = React.useRef<Fly[][]>([])
  const parallax = React.useRef({ x: 0, y: 0 })
  const clock = React.useRef(0)
  const themeVersion = useThemeVersion()
  const colorKey = colors.join('|')

  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    palette.current = {
      colors: resolveColors(el, colorKey.split('|')),
      light: blend === 'auto' ? onLightBackground(el) : blend === 'normal',
    }
  }, [colorKey, blend, themeVersion])

  const draw = (frame: EffectFrame) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { width: w, height: h, dpr, dt, pointer } = frame
    const { colors: swarmColors, light } = palette.current
    const n = Math.max(1, Math.round(w < 640 ? count / 2 : count))
    clock.current = frame.still ? frame.time : clock.current + dt * speed
    const t = clock.current

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (pointer && dt > 0) {
      // Depth: swarms shift with the pointer's position in the window, eased (~0.4 s).
      const k = 1 - Math.exp(-dt * 2.5)
      parallax.current.x += (pointer.viewX - parallax.current.x) * k
      parallax.current.y += (pointer.viewY - parallax.current.y) * k
    }
    const edge = Math.max(1, Math.min(w, h) * 0.15)
    const wrap = (v: number, m: number) => ((v % m) + m) % m

    swarmColors.forEach((color, s) => {
      const depth = swarmColors.length > 1 ? 16 - (9 * s) / (swarmColors.length - 1) : 12
      const seed = 11 + s * 12
      const shiftX = -parallax.current.x * depth
      const shiftY = -parallax.current.y * depth * 0.6
      const flies = (swarms.current[s] ??= [])
      while (flies.length < n) flies.push({ ox: 0, oy: 0, vx: 0, vy: 0, glow: 0 })
      ctx.setTransform(dpr, 0, 0, dpr, shiftX * dpr, shiftY * dpr)
      for (let i = 0; i < n; i++) {
        const r1 = hash01(i, seed)
        const r2 = hash01(i, seed + 1)
        const r3 = hash01(i, seed + 2)
        const r4 = hash01(i, seed + 3)
        const pace = 0.5 + r4
        // Each fly's own path: wandering, blinking on and off.
        const bx = wrap(r1 * w + (noise1(t * 0.09 * pace + i * 3.1, seed + 7) - 0.5) * w * 0.5, w)
        const by = wrap(r2 * h + (noise1(t * 0.075 * pace + i * 5.7, seed + 8) - 0.5) * h * 0.5, h)
        let alpha = opacity * smoothstep((noise1(t * 0.4 * pace + i * 5.3, seed + 11) - 0.3) / 0.4)
        const fly = flies[i]
        if (pointer && dt > 0) {
          let ax = -SPRING * fly.ox - DAMPING * fly.vx
          let ay = -SPRING * fly.oy - DAMPING * fly.vy
          let target = 0
          if (pointer.inside) {
            const dx = pointer.x - (bx + fly.ox + shiftX)
            const dy = pointer.y - (by + fly.oy + shiftY)
            const dist = Math.hypot(dx, dy) || 1
            if (dist < REACH) {
              const weight = (1 - dist / REACH) ** 2
              // Drawn to the pointer but keeping some distance, circling it (each its own way).
              const pull = dist > KEEP_AWAY ? PULL * weight : -PULL * 2 * (1 - dist / KEEP_AWAY)
              const turn = (r3 > 0.5 ? 1 : -1) * SWIRL * weight
              ax += (pull * dx - turn * dy) / dist
              ay += (pull * dy + turn * dx) / dist
              target = weight
            }
          }
          fly.vx += ax * dt
          fly.vy += ay * dt
          fly.ox += fly.vx * dt
          fly.oy += fly.vy * dt
          fly.glow += (target - fly.glow) * (1 - Math.exp(-dt * 4))
        }
        const x = bx + fly.ox
        const y = by + fly.oy
        // Fade at the edges instead of cutting off.
        const d = Math.min(x, w - x, y, h - y)
        if (d <= 0) continue
        alpha *= smoothstep(d / edge)
        alpha = Math.min(1, alpha + fly.glow * 0.85)
        if (alpha <= 0.002) continue
        const radius = Math.max(1, 13.2 * size * (0.4 + r3 * 1.2) * (1 + fly.glow * 0.35))
        const g = ctx.createRadialGradient(x, y, 0, x, y, light ? radius * 0.7 : radius)
        if (light) {
          // On a light background a white core vanishes: a crisp colored dot with a thin halo.
          ctx.globalAlpha = alpha * 0.85
          g.addColorStop(0, rgba(color, 1))
          g.addColorStop(0.18, rgba(color, 0.7))
          g.addColorStop(1, rgba(color, 0))
        } else {
          ctx.globalAlpha = alpha
          g.addColorStop(0, rgba(WHITE, 0.95))
          g.addColorStop(0.15, rgba(color, 0.85))
          g.addColorStop(1, rgba(color, 0))
        }
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    ctx.globalAlpha = 1
  }

  useEffectLoop(rootRef, {
    interactive,
    stillTime: 4,
    // 2-D drawing is CPU work: drop to 30 fps sooner than WebGL effects.
    slowFrameMs: 20,
    resize: ({ width, height, dpr }) => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    },
    draw,
  })

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-slot="fireflies"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
      {...props}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block size-full" />
    </div>
  )
}
