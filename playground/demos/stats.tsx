import { Download, Palette, Rocket } from 'lucide-react'
import { SectionHeader, Stats, Steps } from '../../src'
import { Example } from '../components/demo'

const stats = [
  { value: 12000, suffix: '+', label: 'Teams', description: 'shipping with momi-ui' },
  { value: 99.99, decimals: 2, suffix: '%', label: 'Uptime', description: 'for the docs and CDN' },
  { value: 48, label: 'Components', description: 'and growing every month' },
  { value: 4.9, decimals: 1, suffix: '/5', label: 'Rating', description: 'from 1,200 reviews' },
]

export default function StatsDemo() {
  return (
    <div className="space-y-12">
      <Example
        title="Stats — plain"
        description="Numbers count up when scrolled into view."
        layout="stack"
        className="py-12 sm:py-14"
      >
        <Stats items={stats} />
      </Example>

      <Example title="Divided · cards" layout="stack" className="gap-8">
        <Stats items={stats} variant="divided" />
        <Stats items={stats.slice(0, 3)} variant="cards" align="start" />
      </Example>

      <Example title="Steps — horizontal" layout="stack" className="gap-12 py-12 sm:py-14">
        <SectionHeader eyebrow="How it works" title="From install to launch in three steps" />
        <Steps
          items={[
            { title: 'Install', description: 'npm install momi-ui and import the stylesheet.' },
            {
              title: 'Theme',
              description: 'Set your accent color and radius with a few CSS variables.',
            },
            {
              title: 'Ship',
              description: 'Compose components and blocks into product and marketing pages.',
            },
          ]}
        />
      </Example>

      <Example title="Steps — vertical with icons" layout="stack">
        <Steps
          orientation="vertical"
          className="max-w-md"
          items={[
            {
              icon: <Download />,
              title: 'Install the package',
              description: 'One dependency, tree-shakable.',
            },
            { icon: <Palette />, title: 'Pick your brand', description: 'Accent, radius, fonts.' },
            { icon: <Rocket />, title: 'Launch', description: 'Deploy anywhere React runs.' },
          ]}
        />
      </Example>
    </div>
  )
}
