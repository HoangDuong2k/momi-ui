import { Play } from 'lucide-react'
import { useState } from 'react'
import {
  AppWindowFrame,
  BackgroundPattern,
  Lightbox,
  Text,
  VideoPlayer,
  type LightboxItem,
} from '../../src'
import { CodeBlock, Example } from '../components/demo'
import { DashboardPreview } from '../lib/landing-content'
import { artworks, sampleVideo } from '../lib/media-art'

const effects: LightboxItem[] = [
  { src: artworks.particles, alt: 'Particles', caption: 'Particles — embers drifting to the beat' },
  { src: artworks.lightLeaks, alt: 'Light leaks', caption: 'Light leaks — warm film flares' },
  { src: artworks.vinyl, alt: 'Vinyl', caption: 'Vinyl — a spinning record with your cover art' },
  { src: artworks.waveform, alt: 'Waveform', caption: 'Waveform — bars that follow the music' },
  {
    type: 'video',
    src: sampleVideo[1].src,
    sources: sampleVideo,
    alt: 'Flower clip',
    caption: 'Videos play inside the viewer and pause when you move on',
  },
  { src: artworks.vhs, alt: 'VHS', caption: 'VHS — scanlines and a chromatic wobble' },
  { src: artworks.bokeh, alt: 'Bokeh', caption: 'Bokeh — soft out-of-focus lights' },
]

function EffectGallery() {
  const [index, setIndex] = useState<number | null>(null)
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {effects.map((effect, i) => (
          <button
            key={effect.alt}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative aspect-[8/5] overflow-hidden rounded-lg border bg-muted text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            {effect.type === 'video' ? (
              <span className="flex size-full items-center justify-center bg-linear-to-br from-emerald-900 to-zinc-950 text-white">
                <Play className="size-6 fill-current" />
              </span>
            ) : (
              <img
                src={effect.src}
                alt=""
                className="size-full object-cover transition-transform duration-500 ease-out-soft group-hover:scale-105"
              />
            )}
            <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-3 pt-6 pb-2 text-xs font-medium text-white">
              {effect.alt}
            </span>
          </button>
        ))}
      </div>
      <Lightbox items={effects} index={index} onIndexChange={setIndex} />
    </>
  )
}

export default function MediaDemo() {
  const [variant, setVariant] = useState<'macos' | 'windows' | 'minimal'>('macos')

  return (
    <div className="space-y-12">
      <Example
        title="App window frame"
        description="Desktop chrome for screenshots: macOS, Windows or minimal. tilt leans the window back (it straightens on hover) and glow adds an accent halo — both made for hero sections."
        layout="stack"
        className="overflow-hidden"
      >
        <div className="flex flex-wrap gap-2">
          {(['macos', 'windows', 'minimal'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={variant === v}
              onClick={() => setVariant(v)}
              className="h-8 rounded-md border px-3 font-mono text-xs text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-pressed:bg-accent aria-pressed:text-foreground"
            >
              {v}
            </button>
          ))}
        </div>
        <div className="relative isolate overflow-hidden rounded-lg px-4 pt-12 pb-6 sm:px-12">
          <BackgroundPattern variant="grid" />
          <AppWindowFrame
            variant={variant}
            title="Analytics — momi"
            tilt
            glow
            className="mx-auto max-w-3xl"
          >
            <DashboardPreview />
          </AppWindowFrame>
        </div>
      </Example>

      <Example
        title="Video player"
        description="Loads only when it is about to scroll into view, plays muted while visible and pauses when it leaves. With reduced motion it shows the poster and waits for a click."
        layout="stack"
      >
        <AppWindowFrame variant="minimal" title="flower.mp4" className="mx-auto w-full max-w-3xl">
          <VideoPlayer
            sources={sampleVideo}
            aria-label="A flower opening"
            className="rounded-none"
          />
        </AppWindowFrame>
        <CodeBlock
          code={`<VideoPlayer
  sources={[{ src: '/demo.webm' }, { src: '/demo.mp4' }]}
  poster="/demo.jpg"
  aria-label="Export preview"
/>`}
        />
      </Example>

      <Example
        title="Lightbox"
        description="Open any item of a grid in a full-screen viewer: arrow keys, buttons or swipe to move, Esc or a tap on the backdrop to close. Build the grid yourself from Grid, Tabs and your own tiles."
        layout="stack"
      >
        <EffectGallery />
        <Text size="sm" tone="muted">
          One state value drives it: <code className="font-mono text-xs">index</code> is the open
          item, <code className="font-mono text-xs">null</code> means closed.
        </Text>
      </Example>
    </div>
  )
}
