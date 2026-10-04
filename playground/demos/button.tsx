import { ArrowRight, Download, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button, type ButtonTone, type ButtonVariant } from '../../src'
import { Example, Row } from '../components/demo'

const variants: ButtonVariant[] = ['solid', 'soft', 'outline', 'ghost', 'link']
const tones: ButtonTone[] = ['primary', 'neutral', 'danger']

export default function ButtonDemo() {
  const [saving, setSaving] = useState(false)

  return (
    <div className="space-y-12">
      <Example title="Variants">
        {variants.map((v) => (
          <Button key={v} variant={v}>
            {v[0].toUpperCase() + v.slice(1)}
          </Button>
        ))}
      </Example>

      <Example
        title="Tones"
        description="primary follows the accent color; outline and ghost default to neutral."
        layout="stack"
      >
        {tones.map((tone) => (
          <Row key={tone} label={tone}>
            {variants.map((v) => (
              <Button key={v} variant={v} tone={tone}>
                {v}
              </Button>
            ))}
          </Row>
        ))}
      </Example>

      <Example title="Sizes">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </Example>

      <Example title="With icons">
        <Button leftIcon={<Plus />}>New project</Button>
        <Button variant="outline" leftIcon={<Download />}>
          Export
        </Button>
        <Button variant="soft" rightIcon={<ArrowRight />}>
          Continue
        </Button>
        <Button variant="ghost" tone="danger" leftIcon={<Trash2 />}>
          Delete
        </Button>
      </Example>

      <Example title="Loading & disabled">
        <Button
          loading={saving}
          onClick={() => {
            setSaving(true)
            window.setTimeout(() => setSaving(false), 1500)
          }}
        >
          {saving ? 'Saving…' : 'Click to save'}
        </Button>
        <Button loading variant="outline">
          Loading
        </Button>
        <Button disabled>Disabled</Button>
        <Button disabled variant="outline">
          Disabled
        </Button>
      </Example>

      <Example title="Full width & as link" layout="stack" className="max-w-sm">
        <Button fullWidth size="lg">
          Full width
        </Button>
        <Button fullWidth variant="outline" asChild>
          <a href="#/overview">Rendered as an &lt;a&gt; with asChild</a>
        </Button>
      </Example>
    </div>
  )
}
