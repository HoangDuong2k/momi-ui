import { ArrowRight } from 'lucide-react'
import {
  Button,
  HalftoneImage,
  Input,
  LightBeams,
  ParticleImage,
  PixelTrail,
  Text,
} from '../../src'
import { CodeBlock, Example } from '../components/demo'
import { artworks } from '../lib/media-art'

export default function ImageEffectsDemo() {
  return (
    <div className="space-y-12">
      <Example
        title="Particle sculpture"
        description="ParticleImage builds an image from thousands of particles with relief (brighter parts stand out). It turns gently towards the pointer, particles by the cursor drift aside, and a click sends a ripple. LightBeams drifts behind it."
        layout="full"
        className="p-0 sm:p-0"
      >
        <section className="dark relative isolate grid h-[34rem] grid-cols-[1fr_minmax(0,1.3fr)_1fr] items-center overflow-hidden rounded-xl bg-[#05081f] px-6 text-foreground">
          <LightBeams colors={['#2f5bff', '#5a3dff', '#1d9bff']} />
          <h2 className="font-serif text-2xl tracking-[0.2em] sm:text-4xl">ENVISION</h2>
          <ParticleImage src={artworks.bust} alt="Portrait made of particles" spacing={3} />
          <h2 className="text-end font-serif text-2xl tracking-[0.2em] sm:text-4xl">MATERIALIZE</h2>
        </section>
      </Example>

      <Example
        title="Halftone portrait"
        description="HalftoneImage draws an image as dots sized by its tones; around the pointer the dots take the accent color and grow."
        layout="full"
        className="p-0 sm:p-0"
      >
        <section className="relative grid overflow-hidden rounded-xl bg-[#f4f5f2] text-[#151515] md:grid-cols-2">
          <div className="space-y-4 p-8 sm:p-12">
            <h2 className="text-4xl leading-tight font-light tracking-tight sm:text-5xl">
              Turn money into{' '}
              <span className="bg-[linear-gradient(transparent_62%,#5cf27a_62%)]">foresight</span>
            </h2>
            <Text className="max-w-sm text-[#555]">
              Clarity and control to act — every account, card and tool in one place.
            </Text>
            <Button
              className="bg-[#151515] text-white hover:bg-[#2a2a2a]"
              rightIcon={<ArrowRight />}
            >
              Send request
            </Button>
          </div>
          <div className="h-[26rem]">
            <HalftoneImage
              src={artworks.bust}
              alt="Halftone portrait"
              color="#3a3a3a"
              accent="#2ee86b"
              cellSize={9}
            />
          </div>
        </section>
      </Example>

      <Example
        title="Pixel trail"
        description="PixelTrail breaks an image into vivid pixel blocks along the pointer's path; they fade back after a moment. Move the pointer across the picture."
        layout="full"
        className="p-0 sm:p-0"
      >
        <section className="dark relative h-[30rem] overflow-hidden rounded-xl text-foreground">
          <PixelTrail
            src={artworks.nightscape}
            alt="Mountains at night with warm lights"
            className="absolute inset-0"
          />
          <div className="pointer-events-none relative flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
            <h2 className="font-serif text-4xl italic sm:text-6xl">A light on the mountain,</h2>
            <p className="font-serif text-2xl italic opacity-90 sm:text-3xl">
              kept on just for you.
            </p>
            <div className="pointer-events-auto flex gap-2">
              <Input
                placeholder="Email"
                aria-label="Email"
                className="w-56 bg-background/60 backdrop-blur"
              />
              <Button>Send</Button>
            </div>
          </div>
        </section>
      </Example>

      <Example
        title="Text, no image"
        description="All three also take text. Without an image, PixelTrail leaves a trail of blocks in the theme color."
        layout="stack"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="dark h-48 overflow-hidden rounded-xl bg-background">
            <ParticleImage text="momi" colors={['#5b7cff', '#ffffff']} spacing={2} tilt={24} />
          </div>
          <div className="h-48 overflow-hidden rounded-xl border bg-background">
            <HalftoneImage text="momi" cellSize={7} />
          </div>
          <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-xl border bg-background">
            <PixelTrail
              colors={['var(--primary)', 'var(--info)']}
              cellSize={16}
              className="absolute inset-0"
            />
            <Text tone="muted" className="pointer-events-none relative">
              Move the pointer here
            </Text>
          </div>
        </div>
      </Example>

      <Example title="Usage" layout="stack">
        <CodeBlock
          code={`import { HalftoneImage, ParticleImage, PixelTrail } from 'momi-ui'

<div className="h-96">
  <ParticleImage src="/portrait.png" alt="Our founder" tilt={18} />
</div>

<div className="h-96">
  <HalftoneImage src="/portrait.png" alt="Our founder" accent="var(--primary)" />
</div>

<div className="relative h-[30rem]">
  <PixelTrail src="/hero.jpg" alt="Cabin at night" className="absolute inset-0" />
  <h1 className="relative">…</h1>
</div>`}
        />
        <Text size="sm" tone="muted">
          They fill their parent, so give it a size. Images must be same-origin or served with CORS
          headers (their pixels are read). Pass <code>alt</code> when the image carries meaning;
          without it the effect is hidden from screen readers.
        </Text>
      </Example>
    </div>
  )
}
