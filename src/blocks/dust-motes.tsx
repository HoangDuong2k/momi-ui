import * as React from 'react'
import { cn } from '../lib/cn'
import {
  hash01,
  mixRgb,
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

interface Mote {
  x: number
  y: number
  vx: number
  vy: number
  /** Size in px; the few big ones are drawn soft, as if out of focus. */
  size: number
  seed: number
}

export interface DustMotesProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** Dust caught in the light. Any CSS color or theme variable. @default '#ffd59a' */
  color?: string
  /** Dust outside the light. @default '#9fb2bd' */
  ambientColor?: string
  /** Draw the beam of light. Without it, dust drifts evenly lit. @default true */
  beam?: boolean
  /** @default the dust color */
  beamColor?: string
  /** Where the light comes from, as fractions of the box (may lie outside it). @default { x: 0.12, y: -0.08 } */
  source?: { x?: number; y?: number }
  /** Where the beam points when the pointer is away, as fractions of the box. @default { x: 0.55, y: 1 } */
  aim?: { x?: number; y?: number }
  /** Half-angle of the beam, in degrees. @default 17 */
  spread?: number
  /** The beam turns towards the pointer. @default true */
  followPointer?: boolean
  /** Number of motes (fewer on narrow screens). @default 240 */
  count?: number
  /** @default 1 */
  size?: number
  /** @default 1 */
  speed?: number
  /** The pointer stirs the dust (and the beam follows it, with `followPointer`). @default true */
  interactive?: boolean
  /** `add` for dark backgrounds, `normal` for light ones, `auto` picks and follows the theme. @default 'auto' */
  blend?: 'auto' | 'add' | 'normal'
}

const NO_POINT = {}

/**
 * Dust drifting through a beam of light — glinting where the light catches it, faint elsewhere.
 * The beam turns slowly towards the pointer and moving the pointer stirs the dust. A 2-D canvas
 * background: place it inside a `relative` (and `isolate`) parent. Pauses off screen; still with
 * reduced motion.
 */
export function DustMotes({
  color = '#ffd59a',
  ambientColor = '#9fb2bd',
  beam = true,
  beamColor,
  source = NO_POINT,
  aim = NO_POINT,
  spread = 17,
  followPointer = true,
  count = 240,
  size = 1,
  speed = 1,
  interactive = true,
  blend = 'auto',
  className,
  ...props
}: DustMotesProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const themeVersion = useThemeVersion()
  const palette = React.useRef<{ dust: Rgb; ambient: Rgb; beam: Rgb; light: boolean }>({
    dust: [255, 213, 154],
    ambient: [159, 178, 189],
    beam: [255, 213, 154],
    light: false,
  })
  const motes = React.useRef<Mote[]>([])
  const heading = React.useRef<number | null>(null)
  const lastPointer = React.useRef<{ x: number; y: number } | null>(null)
  const clock = React.useRef(0)

  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const [dust, ambient, light] = resolveColors(el, [color, ambientColor, beamColor ?? color])
    palette.current = {
      dust,
      ambient,
      beam: light,
      light: blend === 'auto' ? onLightBackground(el) : blend === 'normal',
    }
  }, [color, ambientColor, beamColor, blend, themeVersion])

  const populate = (width: number, height: number) => {
    const n = Math.round(width < 640 ? count * 0.55 : count)
    const list = motes.current
    while (list.length < n) {
      const i = list.length
      const big = hash01(i, 4) < 0.07
      list.push({
        x: hash01(i, 1) * width,
        y: hash01(i, 2) * height,
        vx: 0,
        vy: 0,
        size: big ? 3 + hash01(i, 5) * 5 : 0.5 + hash01(i, 6) * 1.3,
        seed: hash01(i, 7),
      })
    }
    list.length = n
  }

  const draw = (frame: EffectFrame) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { width: w, height: h, dpr, dt, pointer } = frame
    const { dust, ambient, beam: beamRgb, light } = palette.current
    populate(w, h)
    clock.current = frame.still ? frame.time : clock.current + dt * speed
    const t = clock.current

    // The beam: from the source towards the pointer (eased), or towards `aim`.
    const sx = w * (source.x ?? 0.12)
    const sy = h * (source.y ?? -0.08)
    let tx = w * (aim.x ?? 0.55)
    let ty = h * (aim.y ?? 1)
    if (interactive && followPointer && pointer?.active) {
      tx = pointer.x
      ty = pointer.y
    }
    const target = Math.atan2(ty - sy, tx - sx)
    if (heading.current === null || dt === 0) heading.current = target
    else {
      let diff = target - heading.current
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      heading.current += diff * (1 - Math.exp(-dt * 2.2))
    }
    const angle = heading.current
    const half = (spread * Math.PI) / 180
    const reach = Math.hypot(Math.max(sx, w - sx), Math.max(sy, h - sy)) * 1.1

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    ctx.globalCompositeOperation = light ? 'source-over' : 'lighter'
    const strength = light ? 0.55 : 1

    if (beam) {
      // The cone: an angular gradient around the source (soft edges in one fill), dimmed with
      // distance by a radial mask. Browsers without conic gradients get stacked thin wedges.
      ctx.globalCompositeOperation = 'source-over'
      const peak = 0.4 * strength
      if (typeof ctx.createConicGradient === 'function') {
        const width = half * 1.35
        const span = (width * 2) / (Math.PI * 2)
        const cone = ctx.createConicGradient(angle - width, sx, sy)
        cone.addColorStop(0, rgba(beamRgb, 0))
        cone.addColorStop(span * 0.22, rgba(beamRgb, peak * 0.35))
        cone.addColorStop(span * 0.5, rgba(beamRgb, peak))
        cone.addColorStop(span * 0.78, rgba(beamRgb, peak * 0.35))
        cone.addColorStop(span, rgba(beamRgb, 0))
        cone.addColorStop(1, rgba(beamRgb, 0))
        ctx.fillStyle = cone
        ctx.fillRect(0, 0, w, h)
      } else {
        ctx.fillStyle = rgba(beamRgb, peak / 5)
        for (let k = 0; k < 8; k++) {
          ctx.beginPath()
          ctx.moveTo(sx, sy)
          ctx.arc(sx, sy, reach, angle - half * (0.4 + k * 0.12), angle + half * (0.4 + k * 0.12))
          ctx.closePath()
          ctx.fill()
        }
      }
      const falloff = ctx.createRadialGradient(sx, sy, 0, sx, sy, reach)
      falloff.addColorStop(0, 'rgba(0, 0, 0, 1)')
      falloff.addColorStop(0.55, 'rgba(0, 0, 0, 0.75)')
      falloff.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.globalCompositeOperation = 'destination-in'
      ctx.fillStyle = falloff
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = light ? 'source-over' : 'lighter'
      // The bulb.
      const bulb = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.min(w, h) * 0.22)
      bulb.addColorStop(0, rgba(mixRgb(beamRgb, [255, 255, 255], 0.5), 0.5 * strength))
      bulb.addColorStop(1, rgba(beamRgb, 0))
      ctx.fillStyle = bulb
      ctx.fillRect(0, 0, w, h)
    }

    // Pointer movement this frame, for stirring.
    let pvx = 0
    let pvy = 0
    if (interactive && pointer?.active && dt > 0) {
      if (lastPointer.current) {
        pvx = (pointer.x - lastPointer.current.x) / dt
        pvy = (pointer.y - lastPointer.current.y) / dt
      }
      lastPointer.current = { x: pointer.x, y: pointer.y }
    } else {
      lastPointer.current = null
    }

    for (const m of motes.current) {
      if (dt > 0) {
        // Air currents: slow, smooth, a little different for every mote; a faint downward settle.
        const ax = (noise1(t * 0.15 + m.seed * 50, 3) - 0.5) * 22
        const ay = (noise1(t * 0.12 + m.seed * 70, 9) - 0.5) * 18 + 2
        m.vx += ax * dt
        m.vy += ay * dt
        if (pointer && (pvx || pvy)) {
          const dx = m.x - pointer.x
          const dy = m.y - pointer.y
          const d2 = dx * dx + dy * dy
          if (d2 < 140 * 140) {
            const f = (1 - Math.sqrt(d2) / 140) ** 2
            m.vx += pvx * f * 0.035
            m.vy += pvy * f * 0.035
          }
        }
        const damp = Math.exp(-dt * 0.9)
        m.vx *= damp
        m.vy *= damp
        m.x += m.vx * dt * speed
        m.y += m.vy * dt * speed
        if (m.x < -10) m.x += w + 20
        else if (m.x > w + 10) m.x -= w + 20
        if (m.y < -10) m.y += h + 20
        else if (m.y > h + 10) m.y -= h + 20
      }
      // How much the beam lights this mote: inside the cone, fading at its edges and far away.
      let lit: number
      if (beam) {
        const dx = m.x - sx
        const dy = m.y - sy
        const off = Math.abs(
          Math.atan2(Math.sin(Math.atan2(dy, dx) - angle), Math.cos(Math.atan2(dy, dx) - angle)),
        )
        lit =
          smoothstep((half * 1.15 - off) / (half * 0.6)) *
          (1 / (1 + Math.hypot(dx, dy) / reach) ** 2)
      } else lit = 0.6
      const glint = 0.55 + 0.45 * Math.sin(t * (2 + m.seed * 3) + m.seed * 40)
      const alpha = Math.min(1, (0.1 + lit * 1.3 * glint) * strength)
      if (alpha < 0.02) continue
      const c = mixRgb(ambient, dust, Math.min(1, lit * 1.4))
      const r = m.size * size
      if (r > 2.5) {
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r)
        g.addColorStop(0, rgba(c, alpha * 0.35))
        g.addColorStop(1, rgba(c, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(m.x, m.y, r, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillStyle = rgba(c, alpha)
        ctx.beginPath()
        ctx.arc(m.x, m.y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  useEffectLoop(rootRef, {
    interactive,
    stillTime: 6,
    slowFrameMs: 22,
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
      data-slot="dust-motes"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
      {...props}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block size-full" />
    </div>
  )
}
