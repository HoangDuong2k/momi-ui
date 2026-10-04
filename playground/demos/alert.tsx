import { Rocket } from 'lucide-react'
import { useState } from 'react'
import { Alert, Button, type Tone } from '../../src'
import { Example } from '../components/demo'

const tones: { tone: Tone; title: string; text: string }[] = [
  { tone: 'neutral', title: 'Heads up', text: 'You can add components to your app using the CLI.' },
  {
    tone: 'info',
    title: 'Scheduled maintenance',
    text: 'The dashboard will be read-only on Sunday 02:00–03:00 UTC.',
  },
  {
    tone: 'success',
    title: 'Payment received',
    text: 'Invoice INV-001 has been paid. A receipt was emailed to you.',
  },
  {
    tone: 'warning',
    title: 'Usage at 85%',
    text: 'You are close to your monthly limit. Upgrade to avoid interruptions.',
  },
  {
    tone: 'danger',
    title: 'Deployment failed',
    text: 'The build exited with code 1. Check the logs for details.',
  },
]

export default function AlertDemo() {
  const [visible, setVisible] = useState(true)

  return (
    <div className="space-y-12">
      <Example
        title="Outline (default)"
        description="Neutral surface, colored icon."
        layout="stack"
      >
        {tones.map((t) => (
          <Alert key={t.tone} tone={t.tone} title={t.title}>
            {t.text}
          </Alert>
        ))}
      </Example>

      <Example title="Soft" layout="stack">
        {tones.map((t) => (
          <Alert key={t.tone} variant="soft" tone={t.tone} title={t.title}>
            {t.text}
          </Alert>
        ))}
      </Example>

      <Example title="Action, custom icon & dismiss" layout="stack">
        {visible ? (
          <Alert
            tone="primary"
            variant="soft"
            icon={<Rocket />}
            title="momi-ui 0.2 is here"
            action={<Button size="sm">See what&apos;s new</Button>}
            onClose={() => setVisible(false)}
          >
            Overlays, menus, tabs, toasts and tables.
          </Alert>
        ) : (
          <Button variant="outline" onClick={() => setVisible(true)}>
            Show alert again
          </Button>
        )}
        <Alert icon={false} title="No icon">
          Pass icon={'{false}'} to hide it.
        </Alert>
      </Example>
    </div>
  )
}
