import { useState } from 'react'
import { Checkbox, FormField, Separator } from '../../src'
import { Example, Row } from '../components/demo'

const items = ['Components', 'Blocks', 'Templates']

export default function CheckboxDemo() {
  const [selected, setSelected] = useState<string[]>(['Components'])
  const allChecked = selected.length === items.length
  const someChecked = selected.length > 0 && !allChecked

  return (
    <div className="space-y-12">
      <Example title="Basic" layout="stack">
        <Row label="states">
          <Checkbox aria-label="Unchecked" />
          <Checkbox aria-label="Checked" defaultChecked />
          <Checkbox aria-label="Indeterminate" defaultChecked="indeterminate" />
          <Checkbox aria-label="Disabled" disabled />
          <Checkbox aria-label="Disabled checked" disabled defaultChecked />
        </Row>
        <Row label="sizes">
          <Checkbox aria-label="Small" size="sm" defaultChecked />
          <Checkbox aria-label="Medium" size="md" defaultChecked />
          <Checkbox aria-label="Large" size="lg" defaultChecked />
        </Row>
      </Example>

      <Example title="With label & description" layout="stack">
        <Checkbox label="Accept terms and conditions" />
        <Checkbox
          label="Marketing emails"
          description="Receive emails about new products, features, and more."
          defaultChecked
        />
        <Checkbox label="Disabled option" description="You can't change this." disabled />
      </Example>

      <Example title="Indeterminate (select all)" layout="stack">
        <Checkbox
          label="Select all"
          checked={allChecked ? true : someChecked ? 'indeterminate' : false}
          onCheckedChange={() => setSelected(allChecked ? [] : items)}
        />
        <Separator />
        <div className="grid gap-3 ps-6">
          {items.map((item) => (
            <Checkbox
              key={item}
              label={item}
              checked={selected.includes(item)}
              onCheckedChange={(checked) =>
                setSelected((s) => (checked ? [...s, item] : s.filter((i) => i !== item)))
              }
            />
          ))}
        </div>
      </Example>

      <Example title="Inside a form field" layout="stack">
        <FormField error="You must accept the terms to continue.">
          <Checkbox label="I agree to the terms of service" />
        </FormField>
      </Example>
    </div>
  )
}
