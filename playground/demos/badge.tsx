import { Check, Sparkles } from 'lucide-react'
import { Badge, type Tone } from '../../src'
import { Example, Row } from '../components/demo'

const tones: Tone[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info']

export default function BadgeDemo() {
  return (
    <div className="space-y-12">
      <Example title="Variants × tones" layout="stack">
        {(['soft', 'solid', 'outline'] as const).map((variant) => (
          <Row key={variant} label={variant}>
            {tones.map((tone) => (
              <Badge key={tone} variant={variant} tone={tone}>
                {tone}
              </Badge>
            ))}
          </Row>
        ))}
      </Example>

      <Example title="Sizes & shapes">
        <Badge size="sm">Small</Badge>
        <Badge size="md">Medium</Badge>
        <Badge shape="rounded" tone="primary">
          Rounded
        </Badge>
        <Badge shape="rounded" size="sm" variant="outline">
          v0.1.0
        </Badge>
      </Example>

      <Example title="Dot & icon">
        <Badge dot tone="success">
          Operational
        </Badge>
        <Badge dot tone="warning">
          Degraded
        </Badge>
        <Badge dot tone="danger">
          Outage
        </Badge>
        <Badge tone="primary" variant="outline">
          <Sparkles />
          New
        </Badge>
        <Badge tone="success" variant="solid">
          <Check />
          Verified
        </Badge>
      </Example>
    </div>
  )
}
