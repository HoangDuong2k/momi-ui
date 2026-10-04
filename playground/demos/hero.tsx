import { ArrowRight, Play } from 'lucide-react'
import { Button, BrowserFrame, Hero, HeroBadge, NewsletterForm } from '../../src'
import { Example } from '../components/demo'
import { DashboardPreview } from '../lib/landing-content'

export default function HeroDemo() {
  return (
    <div className="space-y-12">
      <Example title="Centered with media" layout="stack" className="overflow-hidden p-0 sm:p-0">
        <Hero
          size="md"
          eyebrow={
            <HeroBadge label="New" href="#/data-table">
              DataTable with virtual scrolling
            </HeroBadge>
          }
          title="Build calm interfaces, faster."
          description="A Modern Minimal component library for React and Tailwind CSS v4 — product UI and landing pages from one design system."
          actions={
            <>
              <Button size="lg" rightIcon={<ArrowRight />}>
                Get started
              </Button>
              <Button size="lg" variant="outline" leftIcon={<Play />}>
                Watch demo
              </Button>
            </>
          }
          footnote="Free and open source · MIT licensed"
          media={
            <BrowserFrame url="app.momi.dev" className="mx-auto max-w-4xl">
              <DashboardPreview />
            </BrowserFrame>
          }
        />
      </Example>

      <Example
        title="Split layout · dots background"
        layout="stack"
        className="overflow-hidden p-0 sm:p-0"
      >
        <Hero
          layout="split"
          size="md"
          background="dots"
          eyebrow={<HeroBadge>Trusted by 2,000+ teams</HeroBadge>}
          title="Ship your next launch this week."
          description="Pre-built landing blocks that share tokens with your app, so marketing and product finally look the same."
          actions={
            <NewsletterForm
              onSubscribe={() => new Promise((r) => setTimeout(r, 900))}
              buttonLabel="Join waitlist"
              note="No spam. Unsubscribe anytime."
            />
          }
          media={
            <BrowserFrame url="momi.dev/blocks">
              <DashboardPreview />
            </BrowserFrame>
          }
        />
      </Example>

      <Example
        title="Glow background, no media"
        layout="stack"
        className="overflow-hidden p-0 sm:p-0"
      >
        <Hero
          size="md"
          background="glow"
          title="Less, but better."
          description="Whitespace, typography and a single accent color do the heavy lifting."
          actions={<Button size="lg">Explore components</Button>}
        />
      </Example>
    </div>
  )
}
