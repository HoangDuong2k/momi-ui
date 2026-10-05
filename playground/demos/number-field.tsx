import { MoveHorizontal, MoveVertical, RotateCw } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import {
  ColorPicker,
  DensityProvider,
  FormField,
  LocaleProvider,
  NumberField,
  Slider,
  Text,
} from '../../src'
import { Example } from '../components/demo'

/** One row of a property panel: label · slider · number. Apps compose this themselves. */
function PropertyRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid h-7 grid-cols-[5.5rem_1fr] items-center gap-2">
      <Text size="xs" tone="muted" truncate>
        {label}
      </Text>
      <div className="flex min-w-0 items-center gap-2">{children}</div>
    </div>
  )
}

function SliderNumber({
  label,
  value,
  onChange,
  onCommit,
  min,
  max,
  step,
  reset,
  unit,
  format,
  parse,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  onCommit: () => void
  min: number
  max: number
  step: number
  reset: number
  unit?: string
  format?: (v: number) => number
  parse?: (n: number) => number
}) {
  return (
    <PropertyRow label={label}>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        onValueCommit={onCommit}
        min={min}
        max={max}
        step={step}
        origin={min < 0 ? 0 : undefined}
        resetValue={reset}
        thumbLabels={[label]}
      />
      <NumberField
        aria-label={label}
        value={value}
        onValueChange={onChange}
        onValueCommit={onCommit}
        min={min}
        max={max}
        step={step}
        resetValue={reset}
        unit={unit}
        format={format}
        parse={parse}
        wrapperClassName="w-20 shrink-0"
      />
    </PropertyRow>
  )
}

function PropertyPanel() {
  const [brightness, setBrightness] = useState(-0.4)
  const [opacity, setOpacity] = useState(0.85)
  const [speed, setSpeed] = useState(33)
  const [color, setColor] = useState('#e3a04a')
  const [history, setHistory] = useState(0)
  const commit = () => setHistory((h) => h + 1)

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,340px)_1fr] sm:items-start">
      <DensityProvider density="compact">
        <div className="grid gap-1 rounded-lg border bg-card p-3 shadow-xs">
          <SliderNumber
            label="Brightness"
            value={brightness}
            onChange={setBrightness}
            onCommit={commit}
            min={-1}
            max={1}
            step={0.01}
            reset={0}
          />
          <SliderNumber
            label="Opacity"
            value={opacity}
            onChange={setOpacity}
            onCommit={commit}
            min={0}
            max={1}
            step={0.01}
            reset={1}
            unit="%"
            format={(v) => v * 100}
            parse={(n) => n / 100}
          />
          <SliderNumber
            label="Disc speed"
            value={speed}
            onChange={setSpeed}
            onCommit={commit}
            min={0}
            max={78}
            step={1}
            reset={33}
            unit="rpm"
          />
          <PropertyRow label="Glow color">
            <ColorPicker
              aria-label="Glow color"
              value={color}
              onValueChange={setColor}
              onValueCommit={commit}
              className="w-full"
            />
          </PropertyRow>
        </div>
      </DensityProvider>
      <Text size="sm" tone="muted">
        Every row is 28px. Drag a slider, a number or its label, double-click to reset. Undo steps
        so far: <span className="font-medium text-foreground tabular-nums">{history}</span> — one
        per drag, not one per pixel.
      </Text>
    </div>
  )
}

export default function NumberFieldDemo() {
  const [x, setX] = useState(120)
  const [y, setY] = useState(48)

  return (
    <div className="space-y-12">
      <Example
        title="Drag to change"
        description="Drag the label — or the field itself before it has focus — left and right. Shift ×10, Alt ×0.1, Esc cancels. Click to type; arrows step; Enter commits; Esc restores."
        layout="start"
      >
        <NumberField
          label={<MoveHorizontal />}
          aria-label="X position"
          value={x}
          onValueChange={setX}
          unit="px"
          resetValue={0}
          wrapperClassName="w-32"
        />
        <NumberField
          label={<MoveVertical />}
          aria-label="Y position"
          value={y}
          onValueChange={setY}
          unit="px"
          resetValue={0}
          wrapperClassName="w-32"
        />
        <NumberField
          label={<RotateCw />}
          aria-label="Rotation"
          defaultValue={15}
          min={-360}
          max={360}
          unit="°"
          resetValue={0}
          wrapperClassName="w-28"
        />
      </Example>

      <Example
        title="Stored vs shown"
        description="format/parse show a different number than the one stored — here 0…1 is shown as 0…100 %."
        layout="start"
      >
        <FormField label="Opacity" className="w-40">
          <NumberField
            defaultValue={0.6}
            min={0}
            max={1}
            step={0.01}
            unit="%"
            format={(v) => v * 100}
            parse={(n) => n / 100}
          />
        </FormField>
        <FormField label="Duration" className="w-40">
          <NumberField defaultValue={2.5} min={0} step={0.1} unit="s" />
        </FormField>
      </Example>

      <Example
        title="Decimal comma"
        description='Numbers follow the LocaleProvider locale (vi-VN shows "0,5"); typing accepts both "0,5" and "0.5".'
        layout="start"
      >
        <LocaleProvider locale="vi-VN">
          <FormField label="Độ sáng" className="w-40">
            <NumberField defaultValue={-0.4} min={-1} max={1} step={0.01} />
          </FormField>
        </LocaleProvider>
      </Example>

      <Example
        title="Property panel recipe"
        description="Inside a compact DensityProvider, Slider and NumberField compose a 28px row: label · slider · number."
        layout="stack"
      >
        <PropertyPanel />
      </Example>
    </div>
  )
}
