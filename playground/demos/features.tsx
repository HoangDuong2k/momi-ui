import {
  ArrowRight,
  BarChart3,
  Boxes,
  Command,
  Lock,
  MousePointerClick,
  Sparkles,
} from 'lucide-react'
import {
  Badge,
  BentoCard,
  BentoGrid,
  BrowserFrame,
  Button,
  FeatureGrid,
  FeatureSplit,
  Kbd,
  SectionHeader,
} from '../../src'
import { Example } from '../components/demo'
import { DashboardPreview, features } from '../lib/landing-content'

export default function FeaturesDemo() {
  return (
    <div className="space-y-12">
      <Example title="Feature grid — plain" layout="stack" className="gap-12 py-12 sm:py-14">
        <SectionHeader
          eyebrow="Why momi"
          title="Everything you need, nothing you don't"
          description="A focused set of components that cover product UIs and marketing pages."
        />
        <FeatureGrid items={features} />
      </Example>

      <Example title="Cards · bordered" layout="stack" className="gap-10">
        <FeatureGrid
          items={features.slice(0, 3).map((f) => ({ ...f, href: '#/features' }))}
          variant="cards"
        />
        <FeatureGrid items={features.slice(0, 4)} variant="bordered" columns={4} />
      </Example>

      <Example
        title="Split features"
        description="Alternate with reverse."
        layout="stack"
        className="gap-20 py-12 sm:py-14"
      >
        <FeatureSplit
          eyebrow="Analytics"
          title="See what matters at a glance"
          description="Cards, badges and tables compose into dashboards that stay readable as data grows."
          bullets={['Pinned columns and rows', 'Virtualized lists', 'Accessible sorting']}
          actions={
            <Button variant="outline" rightIcon={<ArrowRight />}>
              Explore DataTable
            </Button>
          }
          media={
            <BrowserFrame url="app.momi.dev/analytics">
              <DashboardPreview />
            </BrowserFrame>
          }
        />
        <FeatureSplit
          reverse
          eyebrow="Theming"
          title="One accent, endless brands"
          description="Swap a handful of CSS variables and every component follows — including dark mode."
          bullets={['OKLCH color tokens', 'Single radius scale', 'System dark mode']}
          media={
            <div className="grid aspect-[4/3] grid-cols-3 gap-3 rounded-2xl border bg-card p-6 shadow-xs">
              {[
                'bg-primary',
                'bg-success',
                'bg-warning',
                'bg-info',
                'bg-destructive',
                'bg-foreground',
              ].map((c) => (
                <div key={c} className={`rounded-xl ${c}`} />
              ))}
            </div>
          }
        />
      </Example>

      <Example title="Bento grid" layout="stack" className="py-12 sm:py-14">
        <BentoGrid>
          <BentoCard
            colSpan={2}
            title="Command palette"
            description="Jump anywhere with ⌘K. Fully keyboard-driven."
            icon={<Command />}
            visual={
              <div className="flex h-full items-center justify-center gap-2 p-6">
                <Kbd className="h-8 min-w-8 text-sm">⌘</Kbd>
                <Kbd className="h-8 min-w-8 text-sm">K</Kbd>
              </div>
            }
          />
          <BentoCard
            rowSpan={2}
            title="Insights"
            description="Charts and stats that read well in light and dark."
            icon={<BarChart3 />}
            delay={80}
            visual={
              <div className="flex h-full items-end gap-2 p-6">
                {[40, 65, 50, 80, 70, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-primary/70"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            }
          />
          <BentoCard
            title="Secure by default"
            description="Sensible defaults for forms and auth flows."
            icon={<Lock />}
            delay={120}
          />
          <BentoCard
            title="Delightful details"
            description="Micro-interactions that never get in the way."
            icon={<MousePointerClick />}
            delay={160}
          />
          <BentoCard
            colSpan={3}
            title="Blocks that compose"
            description="Hero, features, pricing, testimonials, FAQ and footer — all from the same tokens."
            icon={<Boxes />}
            delay={200}
            visual={
              <div className="flex h-full flex-wrap items-center justify-center gap-2 p-6">
                {['Hero', 'Features', 'Bento', 'Stats', 'Pricing', 'FAQ', 'CTA', 'Footer'].map(
                  (b) => (
                    <Badge key={b} variant="outline" size="md">
                      <Sparkles />
                      {b}
                    </Badge>
                  ),
                )}
              </div>
            }
          />
        </BentoGrid>
      </Example>
    </div>
  )
}
