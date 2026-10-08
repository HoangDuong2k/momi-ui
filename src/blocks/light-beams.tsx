import * as React from 'react'
import { cn } from '../lib/cn'
import { createProgram, setBlend, uniformsOf } from './internal/effect-media'
import {
  hash01,
  onLightBackground,
  resolveColors,
  rgba,
  useEffectLoop,
  useThemeVersion,
  type EffectFrame,
  type Rgb,
} from './internal/effect-runtime'

const MAX_BEAMS = 6

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uAngle;
uniform float uCount;
uniform vec3 uColors[${MAX_BEAMS}];
uniform float uIntensity;
uniform float uLight;

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float c = cos(uAngle);
  float s = sin(uAngle);
  // x runs across the beams, y along them
  vec2 q = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  float span = uRes.x / uRes.y + 0.6;
  vec3 col = vec3(0.0);
  float glow = 0.0;
  for (int i = 0; i < ${MAX_BEAMS}; i++) {
    float fi = float(i);
    if (fi >= uCount) break;
    float seed = hash(fi * 7.13 + 1.0);
    float centre = ((fi + 0.5) / uCount - 0.5) * span + 0.14 * sin(uTime * 0.07 * (0.6 + seed) + seed * 6.28);
    float width = 0.05 + 0.13 * seed + 0.025 * sin(uTime * 0.11 + fi * 1.7);
    float d = (q.x - centre) / width;
    // Soft band, broken along its length by a slow travelling shimmer
    float band = exp(-d * d);
    float along = 0.5 + 0.5 * sin(q.y * (2.0 + seed * 2.0) + uTime * 0.16 * (0.5 + seed) + seed * 10.0);
    float g = band * (0.35 + 0.65 * along) * (0.4 + 0.6 * seed);
    col += uColors[i] * g;
    glow += g;
  }
  float vignette = smoothstep(1.25, 0.15, length(p * vec2(0.75, 1.0)));
  float k = uIntensity * vignette * mix(1.0, 0.5, uLight);
  float a = clamp(glow * k, 0.0, 1.0);
  col = col * k;
  // A touch of noise against banding in the smooth gradients
  float n = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 128.0;
  gl_FragColor = vec4(max(col + n, 0.0), a);
}`

const UNIFORMS = ['uRes', 'uTime', 'uAngle', 'uCount', 'uColors', 'uIntensity', 'uLight'] as const

export interface LightBeamsProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** Beam colors, used in turn. Any CSS color or theme variable. @default ['#3b6cff', '#7c4dff', '#22b8ff'] */
  colors?: string[]
  /** Number of beams (up to 6). @default 5 */
  count?: number
  /** Direction of the beams, in degrees from vertical. @default 25 */
  angle?: number
  /** @default 1 */
  speed?: number
  /** @default 1 */
  intensity?: number
  /** `add` for dark backgrounds, `normal` for light ones, `auto` picks and follows the theme. @default 'auto' */
  blend?: 'auto' | 'add' | 'normal'
}

const DEFAULT_COLORS = ['#3b6cff', '#7c4dff', '#22b8ff']

/**
 * Soft beams of light drifting slowly across a section, like stage light through haze. No
 * pointer interaction. Drawn by a shader at half resolution; pauses off screen; still with reduced
 * motion; static gradients without WebGL. Place it inside a `relative` (and `isolate`) parent.
 */
export function LightBeams({
  colors = DEFAULT_COLORS,
  count = 5,
  angle = 25,
  speed = 1,
  intensity = 1,
  blend = 'auto',
  className,
  ...props
}: LightBeamsProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const themeVersion = useThemeVersion()
  const palette = React.useRef<{ colors: Rgb[]; light: boolean }>({ colors: [], light: false })
  const glState = React.useRef<{
    gl: WebGLRenderingContext
    uniforms: Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>
  } | null>(null)
  const glFailed = React.useRef(false)
  const staticKey = React.useRef('')
  const clock = React.useRef(0)
  const beams = Math.max(1, Math.min(MAX_BEAMS, Math.round(count)))
  const colorKey = colors.join('|')

  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    palette.current = {
      colors: resolveColors(el, colorKey.split('|')),
      light: blend === 'auto' ? onLightBackground(el) : blend === 'normal',
    }
    staticKey.current = ''
  }, [colorKey, blend, themeVersion])

  const draw = (frame: EffectFrame) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { colors: list, light } = palette.current
    if (!list.length) return
    const beamColors = Array.from({ length: MAX_BEAMS }, (_, i) => list[i % list.length])

    if (!glState.current && !glFailed.current) {
      const created = createProgram(canvas, VERT, FRAG)
      if (!created) glFailed.current = true
      else {
        const { gl, program } = created
        // One triangle covering the canvas.
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
        const aPos = gl.getAttribLocation(program, 'aPos')
        gl.enableVertexAttribArray(aPos)
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
        glState.current = { gl, uniforms: uniformsOf(gl, program, UNIFORMS) }
      }
    }

    if (glFailed.current) {
      // No WebGL: the beams once, as static gradients.
      const key = `${canvas.width}x${canvas.height}|${beams}|${angle}|${list}|${light}`
      if (staticKey.current === key) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      staticKey.current = key
      const { width: w, height: h } = canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = light ? 'source-over' : 'lighter'
      ctx.translate(w / 2, h / 2)
      ctx.rotate((angle * Math.PI) / 180)
      const span = Math.hypot(w, h)
      for (let i = 0; i < beams; i++) {
        const x = ((i + 0.5) / beams - 0.5) * span * 0.9
        const width = span * (0.03 + 0.07 * hash01(i, 3))
        const g = ctx.createLinearGradient(x - width, 0, x + width, 0)
        g.addColorStop(0, rgba(beamColors[i], 0))
        g.addColorStop(0.5, rgba(beamColors[i], light ? 0.18 : 0.35))
        g.addColorStop(1, rgba(beamColors[i], 0))
        ctx.fillStyle = g
        ctx.fillRect(x - width, -span / 2, width * 2, span)
      }
      ctx.globalCompositeOperation = 'source-over'
      return
    }

    const state = glState.current
    if (!state) return
    clock.current = frame.still ? frame.time * 10 : clock.current + frame.dt * speed
    const { gl, uniforms: u } = state
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    setBlend(gl, light)
    gl.uniform2f(u.uRes, canvas.width, canvas.height)
    gl.uniform1f(u.uTime, clock.current)
    gl.uniform1f(u.uAngle, (-angle * Math.PI) / 180)
    gl.uniform1f(u.uCount, beams)
    gl.uniform3fv(
      u.uColors,
      new Float32Array(beamColors.flatMap((c) => [c[0] / 255, c[1] / 255, c[2] / 255])),
    )
    gl.uniform1f(u.uIntensity, intensity)
    gl.uniform1f(u.uLight, light ? 1 : 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  useEffectLoop(rootRef, {
    interactive: false,
    // Soft gradients: half resolution is indistinguishable and four times lighter.
    resize: ({ width, height, dpr }) => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = Math.max(1, Math.round(width * dpr * 0.5))
      canvas.height = Math.max(1, Math.round(height * dpr * 0.5))
      staticKey.current = ''
    },
    draw,
  })

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-slot="light-beams"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
      {...props}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block size-full" />
    </div>
  )
}
