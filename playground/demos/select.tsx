import { Globe } from 'lucide-react'
import {
  FormField,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../../src'
import { Example } from '../components/demo'

export default function SelectDemo() {
  return (
    <div className="space-y-12">
      <Example title="Basic" layout="stack" className="max-w-sm">
        <Select>
          <SelectTrigger aria-label="Fruit">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="mango">Mango</SelectItem>
            <SelectItem value="dragonfruit" disabled>
              Dragon fruit (out of season)
            </SelectItem>
          </SelectContent>
        </Select>
      </Example>

      <Example title="Sizes" layout="stack" className="max-w-sm">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Select key={size} defaultValue="md">
            <SelectTrigger size={size} aria-label={`Size ${size}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        ))}
      </Example>

      <Example title="Groups, icon & form field" layout="stack" className="max-w-sm">
        <FormField label="Timezone" description="Used for scheduled reports.">
          <Select defaultValue="asia-hcm">
            <SelectTrigger>
              <span className="flex items-center gap-2">
                <Globe />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Asia</SelectLabel>
                <SelectItem value="asia-hcm">Ho Chi Minh (GMT+7)</SelectItem>
                <SelectItem value="asia-tokyo">Tokyo (GMT+9)</SelectItem>
                <SelectItem value="asia-sg">Singapore (GMT+8)</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Europe</SelectLabel>
                <SelectItem value="eu-berlin">Berlin (GMT+2)</SelectItem>
                <SelectItem value="eu-london">London (GMT+1)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Plan" required error="Please choose a plan.">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Choose a plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hobby">Hobby</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </Example>
    </div>
  )
}
