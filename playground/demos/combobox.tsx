import { useState } from 'react'
import { Combobox, FormField, Text, type ComboboxOption } from '../../src'
import { Example } from '../components/demo'

const frameworks: ComboboxOption[] = [
  { value: 'react', label: 'React', group: 'Libraries' },
  { value: 'vue', label: 'Vue', group: 'Libraries' },
  { value: 'svelte', label: 'Svelte', group: 'Libraries' },
  { value: 'solid', label: 'Solid', group: 'Libraries', disabled: true },
  { value: 'next', label: 'Next.js', description: 'React framework', group: 'Frameworks' },
  { value: 'nuxt', label: 'Nuxt', description: 'Vue framework', group: 'Frameworks' },
  { value: 'astro', label: 'Astro', description: 'Content-first', group: 'Frameworks' },
  { value: 'remix', label: 'React Router', keywords: ['remix'], group: 'Frameworks' },
]

const cities: ComboboxOption[] = [
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Huế',
  'Nha Trang',
  'Đà Lạt',
].map((c) => ({ value: c, label: c }))

export default function ComboboxDemo() {
  const [framework, setFramework] = useState<string | null>('next')
  const [stack, setStack] = useState<string[]>(['react', 'astro'])

  return (
    <div className="space-y-12">
      <Example title="Single" layout="stack" className="max-w-sm">
        <FormField label="Framework" description="Grouped options with descriptions.">
          <Combobox
            options={frameworks}
            value={framework}
            onValueChange={setFramework}
            placeholder="Select a framework"
            searchPlaceholder="Search frameworks…"
          />
        </FormField>
        <Text size="sm" tone="muted">
          Selected: {framework ?? 'none'}
        </Text>
      </Example>

      <Example title="Multiple" layout="stack" className="max-w-sm">
        <FormField label="Tech stack">
          <Combobox
            multiple
            options={frameworks}
            value={stack}
            onValueChange={setStack}
            placeholder="Pick technologies"
          />
        </FormField>
      </Example>

      <Example
        title="Accent-insensitive search"
        description="Type “da nang” or “ha noi” — Vietnamese diacritics are ignored."
        layout="stack"
        className="max-w-sm"
      >
        <FormField label="City" error="Please choose a city." required>
          <Combobox
            options={cities}
            placeholder="Choose a city"
            searchPlaceholder="Tìm thành phố…"
          />
        </FormField>
      </Example>
    </div>
  )
}
