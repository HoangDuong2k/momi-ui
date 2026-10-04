import { FormField, NativeSelect } from '../../src'
import { Example } from '../components/demo'

const countries = ['Vietnam', 'Japan', 'Singapore', 'Germany', 'United States']

export default function NativeSelectDemo() {
  return (
    <div className="space-y-12">
      <Example title="Sizes" layout="stack" className="max-w-sm">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <NativeSelect key={size} size={size} aria-label={`Size ${size}`} defaultValue="Vietnam">
            {countries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </NativeSelect>
        ))}
      </Example>

      <Example title="Placeholder & field" layout="stack" className="max-w-sm">
        <FormField label="Country" description="Used for tax calculation.">
          <NativeSelect placeholder="Select a country">
            {countries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </NativeSelect>
        </FormField>
        <FormField label="Timezone" error="Please choose a timezone." required>
          <NativeSelect placeholder="Select a timezone">
            <option>GMT+7 — Ho Chi Minh</option>
            <option>GMT+9 — Tokyo</option>
          </NativeSelect>
        </FormField>
      </Example>

      <Example title="Groups & disabled" layout="stack" className="max-w-sm">
        <NativeSelect aria-label="Framework" defaultValue="react">
          <optgroup label="Frontend">
            <option value="react">React</option>
            <option value="vue">Vue</option>
          </optgroup>
          <optgroup label="Meta">
            <option value="next">Next.js</option>
            <option value="astro">Astro</option>
          </optgroup>
        </NativeSelect>
        <NativeSelect aria-label="Disabled" disabled defaultValue="locked">
          <option value="locked">Disabled</option>
        </NativeSelect>
      </Example>
    </div>
  )
}
