import { Eye, EyeOff, Image, Music2, Play, Sparkles, Type, Waves } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn, IconButton, SortableHandle, SortableList, Text, toast } from '../../src'
import { Example } from '../components/demo'

/* -------------------------------------------------------------------------------------------------
 * 1. Playlist — drag by the handle
 * -----------------------------------------------------------------------------------------------*/

interface Song {
  id: string
  title: string
  artist: string
  seconds: number
  hue: number
}

const initialSongs: Song[] = [
  { id: 's1', title: 'Morning Light', artist: 'Linh Tran', seconds: 194, hue: 28 },
  { id: 's2', title: 'Rainy Saigon', artist: 'The Quiet Hours', seconds: 238, hue: 210 },
  { id: 's3', title: 'Night Bus', artist: 'Minh & Co.', seconds: 176, hue: 280 },
  { id: 's4', title: 'Paper Boats', artist: 'Vy Ho', seconds: 212, hue: 150 },
  { id: 's5', title: 'Last Ferry', artist: 'An Nguyen', seconds: 251, hue: 350 },
]

const time = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function Playlist() {
  const [songs, setSongs] = useState(initialSongs)
  const total = songs.reduce((sum, s) => sum + s.seconds, 0)
  return (
    <div className="grid w-full max-w-md gap-3">
      <div className="flex items-baseline justify-between px-1">
        <Text size="sm" weight="medium">
          Playlist
        </Text>
        <Text size="xs" tone="muted" className="tabular-nums">
          {songs.length} songs · {time(total)}
        </Text>
      </div>
      <SortableList
        aria-label="Playlist"
        value={songs}
        onValueChange={setSongs}
        getItemLabel={(s) => s.title}
        handle
        renderItem={(song, { index, overlay }) => (
          <>
            <SortableHandle />
            <span className="w-4 text-end text-xs text-muted-foreground tabular-nums">
              {index + 1}
            </span>
            <span
              aria-hidden
              className="size-9 shrink-0 rounded-md"
              style={{
                background: `linear-gradient(135deg, oklch(0.72 0.12 ${song.hue}), oklch(0.5 0.14 ${song.hue + 40}))`,
              }}
            />
            <span className="grid min-w-0 flex-1">
              <span className="truncate font-medium">{song.title}</span>
              <span className="truncate text-xs text-muted-foreground">{song.artist}</span>
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">{time(song.seconds)}</span>
            <IconButton
              aria-label={`Play ${song.title}`}
              size="sm"
              tabIndex={overlay ? -1 : undefined}
              onClick={() => toast(`Playing ${song.title}`)}
            >
              <Play />
            </IconButton>
          </>
        )}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * 2. Layers — dense panel, drag the whole row
 * -----------------------------------------------------------------------------------------------*/

interface Layer {
  id: string
  name: string
  kind: 'text' | 'waveform' | 'particles' | 'image' | 'audio'
  hidden?: boolean
}

const kindIcon: Record<Layer['kind'], ReactNode> = {
  text: <Type />,
  waveform: <Waves />,
  particles: <Sparkles />,
  image: <Image />,
  audio: <Music2 />,
}

const initialLayers: Layer[] = [
  { id: 'l1', name: 'Song title', kind: 'text' },
  { id: 'l2', name: 'Spectrum bars', kind: 'waveform' },
  { id: 'l3', name: 'Dust particles', kind: 'particles', hidden: true },
  { id: 'l4', name: 'Vinyl cover', kind: 'image' },
  { id: 'l5', name: 'Background', kind: 'image' },
]

function Layers() {
  const [layers, setLayers] = useState(initialLayers)
  const [selected, setSelected] = useState('l2')
  return (
    <div className="w-full max-w-xs rounded-xl border bg-card p-1.5 shadow-xs">
      <Text size="xs" tone="muted" weight="medium" className="px-2 pt-1 pb-2">
        Layers
      </Text>
      <SortableList
        aria-label="Layers"
        variant="plain"
        value={layers}
        onValueChange={setLayers}
        getItemLabel={(l) => l.name}
        itemClassName="has-[[data-selected]]:bg-accent"
        renderItem={(layer) => (
          <div
            data-selected={selected === layer.id || undefined}
            className="contents"
            onClick={() => setSelected(layer.id)}
          >
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground [&_svg]:size-3.5',
                selected === layer.id && 'bg-primary text-primary-foreground',
              )}
            >
              {kindIcon[layer.kind]}
            </span>
            <span className={cn('flex-1 truncate', layer.hidden && 'text-muted-foreground')}>
              {layer.name}
            </span>
            <IconButton
              aria-label={layer.hidden ? `Show ${layer.name}` : `Hide ${layer.name}`}
              size="sm"
              className="size-6 text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation()
                setLayers((all) =>
                  all.map((l) => (l.id === layer.id ? { ...l, hidden: !l.hidden } : l)),
                )
              }}
            >
              {layer.hidden ? <EyeOff /> : <Eye />}
            </IconButton>
          </div>
        )}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * 3. Horizontal
 * -----------------------------------------------------------------------------------------------*/

const initialPresets = [
  { id: 'p1', label: '1080p · 30 fps' },
  { id: 'p2', label: 'Shorts 9:16' },
  { id: 'p3', label: '4K · 60 fps' },
  { id: 'p4', label: 'Square 1:1' },
]

function Presets() {
  const [presets, setPresets] = useState(initialPresets)
  return (
    <SortableList
      aria-label="Export presets"
      orientation="horizontal"
      value={presets}
      onValueChange={setPresets}
      getItemLabel={(p) => p.label}
      itemClassName="rounded-full px-3.5 py-1.5"
      renderItem={(preset) => <span className="whitespace-nowrap">{preset.label}</span>}
    />
  )
}

export default function SortableListDemo() {
  return (
    <div className="space-y-12">
      <Example
        title="Playlist"
        description="handle: only the grip drags (touch drags right away from it), the rest of the row stays clickable. Keyboard: focus a grip, Space to pick up, arrows to move, Space to drop."
      >
        <Playlist />
      </Example>
      <Example
        title="Layers"
        description="variant plain for dense panels; the whole row drags (press and hold on touch). Buttons inside rows keep working."
        pattern
      >
        <Layers />
      </Example>
      <Example title="Horizontal" description="orientation horizontal uses ← → on the keyboard.">
        <Presets />
      </Example>
    </div>
  )
}
