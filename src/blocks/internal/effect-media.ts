/**
 * Helpers shared by the image effects (HalftoneImage, ParticleImage, PixelTrail) and the WebGL
 * effects: compiling programs, and rasterizing an image or a line of text to a small grid of
 * pixels the effects read colors and brightness from.
 */

/* -------------------------------------------------------------------------------------------------
 * WebGL
 * -----------------------------------------------------------------------------------------------*/

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
}

/** A WebGL context and linked program, or `null` (no WebGL, or the GPU rejected the shaders). */
export function createProgram(canvas: HTMLCanvasElement, vertex: string, fragment: string) {
  let gl: WebGLRenderingContext | null
  try {
    gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false })
  } catch {
    return null
  }
  if (!gl) return null
  const vs = compile(gl, gl.VERTEX_SHADER, vertex)
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment)
  const program = gl.createProgram()
  if (!vs || !fs || !program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)
  gl.enable(gl.BLEND)
  return { gl, program }
}

export function uniformsOf<K extends string>(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  names: readonly K[],
) {
  return Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(program, n)])) as Record<
    K,
    WebGLUniformLocation | null
  >
}

/** Upload interleaved float attributes, `sizes` floats each, in one buffer. */
export function bindAttributes(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  data: Float32Array,
  layout: [name: string, size: number][],
) {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  const stride = layout.reduce((sum, [, size]) => sum + size, 0) * 4
  let offset = 0
  for (const [name, size] of layout) {
    const location = gl.getAttribLocation(program, name)
    if (location >= 0) {
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset)
    }
    offset += size * 4
  }
  return buffer
}

/** Light adds up on dark backgrounds; premultiplied "over" on light ones. */
export function setBlend(gl: WebGLRenderingContext, light: boolean) {
  if (light) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  else gl.blendFunc(gl.ONE, gl.ONE)
}

/* -------------------------------------------------------------------------------------------------
 * Rasterizing images and text
 * -----------------------------------------------------------------------------------------------*/

export type MediaFit = 'contain' | 'cover'

export interface Raster {
  /** Grid size in samples. */
  cols: number
  rows: number
  /** RGBA, row by row. */
  data: Uint8ClampedArray
}

const images = new Map<string, Promise<HTMLImageElement>>()

/** Load (once per URL) an image that can be read back from a canvas. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  let pending = images.get(src)
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.decoding = 'async'
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error(`Could not load ${src}`))
      image.src = src
    })
    images.set(src, pending)
    pending.catch(() => images.delete(src))
  }
  return pending
}

/** Where an image of `w`×`h` lands in a box, fitted like `object-fit`. */
export function fitRect(w: number, h: number, boxW: number, boxH: number, fit: MediaFit) {
  const scale = fit === 'cover' ? Math.max(boxW / w, boxH / h) : Math.min(boxW / w, boxH / h)
  const width = w * scale
  const height = h * scale
  return { x: (boxW - width) / 2, y: (boxH - height) / 2, width, height }
}

function grid(cols: number, rows: number) {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = cols
    canvas.height = rows
    return canvas.getContext('2d', { willReadFrequently: true })
  } catch {
    return null
  }
}

function read(ctx: CanvasRenderingContext2D, cols: number, rows: number): Raster | null {
  try {
    return { cols, rows, data: ctx.getImageData(0, 0, cols, rows).data }
  } catch {
    // A cross-origin image without CORS headers taints the canvas.
    return null
  }
}

/** Sample an image into a `cols`×`rows` grid covering the effect's box, fitted with `fit`. */
export function rasterizeImage(
  image: CanvasImageSource & { naturalWidth: number; naturalHeight: number },
  cols: number,
  rows: number,
  fit: MediaFit,
): Raster | null {
  const ctx = grid(cols, rows)
  if (!ctx || !image.naturalWidth) return null
  const r = fitRect(image.naturalWidth, image.naturalHeight, cols, rows, fit)
  ctx.drawImage(image, r.x, r.y, r.width, r.height)
  return read(ctx, cols, rows)
}

/** Sample a line of text, as large as fits, into a `cols`×`rows` grid. */
export function rasterizeText(
  text: string,
  cols: number,
  rows: number,
  font: string,
): Raster | null {
  const ctx = grid(cols, rows)
  if (!ctx) return null
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `100px ${font}`
  const width = ctx.measureText(text).width || 1
  const size = Math.min((cols * 0.92 * 100) / width, rows * 0.8)
  ctx.font = `${size}px ${font}`
  ctx.fillStyle = '#fff'
  ctx.fillText(text, cols / 2, rows / 2)
  return read(ctx, cols, rows)
}

/** Perceived brightness (0..1) and alpha (0..1) of the sample at `i` (pixel index). */
export function sampleAt(raster: Raster, i: number) {
  const d = raster.data
  const k = i * 4
  return {
    r: d[k],
    g: d[k + 1],
    b: d[k + 2],
    luminance: (0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2]) / 255,
    alpha: d[k + 3] / 255,
  }
}
