import { X } from 'lucide-react'
import { useState } from 'react'
import { Combobox, FormField, Text, type ComboboxOption } from '../../src'
import { Example } from '../components/demo'

/* Tags with a color each — kept next to the options, passed through renderChip / renderOption. */
const palette = ['#e11d48', '#ea580c', '#16a34a', '#0891b2', '#7c3aed', '#db2777']
const initialTags: (ComboboxOption & { color: string })[] = [
  { value: 'bug', label: 'Bug', color: palette[0] },
  { value: 'feature', label: 'Feature', color: palette[3] },
  { value: 'design', label: 'Design', color: palette[4] },
]

function TagsExample() {
  const [tags, setTags] = useState(initialTags)
  const [value, setValue] = useState<string[]>(['bug'])
  const colorOf = (option: ComboboxOption) =>
    tags.find((t) => t.value === option.value)?.color ?? palette[5]
  return (
    <FormField label="Labels" description="Type a new name and press Enter to create it.">
      <Combobox
        multiple
        options={tags}
        value={value}
        onValueChange={setValue}
        maxBadges={4}
        placeholder="Add labels"
        onCreate={(query) => {
          const tag = {
            value: query.toLowerCase().replace(/\s+/g, '-'),
            label: query,
            color: palette[tags.length % palette.length],
          }
          setTags((t) => [...t, tag])
          return tag
        }}
        renderOption={(option) => (
          <span className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: colorOf(option) }}
            />
            <span className="truncate">{option.label}</span>
          </span>
        )}
        renderChip={(option, remove) => (
          <span
            className="inline-flex h-5 max-w-32 items-center gap-1 rounded-md ps-1.5 pe-0.5 text-[11px] font-medium"
            style={{
              color: colorOf(option),
              background: `color-mix(in oklab, ${colorOf(option)} 14%, transparent)`,
            }}
          >
            <span className="truncate">{option.label}</span>
            <span
              role="button"
              tabIndex={-1}
              aria-label={`Remove ${option.label}`}
              onPointerDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                remove()
              }}
              className="rounded-sm p-0.5 opacity-70 hover:opacity-100"
            >
              <X className="size-3" />
            </span>
          </span>
        )}
      />
    </FormField>
  )
}

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
        title="Create options, custom chips"
        description="onCreate adds what isn’t in the list; renderChip and renderOption draw each tag in its own color. Backspace in the empty search removes the last tag."
        layout="stack"
        className="max-w-sm"
      >
        <TagsExample />
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
