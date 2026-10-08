import * as React from 'react'
import { cn } from '../lib/cn'
import { fitRect, rasterizeImage, sampleAt, type MediaFit } from './internal/effect-media'
import {
  resolveColors,
  useEffectLoop,
  useImage,
  useThemeVersion,
  type EffectFrame,
  type Rgb,
} from './internal/effect-runtime'

export interface PixelTrailProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** Image shown underneath and broken into pixels along the pointer's path. */
  src?: string
  /** Accessible description of the image. Without it the effect is decorative. */
  alt?: string
  /** @default 'cover' */
  fit?: MediaFit
  /** Size of a pixel block, in px (blocks where the trail is strongest are twice as big). @default 24 */
  cellSize?: number
  /** Radius of the trail, in blocks. @default 2.2 */
  brush?: number
  /** How long the trail takes to fade, in ms. @default 900 */
  fade?: number
  /** How much the block colors are saturated and brightened. @default 1.3 */
  boost?: number
  /**
   * Heat ramp of the trail, from fading to fresh: blocks glow through these colors as they fade.
   * @default ['#3d5afe', '#22d3ee', '#a3e635', '#fde68a']
   */
  colors?: string[]
  /** How much of the image's own color shows in the blocks (0..1). @default 0.35 */
  imageMix?: number
}

const DEFAULT_COLORS = ['#3d5afe', '#22d3ee', '#a3e635', '#fde68a']

/** Saturate and brighten a color by `k` (1 = unchanged). */
function vivid([r, g, b]: Rgb, k: number): Rgb {
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const s = 1 + (k - 1) * 1.6
  const light = 1 + (k - 1) * 0.6
  const ch = (c: number) =>
    Math.max(0, Math.min(255, (luma + (c - luma) * s) * light + (k - 1) * 30))
  return [ch(r), ch(g), ch(b)]
}

/**
 * An image that breaks into vivid pixel blocks along the pointer's path, fading back after a
 * moment — or, without an image, a trail of pixel blocks in `colors`. 2-D canvas; draws nothing
 * extra while there is no trail. Fills its parent; give the parent a size.
 */
export function PixelTrail({
  src,
  alt,
  fit = 'cover',
  cellSize = 24,
  brush = 2.2,
  fade = 900,
  boost = 1.3,
  colors = DEFAULT_COLORS,
  imageMix = 0.35,
  className,
  ...props
}: PixelTrailProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const image = useImage(src)
  const themeVersion = useThemeVersion()
  const palette = React.useRef<Rgb[]>([[128, 128, 128]])
  const state = React.useRef({
    key: '',
    cols: 0,
    rows: 0,
    life: new Float32Array(0),
    fine: [] as Rgb[] | null,
    base: null as HTMLCanvasElement | null,
    last: null as { x: number; y: number } | null,
    painted: false,
  })
  const colorKey = colors.join('|')

  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    palette.current = resolveColors(el, colorKey.split('|'))
    state.current.painted = false
  }, [colorKey, themeVersion])

  const prepare = (width: number, height: number, dpr: number) => {
    const s = state.current
    const cols = Math.ceil(width / cellSize)
    const rows = Math.ceil(height / cellSize)
    s.cols = cols
    s.rows = rows
    s.life = new Float32Array(cols * rows)
    s.painted = false
    s.fine = null
    s.base = null
    if (!image) return
    // The image, fitted once at device resolution, blitted under the blocks each frame.
    const base = document.createElement('canvas')
    base.width = Math.round(width * dpr)
    base.height = Math.round(height * dpr)
    const ctx = base.getContext('2d')
    if (ctx) {
      const r = fitRect(image.naturalWidth, image.naturalHeight, base.width, base.height, fit)
      ctx.drawImage(image, r.x, r.y, r.width, r.height)
      s.base = base
    }
    // One color per block, from the image fitted the same way.
    const raster = rasterizeImage(image, cols, rows, fit)
    if (raster) {
      s.fine = Array.from({ length: cols * rows }, (_, i) => {
        const { r, g, b } = sampleAt(raster, i)
        return [r, g, b] as Rgb
      })
    }
  }

  const draw = (frame: EffectFrame) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { width, height, dpr, dt, pointer } = frame
    const s = state.current
    const key = [width, height, cellSize, fit, image?.src].join('|')
    if (s.key !== key) {
      prepare(width, height, dpr)
      s.key = key
    }
    const { cols, rows, life } = s

    // Stamp the trail along the path since the last frame.
    let active = false
    if (pointer?.inside && dt > 0) {
      const from = s.last ?? { x: pointer.x, y: pointer.y }
      const distance = Math.hypot(pointer.x - from.x, pointer.y - from.y)
      const steps = Math.max(1, Math.ceil(distance / (cellSize / 2)))
      const reach = Math.ceil(brush)
      for (let k = 1; k <= steps; k++) {
        const x = (from.x + ((pointer.x - from.x) * k) / steps) / cellSize
        const y = (from.y + ((pointer.y - from.y) * k) / steps) / cellSize
        for (let j = Math.floor(y) - reach; j <= Math.floor(y) + reach; j++) {
          if (j < 0 || j >= rows) continue
          for (let i = Math.floor(x) - reach; i <= Math.floor(x) + reach; i++) {
            if (i < 0 || i >= cols) continue
            const d = Math.hypot(i + 0.5 - x, j + 0.5 - y) / brush
            if (d < 1) life[j * cols + i] = Math.max(life[j * cols + i], 1 - d * d)
          }
        }
      }
      s.last = { x: pointer.x, y: pointer.y }
    } else {
      s.last = null
    }
    const decay = dt > 0 ? (dt * 1000) / fade : 0
    for (let i = 0; i < life.length; i++) {
      if (life[i] <= 0) continue
      life[i] = Math.max(0, life[i] - decay)
      if (life[i] > 0) active = true
    }
    // Nothing to animate and the frame already shows the image: leave the canvas alone.
    if (!active && s.painted) return

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (s.base) ctx.drawImage(s.base, 0, 0)
    s.painted = true
    if (!active) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const ramp = palette.current
    /** The block's color at trail strength `v`: the heat ramp, with some of the image showing. */
    const colorOf = (i: number, v: number): Rgb => {
      const x = Math.min(0.999, Math.max(0, v)) * (ramp.length - 1)
      const k = Math.floor(x)
      const a = ramp[k]
      const b = ramp[Math.min(ramp.length - 1, k + 1)]
      const f = x - k
      const heat: Rgb = [
        a[0] + (b[0] - a[0]) * f,
        a[1] + (b[1] - a[1]) * f,
        a[2] + (b[2] - a[2]) * f,
      ]
      const own = s.fine?.[i]
      if (!own) return heat
      return [
        heat[0] + (own[0] - heat[0]) * imageMix,
        heat[1] + (own[1] - heat[1]) * imageMix,
        heat[2] + (own[2] - heat[2]) * imageMix,
      ]
    }
    // Fine blocks first, then double-size blocks where the trail is strongest.
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const v = life[j * cols + i]
        if (v <= 0.02) continue
        const [r, g, b] = vivid(colorOf(j * cols + i, v), 1 + (boost - 1) * v)
        ctx.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${Math.min(1, v * 1.5)})`
        ctx.fillRect(i * cellSize, j * cellSize, cellSize + 0.5, cellSize + 0.5)
      }
    }
    for (let j = 0; j + 1 < rows; j += 2) {
      for (let i = 0; i + 1 < cols; i += 2) {
        const cells = [j * cols + i, j * cols + i + 1, (j + 1) * cols + i, (j + 1) * cols + i + 1]
        const v = cells.reduce((sum, c) => sum + life[c], 0) / 4
        if (v < 0.6) continue
        const mean = cells
          .map((c) => colorOf(c, v))
          .reduce<Rgb>(
            (acc, c) => [acc[0] + c[0] / 4, acc[1] + c[1] / 4, acc[2] + c[2] / 4],
            [0, 0, 0],
          )
        const [r, g, b] = vivid(mean, 1 + (boost - 1) * v)
        ctx.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${Math.min(1, (v - 0.6) * 3)})`
        ctx.fillRect(i * cellSize, j * cellSize, cellSize * 2 + 0.5, cellSize * 2 + 0.5)
      }
    }
  }

  useEffectLoop(rootRef, {
    resize: ({ width, height, dpr }) => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      state.current.key = ''
    },
    draw,
  })

  return (
    <div
      ref={rootRef}
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      data-slot="pixel-trail"
      className={cn('relative size-full overflow-hidden', className)}
      {...props}
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block size-full" />
    </div>
  )
}
