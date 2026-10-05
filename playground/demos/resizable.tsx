import { Disc3, Eye, Film, Image, Library, Lock, Music, Sparkles, Type, Waves } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import {
  Code,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ScrollArea,
  Text,
  type ResizableLayout,
} from '../../src'
import { Example } from '../components/demo'

const libraryItems = [
  { icon: Music, label: 'Midnight drive.mp3', meta: '3:42' },
  { icon: Music, label: 'Lo-fi rain.mp3', meta: '2:58' },
  { icon: Image, label: 'cover-art.png', meta: '1080²' },
  { icon: Film, label: 'intro-loop.mp4', meta: '0:08' },
  { icon: Sparkles, label: 'Particles · Dust', meta: 'Effect' },
  { icon: Waves, label: 'Spectrum · Bars', meta: 'Effect' },
  { icon: Disc3, label: 'Vinyl · Spin', meta: 'Effect' },
  { icon: Type, label: 'Title · Fade up', meta: 'Text' },
]

const layers = [
  { icon: Type, label: 'Track title' },
  { icon: Waves, label: 'Spectrum bars' },
  { icon: Disc3, label: 'Vinyl record' },
  { icon: Sparkles, label: 'Dust particles' },
  { icon: Image, label: 'Background' },
]

const strip = [Library, Music, Image, Sparkles]

function PanelTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-9 shrink-0 items-center border-b px-3 text-xs font-medium text-muted-foreground">
      {children}
    </div>
  )
}

function LibraryPanel() {
  return (
    <div className="flex h-full flex-col">
      <PanelTitle>Library</PanelTitle>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="grid gap-0.5 p-1.5">
          {libraryItems.map(({ icon: Icon, label, meta }) => (
            <li
              key={label}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{meta}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}

function CollapsedStrip() {
  return (
    <div className="flex h-full flex-col items-center gap-1 py-2">
      {strip.map((Icon, i) => (
        <span
          key={i}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground"
        >
          <Icon className="size-4" />
        </span>
      ))}
      <span className="mt-2 text-xs font-medium text-muted-foreground [writing-mode:vertical-rl]">
        Library
      </span>
    </div>
  )
}

function Preview() {
  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_center,oklch(0.32_0.06_60),oklch(0.16_0.02_60))] p-4">
      <div className="flex h-24 items-end gap-1" aria-hidden>
        {[38, 62, 80, 54, 92, 70, 46, 84, 60, 34, 72, 50].map((h, i) => (
          <span
            key={i}
            className="w-2 rounded-full bg-[oklch(0.8_0.14_70)]"
            style={{ height: `${h}%`, opacity: 0.55 + (i % 3) * 0.15 }}
          />
        ))}
      </div>
    </div>
  )
}

function Timeline() {
  return (
    <div className="flex h-full flex-col">
      <PanelTitle>Timeline</PanelTitle>
      <div className="momi-scrollbar min-h-0 flex-1 overflow-auto">
        <div className="grid w-[1600px] gap-1.5 p-2">
          {[
            ['Audio', 'bg-[oklch(0.62_0.12_250)]/35', 1400],
            ['Spectrum', 'bg-[oklch(0.72_0.14_70)]/35', 1100],
            ['Title', 'bg-[oklch(0.65_0.15_330)]/35', 380],
          ].map(([label, color, width]) => (
            <div key={label} className="flex h-7 items-center gap-2">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">{label}</span>
              <span
                className={`h-full rounded-md border border-foreground/10 ${color}`}
                style={{ width: Number(width) }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LayersPanel() {
  return (
    <div className="flex h-full flex-col">
      <PanelTitle>Layers</PanelTitle>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="grid gap-0.5 p-1.5">
          {layers.map(({ icon: Icon, label }, i) => (
            <li
              key={label}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${i === 1 ? 'bg-accent font-medium' : ''}`}
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              <Eye className="size-3.5 text-muted-foreground" />
              {i === 4 && <Lock className="size-3.5 text-muted-foreground" />}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}

function PropertiesPanel() {
  return (
    <div className="flex h-full flex-col">
      <PanelTitle>Properties</PanelTitle>
      <div className="grid gap-2.5 p-3 text-sm">
        {[
          ['Bars', '48'],
          ['Height', '72%'],
          ['Smoothing', '0.6'],
          ['Color', '#e3a04a'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-mono text-xs tabular-nums">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EditorLayout() {
  const [layout, setLayout] = useState<ResizableLayout | null>(null)
  return (
    <div className="grid gap-3">
      <div className="h-[480px] overflow-hidden rounded-xl border bg-card">
        <ResizablePanelGroup autoSaveId="momi-demo-editor" onLayout={setLayout}>
          <ResizablePanel
            id="library"
            defaultSize={240}
            minSize={220}
            maxSize="35%"
            collapsible
            collapsedSize={34}
          >
            {({ collapsed }) => (collapsed ? <CollapsedStrip /> : <LibraryPanel />)}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel id="stage" minSize={260}>
            <ResizablePanelGroup direction="vertical" autoSaveId="momi-demo-stage">
              <ResizablePanel id="preview" defaultSize="64%" minSize={120}>
                <Preview />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel id="timeline" minSize={96}>
                <Timeline />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel id="inspector" defaultSize={280} minSize={220} maxSize="40%">
            <ResizablePanelGroup direction="vertical" autoSaveId="momi-demo-inspector">
              <ResizablePanel id="layers" defaultSize="45%" minSize={90}>
                <LayersPanel />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel id="properties" minSize={120}>
                <PropertiesPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <Text size="xs" tone="muted" className="font-mono">
        {layout
          ? `onLayout → ${Object.entries(layout)
              .map(([id, size]) => `${id} ${size.toFixed(1)}%`)
              .join(' · ')}`
          : 'Drag a handle — the layout is saved and restored on reload.'}
      </Text>
    </div>
  )
}

export default function ResizableDemo() {
  return (
    <div className="space-y-12">
      <Example
        title="Editor layout"
        description="Library | preview + timeline | layers + properties. Drag the handles or focus one and use the arrow keys; double-click resets. Drag the library below 220px to fold it into a 34px strip — it reopens at its previous width."
        layout="full"
        className="p-4 sm:p-6"
      >
        <EditorLayout />
      </Example>

      <Example
        title="Sizes"
        description={
          <>
            Numbers are pixels, strings are percentages: <Code>minSize={'{220}'}</Code>,{' '}
            <Code>defaultSize=&quot;30%&quot;</Code>. Pixel limits hold when the window resizes.
          </>
        }
        layout="full"
      >
        <div className="h-40 overflow-hidden rounded-lg border">
          <ResizablePanelGroup>
            <ResizablePanel defaultSize="30%" minSize={120}>
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                min 120px
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                flexible
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={180} minSize={140} maxSize={320}>
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                140–320px
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </Example>

      <Example
        title="Saving the layout"
        description="autoSaveId stores the layout in localStorage (give each panel an id). Or pass onLayout and keep it in your own settings, then hand it back as defaultLayout."
        layout="stack"
      >
        <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-4 font-mono text-[13px] leading-relaxed">
          {`<ResizablePanelGroup onLayout={(layout) => settings.save('editor', layout)}
                     defaultLayout={settings.load('editor')}>
  <ResizablePanel id="library" defaultSize={240} minSize={220} collapsible collapsedSize={34} />
  <ResizableHandle withHandle />
  <ResizablePanel id="stage" />
</ResizablePanelGroup>`}
        </pre>
      </Example>
    </div>
  )
}
