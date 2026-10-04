import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Switch,
} from '../../src'
import { Example, Row } from '../components/demo'

const settings = [
  { label: 'Two-factor authentication', description: 'Require a code when signing in.', on: true },
  {
    label: 'Usage analytics',
    description: 'Share anonymous usage data to improve momi.',
    on: false,
  },
  { label: 'Beta features', description: 'Try new components before they ship.', on: true },
]

export default function SwitchDemo() {
  return (
    <div className="space-y-12">
      <Example title="Sizes & states" layout="stack">
        <Row label="sizes">
          <Switch aria-label="Small" size="sm" defaultChecked />
          <Switch aria-label="Medium" size="md" defaultChecked />
          <Switch aria-label="Large" size="lg" defaultChecked />
        </Row>
        <Row label="states">
          <Switch aria-label="Off" />
          <Switch aria-label="On" defaultChecked />
          <Switch aria-label="Disabled" disabled />
          <Switch aria-label="Disabled on" disabled defaultChecked />
        </Row>
      </Example>

      <Example title="With label" layout="stack">
        <Switch label="Airplane mode" />
        <Switch label="Dark sidebar" description="Applies to the app shell only." defaultChecked />
      </Example>

      <Example title="Settings list" layout="stack" pattern>
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Security & privacy</CardTitle>
            <CardDescription>Manage how your account is protected.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {settings.map((s, i) => (
              <div key={s.label} className="grid gap-4">
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between gap-6">
                  <div className="grid gap-1">
                    <span className="text-sm font-medium">{s.label}</span>
                    <span className="text-[0.8125rem] text-muted-foreground">{s.description}</span>
                  </div>
                  <Switch aria-label={s.label} defaultChecked={s.on} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Example>
    </div>
  )
}
