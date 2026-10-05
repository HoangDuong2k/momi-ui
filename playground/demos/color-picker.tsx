import { useState } from 'react'
import { ColorPicker, ColorPickerPanel, FormField, Text } from '../../src'
import { Example, Row } from '../components/demo'

const palette = [
  '#ffffff',
  '#0a0a0a',
  '#e3a04a',
  '#e5484d',
  '#30a46c',
  '#3e63dd',
  '#8e4ec6',
  'rgba(0,0,0,0.6)',
]

export default function ColorPickerDemo() {
  const [text, setText] = useState('#e3a04a')
  const [shadow, setShadow] = useState('rgba(0,0,0,0.6)')
  const [commits, setCommits] = useState<string[]>([])

  return (
    <div className="space-y-12">
      <Example
        title="Field and swatch"
        description="The field shows the hex value and opacity; the swatch is a compact button for dense panels."
        layout="stack"
      >
        <Row label="field">
          <div className="w-48">
            <ColorPicker aria-label="Text color" value={text} onValueChange={setText} />
          </div>
        </Row>
        <Row label="swatch">
          <ColorPicker variant="swatch" size="xs" value={text} onValueChange={setText} />
          <ColorPicker variant="swatch" size="sm" value={text} onValueChange={setText} />
          <ColorPicker variant="swatch" value={text} onValueChange={setText} />
        </Row>
      </Example>

      <Example
        title="Opacity, swatches and commits"
        description="onValueChange fires on every step of a drag; onValueCommit fires once when it ends — one undo step per drag."
        layout="stack"
      >
        <div className="grid gap-6 sm:grid-cols-[14rem_1fr] sm:items-start">
          <FormField label="Shadow color" description="Emits #rrggbb or rgba(r,g,b,a).">
            <ColorPicker
              alpha
              swatches={palette}
              value={shadow}
              onValueChange={setShadow}
              onValueCommit={(v) => setCommits((c) => [v, ...c].slice(0, 5))}
            />
          </FormField>
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <Text size="xs" tone="muted" weight="medium" className="mb-1.5">
              onValueCommit
            </Text>
            {commits.length === 0 ? (
              <Text size="sm" tone="muted">
                Drag in the editor — nothing is logged until you let go.
              </Text>
            ) : (
              <ul className="grid gap-1 font-mono text-xs">
                {commits.map((c, i) => (
                  <li key={i} className={i > 0 ? 'text-muted-foreground' : undefined}>
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Example>

      <Example
        title="Inline panel"
        description="ColorPickerPanel is the editor without the popover — for a custom trigger or a panel that stays open. EyeDropper appears in browsers that support it (Chromium, Electron)."
      >
        <div className="rounded-xl border bg-card p-3 shadow-xs">
          <ColorPickerPanel defaultValue="#3e63dd" alpha swatches={palette} />
        </div>
      </Example>
    </div>
  )
}
