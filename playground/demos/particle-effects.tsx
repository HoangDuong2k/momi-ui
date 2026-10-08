import { ArrowRight } from 'lucide-react'
import { useRef, useState } from 'react'
import {
  Badge,
  Button,
  Fireflies,
  FormField,
  ParticleWave,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Text,
  ToggleGroup,
  ToggleGroupItem,
  type ParticleWaveProps,
} from '../../src'
import { CodeBlock, Example } from '../components/demo'

const palettes: Record<string, { label: string; colors: string[] }> = {
  aurora: { label: 'Aurora', colors: ['#62d0ff', '#b48cff'] },
  ember: { label: 'Ember', colors: ['#ffb347', '#ff5e7e'] },
  mint: { label: 'Mint', colors: ['#5eead4', '#a3e635'] },
  theme: { label: 'Theme (info → primary)', colors: ['var(--info)', 'var(--primary)'] },
}

function Range({
  label,
  value,
  onChange,
  min = 0.2,
  max = 2,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}) {
  return (
    <FormField label={`${label}: ${value.toFixed(1)}`}>
      <Slider
        size="sm"
        min={min}
        max={max}
        step={0.1}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        resetValue={1}
      />
    </FormField>
  )
}

export default function ParticleEffectsDemo() {
  const copyRef = useRef<HTMLDivElement>(null)
  const [palette, setPalette] = useState('aurora')
  const [shape, setShape] = useState<NonNullable<ParticleWaveProps['shape']>>('smile')
  const [scale, setScale] = useState(1)
  const [thickness, setThickness] = useState(1)
  const [twist, setTwist] = useState(1)
  const [speed, setSpeed] = useState(1)
  const [density, setDensity] = useState(1)
  const [glow, setGlow] = useState(true)
  const [backdrop, setBackdrop] = useState(true)
  const [interactive, setInteractive] = useState(true)

  return (
    <div className="space-y-12">
      <Example
        title="Particle wave"
        description="A ribbon of glowing particles curving under the hero text (anchor). Move the pointer over it, click to send a ripple. Light adds up on dark backgrounds; on light ones the wave switches to normal blending by itself."
        layout="full"
        className="p-0 sm:p-0"
      >
        <section className="dark relative isolate overflow-hidden rounded-t-xl bg-background px-6 pt-20 pb-64 text-center text-foreground sm:pt-24">
          <ParticleWave
            anchor={copyRef}
            colors={palettes[palette].colors}
            shape={shape}
            scale={scale}
            thickness={thickness}
            twist={twist}
            speed={speed}
            density={density}
            glow={glow}
            backdrop={backdrop}
            interactive={interactive}
          />
          <div ref={copyRef} className="mx-auto max-w-2xl space-y-5">
            <Badge variant="outline" className="bg-background/40 backdrop-blur">
              New in momi-ui
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Landing pages that move
            </h1>
            <Text tone="muted" className="mx-auto max-w-lg text-balance">
              Thousands of particles, one draw call. Pauses off screen and respects reduced motion.
            </Text>
            <div className="flex justify-center gap-3">
              <Button size="lg" rightIcon={<ArrowRight />}>
                Get started
              </Button>
              <Button size="lg" variant="outline">
                View source
              </Button>
            </div>
          </div>
        </section>
        <div className="grid gap-6 rounded-b-xl border-t p-6 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Colors">
            <Select value={palette} onValueChange={setPalette}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(palettes).map(([id, p]) => (
                  <SelectItem key={id} value={id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Shape">
            <ToggleGroup
              type="single"
              variant="segmented"
              size="sm"
              value={shape}
              onValueChange={(value) => setShape(value as typeof shape)}
            >
              <ToggleGroupItem value="smile">Smile</ToggleGroupItem>
              <ToggleGroupItem value="arch">Arch</ToggleGroupItem>
              <ToggleGroupItem value="flat">Flat</ToggleGroupItem>
            </ToggleGroup>
          </FormField>
          <div className="grid content-start gap-3">
            <Switch label="Glow" checked={glow} onCheckedChange={setGlow} />
            <Switch
              label="Backdrop (rays, rings)"
              checked={backdrop}
              onCheckedChange={setBackdrop}
            />
            <Switch label="Interactive" checked={interactive} onCheckedChange={setInteractive} />
          </div>
          <Range label="Scale" value={scale} onChange={setScale} />
          <Range label="Thickness" value={thickness} onChange={setThickness} />
          <Range label="Twist" value={twist} onChange={setTwist} min={0} max={3} />
          <Range label="Speed" value={speed} onChange={setSpeed} min={0} max={3} />
          <Range label="Density" value={density} onChange={setDensity} min={0.3} max={1.5} />
        </div>
      </Example>

      <Example
        title="Fireflies"
        description="Specks that drift and blink, one swarm per color at its own depth. They come over to the pointer and circle it."
        layout="stack"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="dark relative isolate flex h-72 items-end overflow-hidden rounded-xl bg-background p-6 text-foreground">
            <Fireflies />
            <div>
              <Text weight="medium">Dark section</Text>
              <Text size="sm" tone="muted">
                Light adds up: the default blend.
              </Text>
            </div>
          </div>
          <div className="relative isolate flex h-72 items-end overflow-hidden rounded-xl border bg-background p-6">
            <Fireflies colors={['#0ea5e9', '#a855f7']} count={20} />
            <div>
              <Text weight="medium">Light section</Text>
              <Text size="sm" tone="muted">
                Detected from the background; follows theme changes.
              </Text>
            </div>
          </div>
        </div>
      </Example>

      <Example
        title="On a light background"
        description="blend='auto' sees the light background: particles are drawn with normal blending and a deeper core instead of white."
        layout="full"
        className="p-0 sm:p-0"
      >
        <div className="relative isolate h-80 overflow-hidden rounded-xl bg-background">
          <ParticleWave shape="arch" origin={{ y: 0.78 }} colors={['#0ea5e9', '#7c3aed']} />
        </div>
      </Example>

      <Example title="Usage" layout="stack">
        <CodeBlock
          code={`import { Fireflies, ParticleWave } from 'momi-ui'

function Hero() {
  const copy = useRef<HTMLDivElement>(null)
  return (
    <section className="relative isolate overflow-hidden">
      <Fireflies />
      {/* The wave sits just below the text block and follows its size. */}
      <ParticleWave anchor={copy} colors={['var(--info)', 'var(--primary)']} />
      <div ref={copy}>…</div>
    </section>
  )
}`}
        />
        <Text size="sm" tone="muted">
          Both are decorative (aria-hidden, no pointer events) and render on the client only — in
          Astro, load them with <code>client:idle</code>. The parent needs <code>relative</code> and{' '}
          <code>isolate</code> so the effect stays behind the content.
        </Text>
      </Example>
    </div>
  )
}
