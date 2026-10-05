import { useState } from 'react'
import {
  Button,
  ButtonGroup,
  Code,
  Combobox,
  DatePicker,
  FileUpload,
  Kanban,
  LocaleProvider,
  Pagination,
  Text,
  vi,
  type ComboboxOption,
} from '../../src'
import { CodeBlock, Example } from '../components/demo'

const fruits: ComboboxOption[] = ['Apple', 'Mango', 'Durian', 'Lychee'].map((f) => ({
  value: f.toLowerCase(),
  label: f,
}))

function Showcase() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="grid content-start gap-4">
        <DatePicker aria-label="Date" />
        <Combobox options={fruits} aria-label="Fruit" />
        <Pagination pageCount={8} defaultPage={3} size="sm" />
      </div>
      <FileUpload accept="image/*" description="PNG, JPG · 2 MB" />
      <div className="md:col-span-2">
        <Kanban
          aria-label="Tasks"
          columns={[
            { id: 'todo', title: 'To do', tone: 'info' },
            { id: 'done', title: 'Done', tone: 'success' },
          ]}
          defaultValue={{ todo: [{ id: '1', title: 'Translate the docs' }], done: [] }}
          columnWidth={240}
          onAddCard={() => {}}
          renderCard={(item) => <span className="font-medium">{item.title}</span>}
        />
      </div>
    </div>
  )
}

export default function I18nDemo() {
  const [language, setLanguage] = useState<'en' | 'vi'>('vi')

  return (
    <div className="space-y-12">
      <Example
        title="Switch the language"
        description="Every built-in label, placeholder, validation message and screen-reader announcement comes from one message pack. Dates and numbers follow the locale."
        layout="stack"
      >
        <ButtonGroup>
          <Button
            size="sm"
            variant={language === 'en' ? 'solid' : 'outline'}
            onClick={() => setLanguage('en')}
            aria-pressed={language === 'en'}
          >
            English
          </Button>
          <Button
            size="sm"
            variant={language === 'vi' ? 'solid' : 'outline'}
            onClick={() => setLanguage('vi')}
            aria-pressed={language === 'vi'}
          >
            Tiếng Việt
          </Button>
        </ButtonGroup>
        <LocaleProvider
          locale={language === 'vi' ? 'vi-VN' : 'en-US'}
          messages={language === 'vi' ? vi : undefined}
        >
          <Showcase />
        </LocaleProvider>
        <Text size="sm" tone="muted">
          Tip: the <strong>EN / VI</strong> switch in the header translates the whole playground.
        </Text>
      </Example>

      <Example title="Setup" layout="stack">
        <Text size="sm">
          Wrap your app once. Without a provider momi-ui speaks English and formats with the
          browser&apos;s locale.
        </Text>
        <CodeBlock
          code={`import { LocaleProvider, vi } from 'momi-ui'

<LocaleProvider locale="vi-VN" messages={vi}>
  <App />
</LocaleProvider>`}
        />
      </Example>

      <Example title="Change a few words" layout="stack">
        <Text size="sm">
          <Code>messages</Code> is merged over the parent provider (English at the root), so you
          only pass what you want to change. Nest providers to reword one part of the app.
        </Text>
        <CodeBlock
          code={`<LocaleProvider messages={{ kanban: { addCard: 'New task' }, pagination: { next: 'More' } }}>
  …
</LocaleProvider>`}
        />
        <Text size="sm">
          For a single instance, components with built-in text take a <Code>labels</Code> prop
          (their specific props such as <Code>placeholder</Code> still win):
        </Text>
        <CodeBlock
          code={`<Pagination pageCount={10} labels={{ previous: 'Back', next: 'More' }} />`}
        />
      </Example>

      <Example title="Add a language" layout="stack">
        <Text size="sm">
          Type a pack as <Code>MomiMessages</Code> and TypeScript lists every string you still need.
          Messages that contain values are functions, so each language can order and pluralize them
          its own way.
        </Text>
        <CodeBlock
          code={`import { en, type MomiMessages } from 'momi-ui'

export const ja: MomiMessages = {
  ...en,
  pagination: {
    nav: 'ページ送り',
    previous: '前へ',
    next: '次へ',
    previousPage: '前のページ',
    nextPage: '次のページ',
    page: (page) => \`\${page} ページ\`,
  },
  // …
}`}
        />
        <Text size="sm">
          Need a translated string in your own component?{' '}
          <Code>useMessages(&apos;common&apos;)</Code> returns the active group,{' '}
          <Code>useLocale()</Code> the locale.
        </Text>
      </Example>
    </div>
  )
}
