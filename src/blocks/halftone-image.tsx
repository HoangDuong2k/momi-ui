import * as React from 'react'
import { cn } from '../lib/cn'
import {
  bindAttributes,
  createProgram,
  rasterizeImage,
  rasterizeText,
  sampleAt,
  uniformsOf,
  type MediaFit,
  type Raster,
} from './internal/effect-media'
import {
  hash01,
  onLightBackground,
  resolveColors,
  rgba,
  useEffectLoop,
  useImage,
  useThemeVersion,
  type EffectFrame,
  type Rgb,
} from './internal/effect-runtime'

const VERT = `
attribute vec4 aDot;
uniform vec2 uRes;
uniform float uCell;
uniform float uPx;
uniform float uTime;
uniform vec3 uPointer;
uniform float uRadius;
uniform float uGrow;
uniform float uShimmer;
uniform vec3 uColor;
uniform vec3 uAccent;
varying vec3 vColor;
varying float vSize;

void main() {
  vec2 p = aDot.xy;
  float d = distance(p, uPointer.xy);
  float spot = uPointer.z * smoothstep(uRadius, uRadius * 0.15, d);
  // A slow shimmer runs across the dots while idle
  float wave = uShimmer * 0.1 * sin(uTime * 1.4 + p.x * 0.018 + p.y * 0.011 + aDot.w * 6.2832);
  // Dot area follows the tone, so the diameter goes with its square root
  float size = uCell * sqrt(clamp(aDot.z + wave, 0.0, 1.0)) * (0.95 + spot * uGrow);
  vColor = mix(uColor, uAccent, spot);
  vSize = size * uPx;
  gl_PointSize = vSize;
  vec2 clip = p / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`

const FRAG = `
precision mediump float;
uniform float uSquare;
varying vec3 vColor;
varying float vSize;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float edge = 2.0 / max(vSize, 1.0);
  float a = uSquare > 0.5 ? 1.0 : 1.0 - smoothstep(1.0 - edge, 1.0, length(q));
  if (a <= 0.0) discard;
  gl_FragColor = vec4(vColor * a, a);
}`

const UNIFORMS = [
  'uRes',
  'uCell',
  'uPx',
  'uTime',
  'uPointer',
  'uRadius',
  'uGrow',
  'uShimmer',
  'uColor',
  'uAccent',
  'uSquare',
] as const

export interface HalftoneImageProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** The image to draw as dots (same-origin, or served with CORS headers). */
  src?: string
  /** A line of text to draw as dots instead of an image. */
  text?: string
  /** CSS font (weight and family, no size) of `text`. @default '600 system-ui, sans-serif' */
  font?: string
  /** Accessible description. Without it the effect is decorative (hidden from screen readers). */
  alt?: string
  /** Distance between dot centers, in px. @default 10 */
  cellSize?: number
  /** @default 'circle' */
  shape?: 'circle' | 'square'
  /** Dot color. Any CSS color or theme variable. @default 'currentColor' */
  color?: string
  /** Color the dots take around the pointer. @default 'var(--primary)' */
  accent?: string
  /**
   * Which parts of the image get the big dots: `dark` ones (ink on paper), `light` ones (light on a
   * dark screen), or `auto` from the background behind the effect. @default 'auto'
   */
  dots?: 'auto' | 'dark' | 'light'
  /** @default 'contain' */
  fit?: MediaFit
  /** Radius of the pointer's spotlight, in px. @default 140 */
  radius?: number
  /** How much dots grow in the spotlight. @default 0.6 */
  grow?: number
  /** A slow shimmer across the dots. @default true */
  shimmer?: boolean
  /** @default true */
  interactive?: boolean
}

/**
 * An image (or a line of text) drawn as a halftone grid of dots, sized by its tones; dots around
 * the pointer take the accent color and grow. WebGL, with a still 2-D fallback. Fills its parent
 * like a background; give the parent a size.
 */
export function HalftoneImage({
  src,
  text,
  font = '600 system-ui, sans-serif',
  alt,
  cellSize = 10,
  shape = 'circle',
  color = 'currentColor',
  accent = 'var(--primary)',
  dots = 'auto',
  fit = 'contain',
  radius = 140,
  grow = 0.6,
  shimmer = true,
  interactive = true,
  className,
  ...props
}: HalftoneImageProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const image = useImage(src)
  const themeVersion = useThemeVersion()
  const palette = React.useRef<{ color: Rgb; accent: Rgb; light: boolean }>({
    color: [128, 128, 128],
    accent: [128, 128, 128],
    light: true,
  })
  const gl = React.useRef<{
    gl: WebGLRenderingContext
    program: WebGLProgram
    uniforms: Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>
    buffer: WebGLBuffer | null
    count: number
    key: string
  } | null>(null)
  const glFailed = React.useRef(false)
  const lens = React.useRef({ x: -9999, y: -9999, amount: 0 })
  const clock = React.useRef(0)
  const staticKey = React.useRef('')

  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const [c, a] = resolveColors(el, [color, accent])
    palette.current = { color: c, accent: a, light: onLightBackground(el) }
    staticKey.current = ''
  }, [color, accent, themeVersion])

  const raster = (cols: number, rows: number): Raster | null => {
    if (text) return rasterizeText(text, cols, rows, font)
    return image ? rasterizeImage(image, cols, rows, fit) : null
  }

  /** Dots as [x, y, value, random] in CSS px. */
  const buildDots = (width: number, height: number) => {
    const cols = Math.max(1, Math.floor(width / cellSize))
    const rows = Math.max(1, Math.floor(height / cellSize))
    const r = raster(cols, rows)
    if (!r) return null
    const big = dots === 'auto' ? (palette.current.light ? 'dark' : 'light') : dots
    const offsetX = (width - cols * cellSize) / 2
    const offsetY = (height - rows * cellSize) / 2
    const out: number[] = []
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const { luminance, alpha } = sampleAt(r, j * cols + i)
        const value = (big === 'dark' ? 1 - luminance : luminance) * alpha
        if (value < 0.04) continue
        out.push(
          offsetX + (i + 0.5) * cellSize,
          offsetY + (j + 0.5) * cellSize,
          value,
          hash01(i, j),
        )
      }
    }
    return new Float32Array(out)
  }

  const draw = (frame: EffectFrame) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { width, height, dpr, dt, pointer } = frame
    const { color: c, accent: a, light } = palette.current
    const key = [width, height, cellSize, dots, light, fit, text, image?.src].join('|')

    if (!glFailed.current && gl.current?.key !== key) {
      const data = buildDots(width, height)
      if (!data) return
      const old = gl.current
      if (old) old.gl.deleteBuffer(old.buffer)
      const created = old ?? createProgram(canvas, VERT, FRAG)
      if (!created) {
        glFailed.current = true
      } else {
        const uniforms = old?.uniforms ?? uniformsOf(created.gl, created.program, UNIFORMS)
        const buffer = bindAttributes(created.gl, created.program, data, [['aDot', 4]])
        gl.current = {
          gl: created.gl,
          program: created.program,
          uniforms,
          buffer,
          count: data.length / 4,
          key,
        }
      }
    }

    if (glFailed.current) {
      // No WebGL: a still halftone, redrawn only when something changes.
      const still = `${key}|${c}|${a}`
      if (staticKey.current === still) return
      const ctx = canvas.getContext('2d')
      const data = ctx && buildDots(width, height)
      if (!ctx || !data) return
      staticKey.current = still
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = rgba(c, 1)
      for (let k = 0; k < data.length; k += 4) {
        const d = cellSize * Math.sqrt(data[k + 2]) * 0.95
        if (shape === 'square') ctx.fillRect(data[k] - d / 2, data[k + 1] - d / 2, d, d)
        else {
          ctx.beginPath()
          ctx.arc(data[k], data[k + 1], d / 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      return
    }

    const state = gl.current
    if (!state) return
    clock.current = frame.still ? frame.time : clock.current + dt
    const ptr = lens.current
    if (pointer && dt > 0) {
      const follow = 1 - Math.exp(-dt * 16)
      if (pointer.inside) {
        if (ptr.amount < 0.01) {
          ptr.x = pointer.x
          ptr.y = pointer.y
        }
        ptr.x += (pointer.x - ptr.x) * follow
        ptr.y += (pointer.y - ptr.y) * follow
      }
      ptr.amount += ((pointer.inside ? 1 : 0) - ptr.amount) * (1 - Math.exp(-dt * 5))
    } else if (!pointer) ptr.amount = 0

    const { gl: g, uniforms: u } = state
    g.viewport(0, 0, canvas.width, canvas.height)
    g.clearColor(0, 0, 0, 0)
    g.clear(g.COLOR_BUFFER_BIT)
    g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA)
    g.uniform2f(u.uRes, width, height)
    g.uniform1f(u.uCell, cellSize)
    g.uniform1f(u.uPx, dpr)
    g.uniform1f(u.uTime, clock.current)
    g.uniform3f(u.uPointer, ptr.x, ptr.y, ptr.amount)
    g.uniform1f(u.uRadius, radius)
    g.uniform1f(u.uGrow, grow)
    g.uniform1f(u.uShimmer, shimmer && !frame.still ? 1 : 0)
    g.uniform3f(u.uColor, c[0] / 255, c[1] / 255, c[2] / 255)
    g.uniform3f(u.uAccent, a[0] / 255, a[1] / 255, a[2] / 255)
    g.uniform1f(u.uSquare, shape === 'square' ? 1 : 0)
    g.drawArrays(g.POINTS, 0, state.count)
  }

  useEffectLoop(rootRef, {
    interactive,
    resize: ({ width, height, dpr }) => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      staticKey.current = ''
    },
    draw,
  })

  return (
    <div
      ref={rootRef}
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      data-slot="halftone-image"
      className={cn('relative size-full overflow-hidden', className)}
      {...props}
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block size-full" />
    </div>
  )
}
