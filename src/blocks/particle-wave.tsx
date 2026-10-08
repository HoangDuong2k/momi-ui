import * as React from 'react'
import { cn } from '../lib/cn'
import {
  mixRgb,
  onLightBackground,
  resolveColors,
  rgba,
  useEffectLoop,
  useThemeVersion,
  type EffectFrame,
  type Rgb,
} from './internal/effect-runtime'

const RIPPLES = 4
const RIPPLE_LIFE = 2.6
const TAU = Math.PI * 2
const WHITE: Rgb = [255, 255, 255]

const VERT = `
attribute vec3 aGrid;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uBox;
uniform float uCurve;
uniform float uThick;
uniform float uTwist;
uniform vec3 uPointer;
uniform vec3 uRipples[${RIPPLES}];
uniform float uPx;
uniform float uSize;
uniform float uGlow;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uLight;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float u = aGrid.x;
  float v = aGrid.y;
  float r = aGrid.z;
  float s = u * 2.0 - 1.0;
  float t = uTime;
  // Centre line: curved by uCurve (1 = smile, lowest in the middle; -1 = arch; 0 = flat)
  float x = uBox.x + s * uRes.x * 0.56;
  float y = uBox.y - uBox.z * uCurve * pow(abs(s), 1.7);
  // The band twists slowly around the centre line; its front face is brighter
  float tw = s * 2.6 * uTwist + t * 0.2;
  float across = v - 0.5;
  float thick = uBox.z * (0.24 + 0.36 * abs(s)) * uThick;
  y += across * thick * (0.5 + 0.5 * cos(tw));
  x += across * thick * 0.3 * sin(tw);
  float front = across * sin(tw) + 0.5;
  // Small waves drift along the band; each row is out of phase, so rows weave into strands
  y += uBox.z * (0.45 + 0.55 * abs(s)) * (0.05 * sin(6.2832 * (1.6 * u - 0.1 * t) + v * 2.5)
    + 0.03 * sin(6.2832 * (4.1 * u + 0.16 * t) + v * 5.0) + 0.035 * sin(6.2832 * (2.3 * u + 0.13 * t) + v * 9.0));
  x += (r - 0.5) * 4.0;
  y += (fract(r * 7.31) - 0.5) * 4.0;
  vec2 p = vec2(x, y);
  // Pointer: particles part around a soft lens and light up
  vec2 dp = p - uPointer.xy;
  float d = length(dp) + 0.001;
  float lens = uPointer.z * exp(-(d * d) / (2.0 * 90.0 * 90.0));
  p += dp / d * lens * 26.0;
  float boost = lens;
  // Press ripples: a ring spreads out, pushing particles and lighting them
  for (int i = 0; i < ${RIPPLES}; i++) {
    vec3 rp = uRipples[i];
    if (rp.z >= 0.0) {
      vec2 dr = p - rp.xy;
      float dd = length(dr) + 0.001;
      float k = (dd - rp.z * 640.0) / 40.0;
      float ring = exp(-k * k) * exp(-rp.z * 1.4);
      p += dr / dd * ring * 18.0;
      boost += ring * 0.9;
    }
  }
  float core = exp(-s * s * 12.0);
  float a = (0.3 + 0.95 * core) * (0.5 + 0.8 * front);
  a *= 0.78 + 0.22 * sin(t * 1.7 + r * 40.0);
  a += boost * 0.65;
  a *= smoothstep(1.0, 0.8, abs(s));
  vec3 col = mix(uColorA, uColorB, smoothstep(0.8, 0.15, abs(s)));
  // The bright core turns white on dark backgrounds, a deeper shade on light ones
  vec3 hot = mix(vec3(1.0, 0.96, 1.0), col * 0.62, uLight);
  col = mix(col, hot, clamp(core * 0.55 + boost * 0.45, 0.0, 1.0));
  vColor = col;
  vAlpha = clamp(a * (1.0 + 0.35 * uLight), 0.0, 1.0) * mix(1.0, 0.16, uGlow);
  gl_PointSize = (1.3 + 1.5 * front + core * 1.2 + boost * 1.6) * uSize * uPx * mix(1.0, 3.6, uGlow);
  vec2 clip = p / uRes * 2.0 - 1.0;
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
  float a = vAlpha * pow(1.0 - r2, 1.6);
  gl_FragColor = vec4(vColor * a, a);
}`

const UNIFORMS = [
  'uRes',
  'uTime',
  'uBox',
  'uCurve',
  'uThick',
  'uTwist',
  'uPointer',
  'uRipples',
  'uPx',
  'uSize',
  'uGlow',
  'uColorA',
  'uColorB',
  'uLight',
] as const

interface GlState {
  gl: WebGLRenderingContext
  program: WebGLProgram
  buffer: WebGLBuffer | null
  uniforms: Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>
  count: number
  glowCount: number
  grid: string
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
}

function createGl(canvas: HTMLCanvasElement, cols: number, rows: number): GlState | null {
  let gl: WebGLRenderingContext | null = null
  try {
    gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false })
  } catch {
    return null
  }
  if (!gl) return null
  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  const program = gl.createProgram()
  if (!vs || !fs || !program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)
  // Grid of particles: u along the band, v across it, a random number each. Rows divisible by 3
  // come first, so the glow pass can draw a third of the particles spread evenly over the band.
  const data = new Float32Array(cols * rows * 3)
  const order = Array.from({ length: rows }, (_, j) => j).sort((a, b) => (a % 3) - (b % 3) || a - b)
  let k = 0
  for (const j of order) {
    for (let i = 0; i < cols; i++) {
      data[k++] = i / (cols - 1)
      data[k++] = j / (rows - 1)
      data[k++] = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1
    }
  }
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  const aGrid = gl.getAttribLocation(program, 'aGrid')
  gl.enableVertexAttribArray(aGrid)
  gl.vertexAttribPointer(aGrid, 3, gl.FLOAT, false, 0, 0)
  gl.enable(gl.BLEND)
  const uniforms = Object.fromEntries(
    UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)]),
  ) as GlState['uniforms']
  return {
    gl,
    program,
    buffer,
    uniforms,
    count: cols * rows,
    glowCount: Math.ceil(rows / 3) * cols,
    grid: `${cols}x${rows}`,
  }
}

interface Box {
  cx: number
  cy: number
  size: number
}

interface Palette {
  a: Rgb
  b: Rgb
  light: boolean
}

/** Glow, rays and thin rings behind the band (2-D canvas, redrawn when the layout changes). */
function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  { cx, cy, size }: Box,
  { a, b, light }: Palette,
  glow: boolean,
  backdrop: boolean,
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  const soft = mixRgb(b, WHITE, 0.35)
  if (glow) {
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.8)
    halo.addColorStop(0, light ? rgba(b, 0.24) : rgba(mixRgb(b, WHITE, 0.92), 0.42))
    halo.addColorStop(0.08, rgba(light ? b : soft, light ? 0.16 : 0.32))
    halo.addColorStop(0.4, rgba(b, light ? 0.06 : 0.1))
    halo.addColorStop(1, rgba(mixRgb(a, b, 0.5), 0))
    ctx.fillStyle = halo
    ctx.fillRect(0, 0, width, height)
  }
  if (backdrop) {
    // Rays rising from the centre
    for (let i = 0; i < 46; i++) {
      const k = (i + 0.5) / 46
      const angle = Math.PI + 0.25 + k * (Math.PI - 0.5)
      const length =
        size * (0.14 + 0.32 * Math.abs(Math.sin(i * 12.9898) * 0.5 + Math.sin(i * 4.1) * 0.5))
      const x0 = cx + Math.cos(angle) * 3
      const y0 = cy + Math.sin(angle) * 3
      const x1 = x0 + Math.cos(angle) * length
      const y1 = y0 + Math.sin(angle) * length
      const ray = ctx.createLinearGradient(x0, y0, x1, y1)
      ray.addColorStop(0, light ? rgba(b, 0.4) : rgba(mixRgb(b, WHITE, 0.9), 0.6))
      ray.addColorStop(1, rgba(soft, 0))
      ctx.strokeStyle = ray
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y1)
      ctx.stroke()
    }
  }
  if (glow) {
    const hot = ctx.createRadialGradient(cx, cy, 0, cx, cy, 34)
    hot.addColorStop(0, light ? rgba(b, 0.35) : rgba(mixRgb(b, WHITE, 0.95), 0.85))
    hot.addColorStop(0.3, rgba(light ? b : mixRgb(b, WHITE, 0.6), light ? 0.16 : 0.35))
    hot.addColorStop(1, rgba(b, 0))
    ctx.fillStyle = hot
    ctx.fillRect(cx - 34, cy - 34, 68, 68)
  }
  if (backdrop) {
    // A faint globe: a ring touching the bright centre, a meridian, a wide orbit and a small cap
    const line = light ? b : mixRgb(b, WHITE, 0.85)
    const strength = light ? 1.5 : 1
    const R = size * 0.62
    const oy = cy - R
    ctx.lineWidth = 1
    ctx.strokeStyle = rgba(line, 0.11 * strength)
    ctx.beginPath()
    ctx.arc(cx, oy, R, 0, TAU)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(cx, oy, R * 0.56, R, 0, 0, TAU)
    ctx.stroke()
    ctx.strokeStyle = rgba(line, 0.08 * strength)
    ctx.beginPath()
    ctx.ellipse(cx, oy, R * 1.55, R * 0.9, 0, 0, TAU)
    ctx.stroke()
    ctx.strokeStyle = rgba(line, 0.13 * strength)
    ctx.beginPath()
    ctx.arc(cx, oy - R + R * 0.17, R * 0.15, 0, TAU)
    ctx.stroke()
  }
}

export interface ParticleWaveProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /**
   * Colors of the wave's ends and middle. Any CSS color, including theme variables
   * (`'var(--primary)'`). One color tints the whole wave. @default ['#62d0ff', '#b48cff']
   */
  colors?: string[]
  /** `smile`: lowest in the middle, ends rising; `arch`: the opposite; `flat`. @default 'smile' */
  shape?: 'smile' | 'arch' | 'flat'
  /**
   * Put the middle of the wave just below this element (e.g. the hero's text block) and size it
   * to follow the element. Without it, the wave is placed with `origin`.
   */
  anchor?: React.RefObject<HTMLElement | null>
  /** Gap between the anchor's bottom edge and the middle of the wave, in px. @default 84 */
  anchorOffset?: number
  /** Middle of the wave, as fractions of the effect's box. @default { x: 0.5, y: 0.7 } */
  origin?: { x?: number; y?: number }
  /** Size of the curve and the band. @default 1 */
  scale?: number
  /** @default 1 */
  thickness?: number
  /** How much the band twists. @default 1 */
  twist?: number
  /** @default 1 */
  speed?: number
  /** Particle count multiplier (halved on narrow screens). @default 1 */
  density?: number
  /** Soft halo around the particles and a glow at the centre. Dropped on slow devices. @default true */
  glow?: boolean
  /** Rays and faint rings behind the wave. @default true */
  backdrop?: boolean
  /** Particles part around the pointer; a press sends a ripple along the band. @default true */
  interactive?: boolean
  /**
   * `add`: light adds up, for dark backgrounds; `normal`: for light backgrounds; `auto` picks from
   * the background behind the effect, and follows theme changes. @default 'auto'
   */
  blend?: 'auto' | 'add' | 'normal'
}

const DEFAULT_COLORS = ['#62d0ff', '#b48cff']
const NO_ORIGIN: NonNullable<ParticleWaveProps['origin']> = {}

/**
 * A ribbon of thousands of glowing particles that curves, twists and ripples slowly — a hero
 * background drawn with WebGL. Place it inside a `relative` (and `isolate`) parent. It pauses
 * off screen, drops its glow on slow devices, uses fewer particles on narrow screens and shows a
 * still frame with reduced motion. Without WebGL only the backdrop is drawn.
 */
export function ParticleWave({
  colors = DEFAULT_COLORS,
  shape = 'smile',
  anchor,
  anchorOffset,
  origin = NO_ORIGIN,
  scale = 1,
  thickness = 1,
  twist = 1,
  speed = 1,
  density = 1,
  glow = true,
  backdrop = true,
  interactive = true,
  blend = 'auto',
  className,
  ...props
}: ParticleWaveProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const glRef = React.useRef<HTMLCanvasElement>(null)
  const artRef = React.useRef<HTMLCanvasElement>(null)
  const glState = React.useRef<GlState | null>(null)
  // No WebGL (or a shader the GPU rejects): stop retrying until the context is restored.
  const glFailed = React.useRef(false)
  const palette = React.useRef<Palette>({ a: [98, 208, 255], b: [180, 140, 255], light: false })
  const lastArt = React.useRef('')
  const clock = React.useRef(0)
  const lens = React.useRef({ x: -9999, y: -9999, amount: 0 })
  const ripples = React.useRef<{ x: number; y: number; t0: number }[]>([])
  const themeVersion = useThemeVersion()
  const colorKey = colors.join('|')

  // Colors and blend mode follow the theme.
  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const values = colorKey.split('|')
    const [a, b] = resolveColors(el, [values[0], values[1] ?? values[0]])
    palette.current = { a, b, light: blend === 'auto' ? onLightBackground(el) : blend === 'normal' }
    lastArt.current = ''
  }, [colorKey, blend, themeVersion])

  // WebGL survives a lost context (GPU reset, too many contexts): rebuilt on restore.
  React.useEffect(() => {
    const canvas = glRef.current
    if (!canvas) return
    const lost = (event: Event) => {
      event.preventDefault()
      glState.current = null
    }
    const restored = () => {
      lastArt.current = ''
      glFailed.current = false
      glState.current = null // recreated on the next frame
    }
    canvas.addEventListener('webglcontextlost', lost)
    canvas.addEventListener('webglcontextrestored', restored)
    return () => {
      canvas.removeEventListener('webglcontextlost', lost)
      canvas.removeEventListener('webglcontextrestored', restored)
    }
  }, [])

  const layout = (width: number, height: number): Box => {
    const root = rootRef.current
    const target = anchor?.current
    const narrow = width < 640
    if (root && target) {
      const r = root.getBoundingClientRect()
      const t = target.getBoundingClientRect()
      return {
        cx: t.left + t.width / 2 - r.left,
        cy: t.bottom - r.top + (anchorOffset ?? (narrow ? 76 : 84)),
        size: Math.min(t.height * 0.9, width * 0.36) * scale,
      }
    }
    return {
      cx: width * (origin.x ?? 0.5),
      cy: height * (origin.y ?? 0.7),
      size: Math.min(height * 0.45, width * 0.36) * scale,
    }
  }

  const draw = (frame: EffectFrame) => {
    const canvas = glRef.current
    const art = artRef.current
    if (!canvas || !art) return
    const { width, height, dpr, dt } = frame
    const box = layout(width, height)
    const colorsNow = palette.current
    const artKey = [
      box.cx,
      box.cy,
      box.size,
      width,
      height,
      glow,
      backdrop,
      colorsNow.light,
      colorsNow.a,
      colorsNow.b,
    ]
      .map((v) => (typeof v === 'number' ? v.toFixed(1) : String(v)))
      .join(',')
    if (artKey !== lastArt.current) {
      const ctx = art.getContext('2d')
      if (ctx) drawBackdrop(ctx, width, height, dpr, box, colorsNow, glow, backdrop)
      lastArt.current = artKey
    }

    const narrow = width < 640
    const cols = Math.max(24, Math.round((narrow ? 160 : 300) * density))
    const rows = Math.max(6, Math.round((narrow ? 28 : 56) * density))
    if (!glFailed.current && glState.current?.grid !== `${cols}x${rows}`) {
      const old = glState.current
      if (old) {
        old.gl.deleteBuffer(old.buffer)
        old.gl.deleteProgram(old.program)
      }
      glState.current = createGl(canvas, cols, rows)
      glFailed.current = glState.current === null
    }
    const state = glState.current
    if (!state) return

    clock.current = frame.still ? frame.time : clock.current + dt * speed
    const t = clock.current
    const pointer = frame.pointer
    const ptr = lens.current
    if (pointer && dt > 0) {
      const follow = 1 - Math.exp(-dt * 14)
      if (pointer.inside) {
        if (ptr.amount < 0.01) {
          ptr.x = pointer.x
          ptr.y = pointer.y
        } else {
          ptr.x += (pointer.x - ptr.x) * follow
          ptr.y += (pointer.y - ptr.y) * follow
        }
      }
      ptr.amount += ((pointer.inside ? 1 : 0) - ptr.amount) * (1 - Math.exp(-dt * 4))
    } else if (!pointer) {
      ptr.amount = 0
    }
    while (ripples.current.length && t - ripples.current[0].t0 > RIPPLE_LIFE)
      ripples.current.shift()

    const { gl, uniforms: u } = state
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    // Light adds up on dark backgrounds; premultiplied "over" on light ones.
    if (colorsNow.light) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    else gl.blendFunc(gl.ONE, gl.ONE)
    gl.uniform2f(u.uRes, width, height)
    gl.uniform1f(u.uTime, t)
    gl.uniform3f(u.uBox, box.cx, box.cy, box.size)
    gl.uniform1f(u.uCurve, shape === 'smile' ? 1 : shape === 'arch' ? -1 : 0)
    gl.uniform1f(u.uThick, thickness)
    gl.uniform1f(u.uTwist, twist)
    gl.uniform3f(u.uPointer, ptr.x, ptr.y, ptr.amount)
    const rip = new Float32Array(RIPPLES * 3).fill(-1)
    ripples.current.slice(-RIPPLES).forEach((r, i) => {
      rip[i * 3] = r.x
      rip[i * 3 + 1] = r.y
      rip[i * 3 + 2] = t - r.t0
    })
    gl.uniform3fv(u.uRipples, rip)
    gl.uniform1f(u.uPx, dpr)
    gl.uniform1f(u.uSize, narrow ? 0.9 : 1)
    gl.uniform3f(u.uColorA, colorsNow.a[0] / 255, colorsNow.a[1] / 255, colorsNow.a[2] / 255)
    gl.uniform3f(u.uColorB, colorsNow.b[0] / 255, colorsNow.b[1] / 255, colorsNow.b[2] / 255)
    gl.uniform1f(u.uLight, colorsNow.light ? 1 : 0)
    if (glow && frame.quality === 'high') {
      gl.uniform1f(u.uGlow, 1)
      gl.drawArrays(gl.POINTS, 0, state.glowCount)
    }
    gl.uniform1f(u.uGlow, 0)
    gl.drawArrays(gl.POINTS, 0, state.count)
  }

  useEffectLoop(rootRef, {
    interactive,
    resize: ({ width, height, dpr }) => {
      for (const canvas of [glRef.current, artRef.current]) {
        if (!canvas) continue
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
      }
      lastArt.current = ''
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
      aria-hidden
      data-slot="particle-wave"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
      {...props}
    >
      <canvas ref={artRef} className="absolute inset-0 block size-full" />
      <canvas ref={glRef} className="absolute inset-0 block size-full" />
    </div>
  )
}
