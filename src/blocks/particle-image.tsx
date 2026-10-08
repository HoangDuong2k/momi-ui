import * as React from 'react'
import { cn } from '../lib/cn'
import {
  bindAttributes,
  createProgram,
  rasterizeImage,
  rasterizeText,
  sampleAt,
  setBlend,
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

const RIPPLES = 4
const RIPPLE_LIFE = 2.2
const INTRO_SECONDS = 1.8

const VERT = `
attribute vec3 aHome;
attribute vec2 aInfo;
attribute vec3 aColor;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform vec2 uRot;
uniform float uPersp;
uniform float uTime;
uniform float uPx;
uniform float uSize;
uniform vec3 uPointer;
uniform float uScatter;
uniform vec3 uRipples[${RIPPLES}];
uniform float uIntro;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uImageColors;
uniform float uLight;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float value = aInfo.x;
  float r = aInfo.y;
  float t = uTime;
  vec3 p = aHome;
  // Idle: every particle breathes on its own
  p += vec3(sin(t * 0.6 + r * 40.0) * 1.1, cos(t * 0.5 + r * 31.0) * 1.1, sin(t * 0.4 + r * 17.0) * 4.0);
  // Intro: gather from a loose cloud, each particle at its own pace
  vec3 cloud = vec3((fract(r * 13.7) - 0.5) * uRes.x * 1.3, (fract(r * 7.9) - 0.5) * uRes.y * 1.3,
    (fract(r * 3.3) - 0.5) * 700.0);
  float k = clamp(uIntro * 1.6 - r * 0.6, 0.0, 1.0);
  p = mix(cloud, p, 1.0 - pow(1.0 - k, 3.0));
  // Turn towards the pointer: yaw around the vertical axis, then pitch around the horizontal one
  float cy = cos(uRot.x);
  float sy = sin(uRot.x);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  float cx = cos(uRot.y);
  float sx = sin(uRot.y);
  p = vec3(p.x, cx * p.y - sx * p.z, sx * p.y + cx * p.z);
  float s = uPersp / max(uPersp - p.z, 1.0);
  vec2 screen = uCenter + p.xy * s;
  // Particles right by the pointer drift aside and light up
  vec2 dp = screen - uPointer.xy;
  float d = length(dp) + 0.001;
  float push = uPointer.z * exp(-(d * d) / (2.0 * uScatter * uScatter));
  screen += dp / d * push * uScatter * 0.18;
  float boost = push;
  for (int i = 0; i < ${RIPPLES}; i++) {
    vec3 rp = uRipples[i];
    if (rp.z >= 0.0) {
      vec2 dr = screen - rp.xy;
      float dd = length(dr) + 0.001;
      float q = (dd - rp.z * 520.0) / 36.0;
      float ring = exp(-q * q) * exp(-rp.z * 1.6);
      screen += dr / dd * ring * 16.0;
      boost += ring * 0.8;
    }
  }
  vec3 col = mix(mix(uColorA, uColorB, value), aColor, uImageColors);
  vec3 hot = mix(vec3(1.0), col * 0.6, uLight);
  vColor = mix(col, hot, clamp(boost * 0.6, 0.0, 1.0));
  float twinkle = 0.82 + 0.18 * sin(t * 2.1 + r * 50.0);
  vAlpha = clamp((0.22 + 0.78 * value) * twinkle * (0.55 + 0.45 * k) * (1.0 + 0.4 * uLight) + boost * 0.4, 0.0, 1.0);
  gl_PointSize = uSize * (0.5 + value * 0.9) * clamp(s, 0.5, 1.8) * (1.0 + boost * 0.6) * uPx;
  vec2 clip = screen / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`

const FRAG = `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(q, q);
  if (r2 > 1.0) discard;
  float a = vAlpha * pow(1.0 - r2, 1.3);
  gl_FragColor = vec4(vColor * a, a);
}`

const UNIFORMS = [
  'uRes',
  'uCenter',
  'uRot',
  'uPersp',
  'uTime',
  'uPx',
  'uSize',
  'uPointer',
  'uScatter',
  'uRipples',
  'uIntro',
  'uColorA',
  'uColorB',
  'uImageColors',
  'uLight',
] as const

export interface ParticleImageProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** The image to build from particles (same-origin, or served with CORS headers). */
  src?: string
  /** A line of text to build from particles instead of an image. */
  text?: string
  /** CSS font (weight and family, no size) of `text`. @default '700 system-ui, sans-serif' */
  font?: string
  /** Accessible description. Without it the effect is decorative (hidden from screen readers). */
  alt?: string
  /** Colors from dim to bright parts. Any CSS color or theme variable. @default ['#6f8fff', '#ffffff'] */
  colors?: string[]
  /** Use the image's own colors instead of `colors`. @default false */
  imageColors?: boolean
  /** Distance between sampled particles, in px (smaller = more particles). @default 2.5 */
  spacing?: number
  /** Particle size, in px. @default 1.6 */
  size?: number
  /** Relief: brighter parts stand out towards the viewer. 0 = flat. @default 1 */
  depth?: number
  /** Largest turn towards the pointer, in degrees. 0 = no turning. @default 18 */
  tilt?: number
  /** Radius around the pointer where particles drift aside, in px. @default 60 */
  scatter?: number
  /** @default 'contain' */
  fit?: MediaFit
  /** Gather from a cloud when first shown. @default true */
  intro?: boolean
  /** Turning, drifting aside and ripples on press. @default true */
  interactive?: boolean
  /** `add` for dark backgrounds, `normal` for light ones, `auto` picks and follows the theme. @default 'auto' */
  blend?: 'auto' | 'add' | 'normal'
}

const DEFAULT_COLORS = ['#6f8fff', '#ffffff']
const MAX_PARTICLES = 32000

interface GlState {
  gl: WebGLRenderingContext
  program: WebGLProgram
  uniforms: Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>
  buffer: WebGLBuffer | null
  count: number
  key: string
}

/**
 * An image (or a line of text) built from thousands of particles with relief, that turns gently
 * towards the pointer like a sculpture; particles by the pointer drift aside and a press sends a
 * ripple. WebGL, with a still 2-D fallback. Fills its parent; give the parent a size.
 */
export function ParticleImage({
  src,
  text,
  font = '700 system-ui, sans-serif',
  alt,
  colors = DEFAULT_COLORS,
  imageColors = false,
  spacing = 2.5,
  size = 1.6,
  depth = 1,
  tilt = 18,
  scatter = 60,
  fit = 'contain',
  intro = true,
  interactive = true,
  blend = 'auto',
  className,
  ...props
}: ParticleImageProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const image = useImage(src)
  const themeVersion = useThemeVersion()
  const palette = React.useRef<{ a: Rgb; b: Rgb; light: boolean }>({
    a: [111, 143, 255],
    b: [255, 255, 255],
    light: false,
  })
  const glState = React.useRef<GlState | null>(null)
  const glFailed = React.useRef(false)
  const staticKey = React.useRef('')
  const clock = React.useRef(0)
  const introStart = React.useRef<number | null>(null)
  const rotation = React.useRef({ yaw: 0, pitch: 0 })
  const lens = React.useRef({ x: -9999, y: -9999, amount: 0 })
  const ripples = React.useRef<{ x: number; y: number; t0: number }[]>([])
  const colorKey = colors.join('|')

  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const values = colorKey.split('|')
    const [a, b] = resolveColors(el, [values[0], values[1] ?? values[0]])
    palette.current = { a, b, light: blend === 'auto' ? onLightBackground(el) : blend === 'normal' }
    staticKey.current = ''
  }, [colorKey, blend, themeVersion])

  const raster = (cols: number, rows: number): Raster | null => {
    if (text) return rasterizeText(text, cols, rows, font)
    return image ? rasterizeImage(image, cols, rows, fit) : null
  }

  /** Particles as [x, y, z, value, random, r, g, b], positions in px around the box centre. */
  const build = (width: number, height: number) => {
    let step = spacing
    // Keep the particle count bounded on large boxes.
    while ((width / step) * (height / step) * 0.45 > MAX_PARTICLES) step *= 1.2
    const cols = Math.max(1, Math.floor(width / step))
    const rows = Math.max(1, Math.floor(height / step))
    const r = raster(cols, rows)
    if (!r) return null
    const relief = Math.min(width, height) * 0.22 * depth
    const out: number[] = []
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const sample = sampleAt(r, j * cols + i)
        // Stretch the tones so features read: highlights dense and bright, shadows sparse.
        const tone = Math.min(1, Math.max(0, (sample.luminance - 0.08) / 0.84))
        const value = (0.12 + 0.88 * tone * tone * (3 - 2 * tone)) * sample.alpha
        if (value < 0.05 || hash01(i * 7 + 3, j * 13 + 1) > value ** 1.1) continue
        const jitter = (hash01(i, j) - 0.5) * step
        out.push(
          (i + 0.5) * step - (cols * step) / 2 + jitter,
          (j + 0.5) * step - (rows * step) / 2 + (hash01(j, i) - 0.5) * step,
          (sample.luminance - 0.5) * 2 * relief,
          value,
          hash01(i * 31 + j, 99),
          sample.r / 255,
          sample.g / 255,
          sample.b / 255,
        )
      }
    }
    return new Float32Array(out)
  }

  const draw = (frame: EffectFrame) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { width, height, dpr, dt, pointer } = frame
    const colorsNow = palette.current
    const key = [width, height, spacing, depth, fit, text, image?.src].join('|')

    if (!glFailed.current && glState.current?.key !== key) {
      const data = build(width, height)
      if (!data) return
      const old = glState.current
      if (old) old.gl.deleteBuffer(old.buffer)
      const created = old ?? createProgram(canvas, VERT, FRAG)
      if (!created) glFailed.current = true
      else {
        const uniforms = old?.uniforms ?? uniformsOf(created.gl, created.program, UNIFORMS)
        const buffer = bindAttributes(created.gl, created.program, data, [
          ['aHome', 3],
          ['aInfo', 2],
          ['aColor', 3],
        ])
        glState.current = { ...created, uniforms, buffer, count: data.length / 8, key }
        if (introStart.current === null) introStart.current = clock.current
      }
    }

    if (glFailed.current) {
      const still = `${key}|${colorsNow.a}|${colorsNow.b}|${imageColors}`
      if (staticKey.current === still) return
      const ctx = canvas.getContext('2d')
      const data = ctx && build(width, height)
      if (!ctx || !data) return
      staticKey.current = still
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      for (let k = 0; k < data.length; k += 8) {
        const v = data[k + 3]
        const c: Rgb = imageColors
          ? [data[k + 5] * 255, data[k + 6] * 255, data[k + 7] * 255]
          : [
              colorsNow.a[0] + (colorsNow.b[0] - colorsNow.a[0]) * v,
              colorsNow.a[1] + (colorsNow.b[1] - colorsNow.a[1]) * v,
              colorsNow.a[2] + (colorsNow.b[2] - colorsNow.a[2]) * v,
            ]
        ctx.fillStyle = rgba(c, 0.3 + 0.7 * v)
        const d = size * (0.6 + v * 0.9)
        ctx.fillRect(width / 2 + data[k] - d / 2, height / 2 + data[k + 1] - d / 2, d, d)
      }
      return
    }

    const state = glState.current
    if (!state) return
    clock.current = frame.still ? frame.time : clock.current + dt
    const t = clock.current
    const introAmount =
      !intro || frame.still ? 1 : Math.min(1, (t - (introStart.current ?? t)) / INTRO_SECONDS)

    // Turn towards the pointer while it is in the window; back to facing forward otherwise.
    const rot = rotation.current
    const maxTurn = (tilt * Math.PI) / 180
    let targetYaw = 0
    let targetPitch = 0
    if (pointer?.active) {
      targetYaw = Math.max(-1, Math.min(1, (pointer.x - width / 2) / (width * 0.75))) * maxTurn
      targetPitch =
        -Math.max(-1, Math.min(1, (pointer.y - height / 2) / (height * 0.75))) * maxTurn * 0.7
    }
    const ease = dt > 0 ? 1 - Math.exp(-dt * 3) : 1
    rot.yaw += (targetYaw - rot.yaw) * ease
    rot.pitch += (targetPitch - rot.pitch) * ease

    const ptr = lens.current
    if (pointer && dt > 0) {
      if (pointer.inside) {
        if (ptr.amount < 0.01) {
          ptr.x = pointer.x
          ptr.y = pointer.y
        }
        const follow = 1 - Math.exp(-dt * 12)
        ptr.x += (pointer.x - ptr.x) * follow
        ptr.y += (pointer.y - ptr.y) * follow
      }
      ptr.amount += ((pointer.inside ? 1 : 0) - ptr.amount) * (1 - Math.exp(-dt * 4))
    } else if (!pointer) ptr.amount = 0
    while (ripples.current.length && t - ripples.current[0].t0 > RIPPLE_LIFE)
      ripples.current.shift()

    const { gl, uniforms: u } = state
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    setBlend(gl, colorsNow.light)
    gl.uniform2f(u.uRes, width, height)
    gl.uniform2f(u.uCenter, width / 2, height / 2)
    gl.uniform2f(u.uRot, rot.yaw, rot.pitch)
    gl.uniform1f(u.uPersp, Math.max(width, height) * 1.6)
    gl.uniform1f(u.uTime, t)
    gl.uniform1f(u.uPx, dpr)
    gl.uniform1f(u.uSize, size)
    gl.uniform3f(u.uPointer, ptr.x, ptr.y, ptr.amount)
    gl.uniform1f(u.uScatter, scatter)
    const rip = new Float32Array(RIPPLES * 3).fill(-1)
    ripples.current.slice(-RIPPLES).forEach((r, i) => {
      rip[i * 3] = r.x
      rip[i * 3 + 1] = r.y
      rip[i * 3 + 2] = t - r.t0
    })
    gl.uniform3fv(u.uRipples, rip)
    gl.uniform1f(u.uIntro, introAmount)
    gl.uniform3f(u.uColorA, colorsNow.a[0] / 255, colorsNow.a[1] / 255, colorsNow.a[2] / 255)
    gl.uniform3f(u.uColorB, colorsNow.b[0] / 255, colorsNow.b[1] / 255, colorsNow.b[2] / 255)
    gl.uniform1f(u.uImageColors, imageColors ? 1 : 0)
    gl.uniform1f(u.uLight, colorsNow.light ? 1 : 0)
    gl.drawArrays(gl.POINTS, 0, state.count)
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
    press: (x, y) => {
      ripples.current.push({ x, y, t0: clock.current })
      if (ripples.current.length > RIPPLES) ripples.current.shift()
    },
  })

  return (
    <div
      ref={rootRef}
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      data-slot="particle-image"
      className={cn('relative size-full overflow-hidden', className)}
      {...props}
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block size-full" />
    </div>
  )
}
