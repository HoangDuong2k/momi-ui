import { render } from '@testing-library/react'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DustMotes } from '../dust-motes'
import { Fireflies } from '../fireflies'
import { HalftoneImage } from '../halftone-image'
import { fitRect, rasterizeText, sampleAt } from '../internal/effect-media'
import { LightBeams } from '../light-beams'
import { ParticleImage } from '../particle-image'
import { PixelTrail } from '../pixel-trail'
import {
  hash01,
  noise1,
  onLightBackground,
  resolveColors,
  useEffectLoop,
  type EffectFrame,
  type EffectLoopOptions,
} from '../internal/effect-runtime'
import { ParticleWave } from '../particle-wave'

// jsdom has no canvas: getContext returns null, as on a browser without WebGL.
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('effect math', () => {
  it('hashes and noise are deterministic and stay in range', () => {
    expect(hash01(7, 3)).toBe(hash01(7, 3))
    expect(hash01(7, 3)).not.toBe(hash01(8, 3))
    for (let i = 0; i < 200; i++) {
      const n = noise1(i * 0.37, 5)
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThanOrEqual(1)
    }
  })
})

describe('colors', () => {
  it('resolves CSS colors from an element', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    expect(resolveColors(el, ['#62d0ff', 'rgb(1, 2, 3)'])).toEqual([
      [98, 208, 255],
      [1, 2, 3],
    ])
    el.remove()
  })

  it('tells light backgrounds from dark ones', () => {
    const dark = document.createElement('section')
    dark.style.backgroundColor = 'rgb(10, 10, 12)'
    const inner = document.createElement('div')
    dark.appendChild(inner)
    document.body.appendChild(dark)
    expect(onLightBackground(inner)).toBe(false)
    dark.style.backgroundColor = 'rgb(250, 250, 250)'
    expect(onLightBackground(inner)).toBe(true)
    dark.remove()
  })
})

function LoopProbe(props: EffectLoopOptions) {
  const ref = React.useRef<HTMLDivElement>(null)
  useEffectLoop(ref, props)
  return <div ref={ref} data-testid="effect" />
}

describe('useEffectLoop', () => {
  const frames: (() => void)[] = []
  beforeEach(() => {
    frames.length = 0
    let id = 0
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frames.push(() => cb(performance.now() + frames.length * 17))
      return ++id
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })
  const tick = (n: number) => {
    for (let i = 0; i < n; i++) frames.shift()?.()
  }

  it('draws a still frame and never loops with reduced motion', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduced-motion'),
      addEventListener() {},
      removeEventListener() {},
    }))
    const draw = vi.fn<(frame: EffectFrame) => void>()
    render(<LoopProbe draw={draw} stillTime={4} />)
    expect(draw).toHaveBeenCalledTimes(1)
    expect(draw.mock.calls[0][0]).toMatchObject({ still: true, time: 4, dt: 0, pointer: null })
    expect(frames).toHaveLength(0)
  })

  it('runs frames that advance its clock, and stops when unmounted', () => {
    const draw = vi.fn<(frame: EffectFrame) => void>()
    const { unmount } = render(<LoopProbe draw={draw} interactive={false} />)
    expect(draw).toHaveBeenCalledTimes(1) // first paint
    tick(4)
    expect(draw.mock.calls.length).toBeGreaterThan(1)
    const last = draw.mock.calls.at(-1)![0]
    expect(last.still).toBe(false)
    expect(last.time).toBeGreaterThan(0)
    expect(last.pointer).toBeNull()
    const count = draw.mock.calls.length
    unmount()
    tick(4)
    expect(draw.mock.calls.length).toBe(count)
  })

  it('reports presses inside the effect only', () => {
    const press = vi.fn()
    const { getByTestId } = render(<LoopProbe draw={() => {}} press={press} />)
    vi.spyOn(getByTestId('effect'), 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      width: 200,
      height: 100,
      right: 300,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON() {},
    } as DOMRect)
    window.dispatchEvent(new MouseEvent('pointerdown', { clientX: 150, clientY: 120 }))
    window.dispatchEvent(new MouseEvent('pointerdown', { clientX: 20, clientY: 20 }))
    expect(press).toHaveBeenCalledTimes(1)
    expect(press.mock.calls[0].slice(0, 2)).toEqual([50, 20])
  })
})

describe('effect components', () => {
  it('render a decorative layer and survive a browser without canvas', () => {
    const { container, unmount } = render(
      <div>
        <ParticleWave className="opacity-80" shape="arch" />
        <Fireflies colors={['#fff']} />
      </div>,
    )
    const wave = container.querySelector('[data-slot="particle-wave"]')!
    expect(wave).toHaveAttribute('aria-hidden', 'true')
    expect(wave).toHaveClass('pointer-events-none', 'absolute', 'inset-0', 'opacity-80')
    expect(wave.querySelectorAll('canvas')).toHaveLength(2)
    const flies = container.querySelector('[data-slot="fireflies"]')!
    expect(flies).toHaveAttribute('aria-hidden', 'true')
    expect(flies.querySelectorAll('canvas')).toHaveLength(1)
    unmount()
  })

  it('follows an anchor element', () => {
    function Hero() {
      const copy = React.useRef<HTMLDivElement>(null)
      return (
        <section>
          <ParticleWave anchor={copy} />
          <div ref={copy}>Title</div>
        </section>
      )
    }
    expect(() => render(<Hero />)).not.toThrow()
  })
})

describe('media helpers', () => {
  it('fits an image like object-fit', () => {
    expect(fitRect(200, 100, 100, 100, 'contain')).toEqual({ x: 0, y: 25, width: 100, height: 50 })
    expect(fitRect(200, 100, 100, 100, 'cover')).toEqual({ x: -50, y: 0, width: 200, height: 100 })
  })

  it('reads brightness and alpha from a raster, and gives up without a canvas', () => {
    const raster = {
      cols: 2,
      rows: 1,
      data: new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 128]),
    }
    expect(sampleAt(raster, 0).luminance).toBeCloseTo(1)
    expect(sampleAt(raster, 0).alpha).toBe(1)
    expect(sampleAt(raster, 1).luminance).toBe(0)
    expect(sampleAt(raster, 1).alpha).toBeCloseTo(0.5, 1)
    expect(rasterizeText('momi', 40, 10, 'sans-serif')).toBeNull()
  })
})

describe('image and ambient effects', () => {
  it('describe images when given alt text, and stay decorative otherwise', () => {
    const { container } = render(
      <div>
        <HalftoneImage text="momi" alt="momi in dots" />
        <ParticleImage text="momi" />
        <PixelTrail alt="A cabin at night" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
      </div>,
    )
    const halftone = container.querySelector('[data-slot="halftone-image"]')!
    expect(halftone).toHaveAttribute('role', 'img')
    expect(halftone).toHaveAccessibleName('momi in dots')
    expect(container.querySelector('[data-slot="particle-image"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(container.querySelector('[data-slot="pixel-trail"]')).toHaveAccessibleName(
      'A cabin at night',
    )
  })

  it('render background layers that survive a browser without canvas', () => {
    const { container, unmount } = render(
      <div>
        <LightBeams count={9} />
        <DustMotes beam={false} />
      </div>,
    )
    for (const slot of ['light-beams', 'dust-motes']) {
      const el = container.querySelector(`[data-slot="${slot}"]`)!
      expect(el).toHaveAttribute('aria-hidden', 'true')
      expect(el).toHaveClass('pointer-events-none', 'absolute', 'inset-0', '-z-10')
    }
    unmount()
  })
})
