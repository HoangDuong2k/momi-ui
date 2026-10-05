import { AlignCenter, AlignLeft, AlignRight, Eye, Lock, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  Badge,
  Button,
  ButtonGroup,
  Checkbox,
  Combobox,
  DensityProvider,
  IconButton,
  Input,
  NativeSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
  type Density,
} from '../../src'
import { CodeBlock, Example } from '../components/demo'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
      <span className="truncate text-xs text-muted-foreground">{label}</span>
      <div className="flex min-w-0 items-center gap-2">{children}</div>
    </div>
  )
}

/** A layer inspector, the kind of panel the compact density is made for. */
function Inspector({ density }: { density: Density }) {
  return (
    <DensityProvider density={density}>
      <div className="grid content-start gap-3 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <Text size="sm" weight="semibold">
            Waveform
          </Text>
          <div className="flex items-center gap-1">
            <Badge tone="primary">Audio</Badge>
            <IconButton aria-label="Hide layer">
              <Eye />
            </IconButton>
            <IconButton aria-label="Lock layer">
              <Lock />
            </IconButton>
          </div>
        </div>
        <Tabs defaultValue="style">
          <TabsList fullWidth aria-label="Inspector">
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="motion">Motion</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>
        </Tabs>
        <Row label="Shape">
          <Select defaultValue="bars">
            <SelectTrigger aria-label="Shape">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bars">Bars</SelectItem>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Label">
          <Input aria-label="Label" defaultValue="Now playing" />
        </Row>
        <Row label="Font">
          <Combobox
            aria-label="Font"
            defaultValue="hanken"
            options={[
              { value: 'hanken', label: 'Hanken Grotesk' },
              { value: 'geist', label: 'Geist' },
              { value: 'mono', label: 'JetBrains Mono' },
            ]}
          />
        </Row>
        <Row label="Blend">
          <NativeSelect aria-label="Blend" defaultValue="screen">
            <option value="normal">Normal</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
          </NativeSelect>
        </Row>
        <Row label="Brightness">
          <Slider
            min={-1}
            max={1}
            step={0.05}
            defaultValue={[0.25]}
            origin={0}
            resetValue={0}
            thumbLabels={['Brightness']}
          />
        </Row>
        <Row label="Align">
          <ButtonGroup>
            <IconButton variant="outline" aria-label="Align left">
              <AlignLeft />
            </IconButton>
            <IconButton variant="outline" aria-label="Align center">
              <AlignCenter />
            </IconButton>
            <IconButton variant="outline" aria-label="Align right">
              <AlignRight />
            </IconButton>
          </ButtonGroup>
        </Row>
        <Row label="Glow">
          <Switch aria-label="Glow" defaultChecked />
          <Checkbox aria-label="Sync to beat" defaultChecked />
          <span className="text-xs text-muted-foreground">Sync to beat</span>
        </Row>
        <Button variant="outline" leftIcon={<Plus />} fullWidth>
          Add effect
        </Button>
      </div>
    </DensityProvider>
  )
}

export default function DensityDemo() {
  return (
    <div className="space-y-12">
      <Example
        title="Comfortable vs compact"
        description="The same panel twice. DensityProvider only changes the default size of the controls inside it — spacing stays yours. Double-click the slider to reset it; it fills from 0."
        layout="full"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid content-start gap-2">
            <Text size="xs" tone="muted" weight="medium">
              comfortable (default)
            </Text>
            <Inspector density="comfortable" />
          </div>
          <div className="grid content-start gap-2">
            <Text size="xs" tone="muted" weight="medium">
              compact
            </Text>
            <Inspector density="compact" />
          </div>
        </div>
      </Example>

      <Example
        title="xs size"
        description="24px controls with 12px text and 14px icons — or set size per component."
        layout="start"
      >
        <Button size="xs">Export</Button>
        <Button size="xs" variant="outline">
          Cancel
        </Button>
        <IconButton size="xs" variant="outline" aria-label="Add">
          <Plus />
        </IconButton>
        <Input size="xs" placeholder="Search" className="w-36" />
        <Badge size="xs" tone="success" dot>
          Live
        </Badge>
        <Switch size="xs" aria-label="Snap" defaultChecked />
        <Checkbox size="xs" aria-label="Loop" defaultChecked />
      </Example>

      <Example title="Usage" layout="stack">
        <CodeBlock
          code={`import { DensityProvider } from 'momi-ui'

<DensityProvider density="compact">
  <PropertiesPanel /> {/* Button, Input, Select, Combobox, Tabs, Slider… default to xs */}
</DensityProvider>`}
        />
      </Example>
    </div>
  )
}
