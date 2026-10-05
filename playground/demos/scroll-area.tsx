import { useEffect, useRef } from 'react'
import { Badge, Code, ScrollArea, Separator, Text } from '../../src'
import { Example } from '../components/demo'

const effects = [
  'Spectrum · Bars',
  'Spectrum · Circle',
  'Waveform · Line',
  'Waveform · Mirror',
  'Vinyl · Spin',
  'Particles · Dust',
  'Particles · Snow',
  'Particles · Fireflies',
  'Light · Bloom',
  'Light · Leaks',
  'Light · God rays',
  'Motion · Ken Burns',
  'Motion · Parallax',
  'Filter · VHS',
  'Filter · CRT',
  'Filter · Film grain',
  'Text · Fade up',
  'Text · Typewriter',
]

const covers = [
  ['Midnight drive', 'oklch(0.55 0.14 280)', 'oklch(0.35 0.1 250)'],
  ['Lo-fi rain', 'oklch(0.6 0.08 220)', 'oklch(0.38 0.05 240)'],
  ['Golden hour', 'oklch(0.78 0.14 70)', 'oklch(0.55 0.15 40)'],
  ['Neon city', 'oklch(0.65 0.22 340)', 'oklch(0.4 0.15 290)'],
  ['Forest walk', 'oklch(0.62 0.12 150)', 'oklch(0.4 0.08 170)'],
  ['Deep focus', 'oklch(0.5 0.05 260)', 'oklch(0.28 0.03 260)'],
  ['Summer tape', 'oklch(0.75 0.15 30)', 'oklch(0.55 0.18 10)'],
]

function WideTimeline() {
  const ref = useRef<HTMLDivElement>(null)
  // A timeline sets its own scroll position, which is why it can't live inside <ScrollArea>.
  useEffect(() => {
    if (ref.current) ref.current.scrollLeft = 640
  }, [])
  return (
    <div ref={ref} className="momi-scrollbar overflow-x-auto rounded-lg border bg-card">
      <div className="relative h-24 w-[4800px]">
        <div className="absolute inset-x-0 top-0 flex h-6 border-b">
          {Array.from({ length: 80 }, (_, i) => (
            <span
              key={i}
              className="w-[60px] shrink-0 border-s ps-1 text-[10px] text-muted-foreground tabular-nums"
            >
              {Math.floor(i / 6)}:{String((i % 6) * 10).padStart(2, '0')}
            </span>
          ))}
        </div>
        <span className="absolute top-9 left-[120px] h-6 w-[2200px] rounded-md bg-primary/15 ring-1 ring-primary/25" />
        <span className="absolute top-[60px] left-[700px] h-6 w-[900px] rounded-md bg-info/15 ring-1 ring-info/25" />
      </div>
    </div>
  )
}

export default function ScrollAreaDemo() {
  return (
    <div className="space-y-12">
      <Example
        title="Vertical"
        description="Thin scrollbars that follow the theme and appear on hover — the same on Windows, macOS and Linux."
      >
        <ScrollArea className="h-72 w-60 rounded-lg border bg-card">
          <div className="p-3">
            <Text size="xs" tone="muted" weight="medium" className="mb-2">
              Effects
            </Text>
            {effects.map((effect, i) => (
              <div key={effect}>
                {i > 0 && <Separator className="my-2" />}
                <Text size="sm">{effect}</Text>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Example>

      <Example title="Horizontal" layout="full">
        <ScrollArea orientation="horizontal" className="w-full rounded-lg border bg-card">
          <div className="flex w-max gap-3 p-3">
            {covers.map(([title, from, to]) => (
              <figure key={title} className="w-36 shrink-0 space-y-1.5">
                <div
                  className="aspect-square rounded-md"
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                />
                <figcaption className="truncate text-xs text-muted-foreground">{title}</figcaption>
              </figure>
            ))}
          </div>
        </ScrollArea>
      </Example>

      <Example
        title="Both directions, thinner"
        description={
          <>
            <Code>orientation=&quot;both&quot;</Code> and <Code>size=&quot;sm&quot;</Code> (6px).
            Use <Code>type=&quot;always&quot;</Code> to keep the bars visible.
          </>
        }
      >
        <ScrollArea
          orientation="both"
          size="sm"
          type="always"
          className="h-56 w-full max-w-md rounded-lg border bg-card"
        >
          <div className="grid w-[720px] grid-cols-6 gap-2 p-3">
            {Array.from({ length: 48 }, (_, i) => (
              <div
                key={i}
                className="flex h-14 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground tabular-nums"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Example>

      <Example
        title="Plain overflow: momi-scrollbar"
        description={
          <>
            For an element that must scroll itself — a 4,800px timeline that sets{' '}
            <Code>scrollLeft</Code> — add the <Code>momi-scrollbar</Code> class to get the same
            look. Add <Code>momi-scrollbar-visible</Code> to keep the thumb shown.
          </>
        }
        layout="stack"
      >
        <WideTimeline />
        <div className="flex items-center gap-2">
          <Badge size="sm" variant="outline">
            CSS only
          </Badge>
          <Text size="xs" tone="muted">
            Standard <Code>scrollbar-color</Code>, with a WebKit fallback for Safari.
          </Text>
        </div>
      </Example>
    </div>
  )
}
