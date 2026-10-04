import { FormField, RadioGroup, RadioGroupItem } from '../../src'
import { Example } from '../components/demo'

export default function RadioGroupDemo() {
  return (
    <div className="space-y-12">
      <Example title="Vertical" layout="stack">
        <RadioGroup defaultValue="comfortable" aria-label="Density">
          <RadioGroupItem value="default" label="Default" />
          <RadioGroupItem value="comfortable" label="Comfortable" />
          <RadioGroupItem value="compact" label="Compact" />
          <RadioGroupItem value="disabled" label="Disabled" disabled />
        </RadioGroup>
      </Example>

      <Example title="Horizontal" layout="stack">
        <RadioGroup defaultValue="monthly" orientation="horizontal" aria-label="Billing">
          <RadioGroupItem value="monthly" label="Monthly" />
          <RadioGroupItem value="yearly" label="Yearly" />
          <RadioGroupItem value="lifetime" label="Lifetime" />
        </RadioGroup>
      </Example>

      <Example title="With descriptions, in a field" layout="stack">
        <FormField label="Notify me about" description="You can change this later in settings.">
          <RadioGroup defaultValue="mentions">
            <RadioGroupItem
              value="all"
              label="All new messages"
              description="Every message in every channel."
            />
            <RadioGroupItem
              value="mentions"
              label="Direct messages and mentions"
              description="Only when someone needs you."
            />
            <RadioGroupItem value="none" label="Nothing" description="Mute all notifications." />
          </RadioGroup>
        </FormField>
      </Example>

      <Example title="Cards" description='variant="card" — fully clickable options.' layout="stack">
        <RadioGroup defaultValue="pro" columns={3} aria-label="Plan">
          <RadioGroupItem
            variant="card"
            value="hobby"
            label="Hobby"
            description="1 project, community support"
            aside="$0"
          />
          <RadioGroupItem
            variant="card"
            value="pro"
            label="Pro"
            description="Unlimited projects, analytics"
            aside="$19"
          />
          <RadioGroupItem
            variant="card"
            value="team"
            label="Team"
            description="SSO, roles, audit log"
            aside="$49"
          />
        </RadioGroup>
      </Example>
    </div>
  )
}
