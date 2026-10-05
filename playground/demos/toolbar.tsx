import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Download,
  FilePlus2,
  FolderOpen,
  Italic,
  Magnet,
  Redo2,
  Repeat,
  Save,
  Scissors,
  Underline,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useState } from 'react'
import {
  Button,
  Code,
  DensityProvider,
  Text,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarToggle,
  TooltipProvider,
  toast,
  type ButtonSize,
  type ToggleGroupVariant,
} from '../../src'
import { Example, Row } from '../components/demo'

const redo = { mac: 'mod+shift+z', default: 'mod+y' }

function AppTopBar() {
  const [language, setLanguage] = useState('vi')
  const [quality, setQuality] = useState('auto')
  return (
    <Toolbar aria-label="Project" variant="surface" className="w-full">
      <ToolbarGroup aria-label="File">
        <ToolbarButton icon={<FilePlus2 />} label="New project" shortcut="mod+n" />
        <ToolbarButton icon={<FolderOpen />} label="Open" shortcut="mod+o" />
        <ToolbarButton
          icon={<Save />}
          label="Save project"
          shortcut="mod+s"
          onClick={() => toast.success('Project saved')}
        />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="History">
        <ToolbarButton icon={<Undo2 />} label="Undo" shortcut="mod+z" />
        <ToolbarButton icon={<Redo2 />} label="Redo" shortcut={redo} />
      </ToolbarGroup>
      <div className="ms-auto flex items-center gap-2">
        <ToggleGroup
          type="single"
          variant="segmented"
          size="xs"
          value={quality}
          onValueChange={setQuality}
          aria-label="Preview quality"
        >
          <ToggleGroupItem value="auto">Auto</ToggleGroupItem>
          <ToggleGroupItem value="720">720p</ToggleGroupItem>
          <ToggleGroupItem value="1080">1080p</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup
          type="single"
          variant="segmented"
          size="xs"
          value={language}
          onValueChange={setLanguage}
          aria-label="Language"
        >
          <ToggleGroupItem value="vi">VI</ToggleGroupItem>
          <ToggleGroupItem value="en">EN</ToggleGroupItem>
        </ToggleGroup>
        <ToolbarSeparator />
        <ToolbarButton
          variant="solid"
          leftIcon={<Download />}
          shortcut="mod+e"
          label="Export video"
        >
          Export
        </ToolbarButton>
      </div>
    </Toolbar>
  )
}

function TimelineToolbar() {
  const [zoom, setZoom] = useState('fit')
  return (
    <Toolbar aria-label="Timeline" size="xs" className="rounded-md border bg-muted/40 px-1.5 py-1">
      <ToolbarButton icon={<Scissors />} label="Split at playhead" shortcut="s" />
      <ToolbarToggle icon={<Magnet />} label="Snap" shortcut="n" defaultPressed />
      <ToolbarToggle icon={<Repeat />} label="Loop selection" shortcut="l" />
      <ToolbarSeparator />
      <ToolbarButton icon={<ZoomOut />} label="Zoom out" shortcut="mod+-" />
      <ToolbarButton icon={<ZoomIn />} label="Zoom in" shortcut="mod+=" />
      <ToggleGroup type="single" value={zoom} onValueChange={setZoom} aria-label="Zoom level">
        <ToggleGroupItem value="fit">Fit</ToggleGroupItem>
        <ToggleGroupItem value="1s">1s</ToggleGroupItem>
        <ToggleGroupItem value="frames">Frames</ToggleGroupItem>
      </ToggleGroup>
    </Toolbar>
  )
}

const variants: ToggleGroupVariant[] = ['ghost', 'outline', 'segmented']
const sizes: ButtonSize[] = ['xs', 'sm', 'md', 'lg']

export default function ToolbarDemo() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-12">
        <Example
          title="App toolbar"
          description="One Tab stop; the arrow keys walk through buttons, toggle groups and links. Tooltips show the label and the shortcut for this computer (⌘ on Mac, Ctrl elsewhere)."
          layout="stack"
        >
          <AppTopBar />
        </Example>

        <Example
          title="Timeline toolbar"
          description={
            <>
              <Code>size=&quot;xs&quot;</Code> (24px controls) with on/off toggles for snapping and
              looping.
            </>
          }
          layout="stack"
        >
          <TimelineToolbar />
        </Example>

        <Example
          title="Toggle group variants"
          description='type="single" always keeps exactly one item on; pass allowDeselect to let it be empty.'
          layout="stack"
        >
          {variants.map((variant) => (
            <Row key={variant} label={variant}>
              <ToggleGroup type="single" defaultValue="left" variant={variant} aria-label="Align">
                <ToggleGroupItem value="left" icon={<AlignLeft />} label="Align left" />
                <ToggleGroupItem value="center" icon={<AlignCenter />} label="Align center" />
                <ToggleGroupItem value="right" icon={<AlignRight />} label="Align right" />
                <ToggleGroupItem value="justify" icon={<AlignJustify />} label="Justify" />
              </ToggleGroup>
              <ToggleGroup
                type="multiple"
                defaultValue={['bold']}
                variant={variant}
                aria-label="Text style"
              >
                <ToggleGroupItem value="bold" icon={<Bold />} label="Bold" shortcut="mod+b" />
                <ToggleGroupItem value="italic" icon={<Italic />} label="Italic" shortcut="mod+i" />
                <ToggleGroupItem
                  value="underline"
                  icon={<Underline />}
                  label="Underline"
                  shortcut="mod+u"
                />
              </ToggleGroup>
            </Row>
          ))}
        </Example>

        <Example title="Sizes" layout="stack">
          {sizes.map((size) => (
            <Row key={size} label={size}>
              <ToggleGroup type="single" defaultValue="week" variant="outline" size={size}>
                <ToggleGroupItem value="day">Day</ToggleGroupItem>
                <ToggleGroupItem value="week">Week</ToggleGroupItem>
                <ToggleGroupItem value="month">Month</ToggleGroupItem>
              </ToggleGroup>
              <Button variant="outline" size={size}>
                Button
              </Button>
            </Row>
          ))}
        </Example>

        <Example
          title="Compact density"
          description={
            <>
              Inside <Code>&lt;DensityProvider density=&quot;compact&quot;&gt;</Code> toolbars and
              toggle groups default to <Code>xs</Code> without setting <Code>size</Code>.
            </>
          }
          layout="stack"
        >
          <DensityProvider density="compact">
            <div className="flex flex-wrap items-center gap-3">
              <Toolbar aria-label="Text" variant="surface">
                <ToolbarButton icon={<Bold />} label="Bold" />
                <ToolbarButton icon={<Italic />} label="Italic" />
                <ToolbarSeparator />
                <ToggleGroup type="single" defaultValue="left" aria-label="Align">
                  <ToggleGroupItem value="left" icon={<AlignLeft />} label="Align left" />
                  <ToggleGroupItem value="center" icon={<AlignCenter />} label="Align center" />
                  <ToggleGroupItem value="right" icon={<AlignRight />} label="Align right" />
                </ToggleGroup>
              </Toolbar>
              <Text size="xs" tone="muted">
                24px rows for dense property panels
              </Text>
            </div>
          </DensityProvider>
        </Example>
      </div>
    </TooltipProvider>
  )
}
