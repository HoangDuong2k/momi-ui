import { Changelog, type ChangelogRelease } from '../../src'
import { CodeBlock, Example } from '../components/demo'

const releases: ChangelogRelease[] = [
  {
    version: 'v0.3.0',
    date: '2026-10-20',
    title: 'Built for desktop apps',
    content: (
      <p>
        Compact sizes, a color picker, scrubbable number fields and resizable panels — everything a
        dense editor UI needs.
      </p>
    ),
    changes: [
      { type: 'new', content: 'ColorPicker with hex / rgba input, swatches and an eyedropper.' },
      { type: 'new', content: 'NumberField: drag horizontally to change, Shift ×10, Alt ×0.1.' },
      { type: 'improved', content: 'Slider double-clicks back to its default value.' },
    ],
  },
  {
    version: 'v0.2.0',
    date: '2026-10-05',
    title: 'Kanban and Vietnamese',
    changes: [
      { type: 'new', content: 'Kanban board with mouse, touch and keyboard drag and drop.' },
      { type: 'new', content: 'LocaleProvider with built-in English and Vietnamese text.' },
      { type: 'improved', content: 'DataTable formats dates and numbers with the locale.' },
      { type: 'fixed', content: 'Toaster no longer appends English text to custom labels.' },
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-10-04',
    title: 'First release',
    changes: [
      { type: 'new', content: 'Core components, DataTable and landing page blocks.' },
      { type: 'new', content: 'Light, dark and system themes with OKLCH tokens.' },
    ],
  },
]

export default function ChangelogDemo() {
  return (
    <div className="space-y-12">
      <Example
        title="Releases"
        description="Newest first. Each version is an anchor (#v0.2.0) for deep links from release notes or GitHub; dates follow the locale."
        layout="stack"
        className="p-6 sm:p-10"
      >
        {/* The playground routes with the hash, so version links scroll here instead. */}
        <div
          onClickCapture={(e) => {
            const link = (e.target as Element).closest('a[href^="#v"]')
            if (!link) return
            e.preventDefault()
            document.getElementById(link.getAttribute('href')!.slice(1))?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }}
        >
          <Changelog releases={releases} />
        </div>
      </Example>

      <Example title="Data" layout="stack">
        <CodeBlock
          code={`<Changelog
  releases={[
    {
      version: 'v0.2.0',
      date: '2026-10-05',
      title: 'Kanban and Vietnamese',
      changes: [
        { type: 'new', content: 'Kanban board' },
        { type: 'fixed', content: 'Calendar focus in RTL' },
      ],
    },
  ]}
/>`}
        />
      </Example>
    </div>
  )
}
