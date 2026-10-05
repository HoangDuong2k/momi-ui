import { ClipboardPaste, Copy, Flag, Palette, Scissors, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  cn,
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  Kbd,
  Text,
  toast,
  type MenuPosition,
} from '../../src'
import { Example } from '../components/demo'

/* -------------------------------------------------------------------------------------------------
 * Open at any position (timeline)
 * -----------------------------------------------------------------------------------------------*/

type ClipColor = 'info' | 'success' | 'warning'

interface Clip {
  id: string
  name: string
  start: number
  length: number
  color: ClipColor
  muted?: boolean
}

const clipColor: Record<ClipColor, string> = {
  info: 'border-info/40 bg-info/15 text-info',
  success: 'border-success/40 bg-success/15 text-success',
  warning: 'border-warning/40 bg-warning/15 text-warning',
}

const initialClips: Clip[] = [
  { id: 'c1', name: 'Intro.mp3', start: 2, length: 26, color: 'info' },
  { id: 'c2', name: 'Lo-fi beat.mp3', start: 30, length: 38, color: 'success' },
  { id: 'c3', name: 'Outro.mp3', start: 70, length: 22, color: 'warning' },
]

function TimelineMenu() {
  const [clips, setClips] = useState(initialClips)
  const [menu, setMenu] = useState<(MenuPosition & { clipId: string | null }) | null>(null)
  const [snap, setSnap] = useState(true)
  const clip = clips.find((c) => c.id === menu?.clipId)

  const update = (id: string, patch: Partial<Clip>) =>
    setClips((all) => all.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  return (
    <>
      <div
        role="application"
        aria-label="Timeline"
        className="relative h-28 w-full overflow-hidden rounded-lg border bg-muted/40 select-none"
        onContextMenu={(e) => {
          e.preventDefault()
          const target = (e.target as HTMLElement).closest<HTMLElement>('[data-clip]')
          setMenu({ x: e.clientX, y: e.clientY, clipId: target?.dataset.clip ?? null })
        }}
      >
        {/* Ruler */}
        <div className="absolute inset-x-0 top-0 flex h-6 border-b text-[10px] text-muted-foreground tabular-nums">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="flex-1 border-s ps-1 pt-1 first:border-s-0">
              0:{String(i * 6).padStart(2, '0')}
            </span>
          ))}
        </div>
        {clips.map((c) => (
          <button
            key={c.id}
            type="button"
            data-clip={c.id}
            onKeyDown={(e) => {
              // Shift+F10 or the Menu key open the same menu from the keyboard.
              if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
                e.preventDefault()
                const rect = e.currentTarget.getBoundingClientRect()
                setMenu({ x: rect.left + 12, y: rect.bottom - 6, clipId: c.id })
              }
            }}
            className={cn(
              'absolute top-9 flex h-12 items-center truncate rounded-md border px-2.5 text-xs font-medium outline-none',
              'focus-visible:ring-[3px] focus-visible:ring-ring/40',
              clipColor[c.color],
              c.muted && 'opacity-50',
            )}
            style={{ left: `${c.start}%`, width: `${c.length}%` }}
          >
            {c.name}
          </button>
        ))}
      </div>

      <DropdownMenu
        open={menu !== null}
        onOpenChange={(open) => !open && setMenu(null)}
        position={menu}
      >
        <DropdownMenuContent className="w-56">
          {clip ? (
            <>
              <DropdownMenuLabel>{clip.name}</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => toast(`Split ${clip.name}`)}>
                <Scissors />
                Split at playhead
                <DropdownMenuShortcut keys="mod+b" />
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => toast(`Copied ${clip.name}`)}>
                <Copy />
                Copy
                <DropdownMenuShortcut keys="mod+c" />
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette />
                  Color
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={clip.color}
                    onValueChange={(color) => update(clip.id, { color: color as ClipColor })}
                  >
                    <DropdownMenuRadioItem value="info">Blue</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="success">Green</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="warning">Amber</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuCheckboxItem
                checked={Boolean(clip.muted)}
                onCheckedChange={(muted) => update(clip.id, { muted })}
              >
                Mute
                <DropdownMenuShortcut keys="m" />
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="danger"
                onSelect={() => setClips((all) => all.filter((c) => c.id !== clip.id))}
              >
                <Trash2 />
                Delete
                <DropdownMenuShortcut keys="delete" />
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem disabled>
                <ClipboardPaste />
                Paste
                <DropdownMenuShortcut keys="mod+v" />
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => toast('Marker added')}>
                <Flag />
                Add marker
                <DropdownMenuShortcut keys="shift+m" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={snap} onCheckedChange={setSnap}>
                Snap to grid
              </DropdownMenuCheckboxItem>
              {clips.length < initialClips.length && (
                <DropdownMenuItem onSelect={() => setClips(initialClips)}>
                  Restore clips
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default function ContextMenuDemo() {
  const [bookmarks, setBookmarks] = useState(true)
  const [person, setPerson] = useState('linh')

  return (
    <div className="space-y-12">
      <Example title="Right-click the area" layout="stack">
        <ContextMenu>
          <ContextMenuTrigger className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground select-none data-[state=open]:border-foreground/30">
            Right-click here (long-press on touch)
          </ContextMenuTrigger>
          <ContextMenuContent className="w-60">
            <ContextMenuItem inset>
              Back
              <ContextMenuShortcut keys="mod+[" />
            </ContextMenuItem>
            <ContextMenuItem inset disabled>
              Forward
              <ContextMenuShortcut keys="mod+]" />
            </ContextMenuItem>
            <ContextMenuItem inset>
              Reload
              <ContextMenuShortcut keys="mod+r" />
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger inset>More tools</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-44">
                <ContextMenuItem>Save page as…</ContextMenuItem>
                <ContextMenuItem>Create shortcut…</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Developer tools</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
              Show bookmarks
            </ContextMenuCheckboxItem>
            <ContextMenuSeparator />
            <ContextMenuLabel inset>People</ContextMenuLabel>
            <ContextMenuRadioGroup value={person} onValueChange={setPerson}>
              <ContextMenuRadioItem value="linh">Linh Tran</ContextMenuRadioItem>
              <ContextMenuRadioItem value="minh">Minh Nguyen</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
            <ContextMenuSeparator />
            <ContextMenuItem inset variant="danger">
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Example>

      <Example
        title="Open at any position"
        description="For canvases, timelines and previews, open a DropdownMenu from code with open + position — no wrapping trigger. Right-click a clip or the empty track; near the window edge the menu flips inward."
        layout="stack"
      >
        <TimelineMenu />
        <Text size="sm" tone="muted">
          Keyboard: focus a clip, then <Kbd keys="shift+f10" /> or the Menu key.
        </Text>
      </Example>
    </div>
  )
}
