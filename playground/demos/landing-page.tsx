import { ArrowLeft, ArrowRight, Moon, Play, Sun } from 'lucide-react'
import { useEffect } from 'react'
import {
  AnnouncementBar,
  BrowserFrame,
  Button,
  Container,
  Cta,
  Faq,
  FeatureGrid,
  FeatureSplit,
  Footer,
  Hero,
  HeroBadge,
  IconButton,
  LogoCloud,
  Navbar,
  NewsletterForm,
  PricingTable,
  Section,
  SectionHeader,
  Stats,
  Steps,
  TestimonialGrid,
  toast,
  useTheme,
} from '../../src'
import {
  Brand,
  DashboardPreview,
  faqs,
  features,
  footerColumns,
  logos,
  plans,
  social,
  testimonials,
} from '../lib/landing-content'

const sections = ['features', 'how-it-works', 'pricing', 'faq']

function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <IconButton
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      size="sm"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
    </IconButton>
  )
}

const subscribe = () =>
  new Promise<void>((resolve) =>
    setTimeout(() => {
      toast.success('You are on the list!')
      resolve()
    }, 800),
  )

/** A complete landing page composed only from momi-ui blocks. */
export default function LandingPage({ anchor }: { anchor?: string }) {
  useEffect(() => {
    if (anchor && sections.includes(anchor)) {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [anchor])

  return (
    <div className="min-h-dvh [scroll-padding-top:5rem] bg-background">
      <AnnouncementBar href="#/data-table">
        New: DataTable with virtual scrolling, pinning and drag-to-reorder
      </AnnouncementBar>
      <Navbar
        brand={<Brand />}
        links={[
          { label: 'Features', href: '#/landing-page/features' },
          { label: 'How it works', href: '#/landing-page/how-it-works' },
          { label: 'Pricing', href: '#/landing-page/pricing' },
          { label: 'FAQ', href: '#/landing-page/faq' },
        ]}
        actions={
          <>
            <ThemeButton />
            <Button variant="ghost" size="sm" asChild>
              <a href="#/overview">Docs</a>
            </Button>
            <Button size="sm">Get started</Button>
          </>
        }
      />

      <main>
        <Hero
          eyebrow={
            <HeroBadge label="v0.3" href="#/hero">
              Landing blocks are here
            </HeroBadge>
          }
          title="Build calm interfaces, faster."
          description="momi-ui is a Modern Minimal component library for React and Tailwind CSS v4 — product UI and marketing pages from one design system."
          actions={
            <>
              <Button size="lg" rightIcon={<ArrowRight />}>
                Get started
              </Button>
              <Button size="lg" variant="outline" leftIcon={<Play />}>
                Watch the demo
              </Button>
            </>
          }
          footnote="Free and open source · MIT licensed"
          media={
            <BrowserFrame url="app.momi.dev" className="mx-auto max-w-5xl">
              <DashboardPreview />
            </BrowserFrame>
          }
        />

        <Section spacing="sm">
          <Container size="xl">
            <LogoCloud title="Trusted by fast-moving teams" logos={logos} variant="marquee" />
          </Container>
        </Section>

        <Section id="features" spacing="lg">
          <Container size="xl" className="grid gap-16">
            <SectionHeader
              eyebrow="Features"
              title="Everything you need, nothing you don't"
              description="A focused set of components covering product UIs and marketing pages."
            />
            <FeatureGrid items={features} />
          </Container>
        </Section>

        <Section spacing="lg" tone="muted" bordered>
          <Container size="xl" className="grid gap-24">
            <FeatureSplit
              eyebrow="Product UI"
              title="Dashboards that stay readable"
              description="Cards, badges, tabs and a full-featured DataTable compose into interfaces that scale with your data."
              bullets={[
                'Pinned columns and rows',
                'Virtualized lists',
                'Accessible sorting and reordering',
              ]}
              media={
                <BrowserFrame url="app.momi.dev/analytics">
                  <DashboardPreview />
                </BrowserFrame>
              }
            />
            <FeatureSplit
              reverse
              eyebrow="Marketing"
              title="Landing pages from the same tokens"
              description="Hero, features, pricing, testimonials and FAQ blocks share your theme, so marketing never drifts from product."
              bullets={['Reveal on scroll', 'Count-up stats', 'Marquee logo clouds']}
              media={
                <div className="grid gap-3 rounded-2xl border bg-card p-6 shadow-xs">
                  {['Hero', 'Features', 'Pricing', 'FAQ'].map((name, i) => (
                    <div
                      key={name}
                      className="flex h-14 items-center justify-between rounded-lg border bg-background px-4 text-sm"
                      style={{ opacity: 1 - i * 0.15 }}
                    >
                      <span className="font-medium">{name}</span>
                      <span className="h-2 w-24 rounded-full bg-muted" />
                    </div>
                  ))}
                </div>
              }
            />
          </Container>
        </Section>

        <Section spacing="lg">
          <Container size="xl">
            <Stats
              variant="divided"
              items={[
                { value: 12000, suffix: '+', label: 'Teams', description: 'shipping with momi-ui' },
                {
                  value: 99.99,
                  decimals: 2,
                  suffix: '%',
                  label: 'Uptime',
                  description: 'docs & CDN',
                },
                { value: 60, suffix: '+', label: 'Components', description: 'and blocks' },
                {
                  value: 4.9,
                  decimals: 1,
                  suffix: '/5',
                  label: 'Rating',
                  description: '1,200 reviews',
                },
              ]}
            />
          </Container>
        </Section>

        <Section id="how-it-works" spacing="lg">
          <Container size="lg" className="grid gap-16">
            <SectionHeader eyebrow="How it works" title="From install to launch in three steps" />
            <Steps
              items={[
                { title: 'Install', description: 'npm install momi-ui and import the stylesheet.' },
                {
                  title: 'Theme',
                  description: 'Set your accent and radius with a few CSS variables.',
                },
                {
                  title: 'Ship',
                  description: 'Compose components and blocks into pages your users love.',
                },
              ]}
            />
          </Container>
        </Section>

        <Section spacing="lg" tone="muted" bordered>
          <Container size="xl" className="grid gap-16">
            <SectionHeader
              eyebrow="Testimonials"
              title="Loved by product teams"
              description="Designers and engineers ship faster with one shared system."
            />
            <TestimonialGrid items={testimonials} />
          </Container>
        </Section>

        <Section id="pricing" spacing="lg">
          <Container size="xl" className="grid gap-12">
            <SectionHeader
              eyebrow="Pricing"
              title="Simple, transparent pricing"
              description="Start free. Upgrade when your team grows."
            />
            <PricingTable plans={plans} yearlyBadge="−20%" />
          </Container>
        </Section>

        <Section id="faq" spacing="lg">
          <Container size="lg">
            <Faq
              layout="split"
              eyebrow="FAQ"
              title="Questions & answers"
              description="Can't find what you're looking for? Our team is happy to help."
              items={faqs}
            />
          </Container>
        </Section>

        <Section spacing="lg">
          <Container size="xl">
            <Cta
              variant="primary"
              title="Ready to build something calm?"
              description="Install momi-ui and ship your next page today."
              actions={
                <>
                  <Button size="lg" rightIcon={<ArrowRight />}>
                    Get started
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="#/overview">Browse components</a>
                  </Button>
                </>
              }
            />
          </Container>
        </Section>
      </main>

      <Footer
        brand={<Brand />}
        description="Modern Minimal components and landing blocks for React and Tailwind CSS v4."
        aside={<NewsletterForm onSubscribe={subscribe} className="mt-2" />}
        columns={footerColumns}
        copyright="© 2026 momi-ui. MIT licensed."
        legal={[
          { label: 'Privacy', href: '#/landing-page' },
          { label: 'Terms', href: '#/landing-page' },
        ]}
        social={social}
      />

      <Button
        asChild
        size="sm"
        variant="outline"
        leftIcon={<ArrowLeft />}
        className="fixed bottom-4 left-4 z-50 rounded-full bg-background/80 shadow-lg backdrop-blur"
      >
        <a href="#/overview">Back to components</a>
      </Button>
    </div>
  )
}
