/* eslint-disable react-refresh/only-export-components -- demo content module, not a refresh boundary */
import {
  Accessibility,
  Anchor,
  Compass,
  Feather,
  Gauge,
  Layers,
  Leaf,
  Mail,
  MessageCircle,
  Moon,
  Mountain,
  Palette,
  Rss,
  Snowflake,
  Waves,
  Zap,
} from 'lucide-react'
import type { ReactNode } from 'react'
import {
  Badge,
  Button,
  type FaqItem,
  type FeatureItem,
  type FooterColumn,
  type LogoItem,
  type PricingPlan,
  type Testimonial,
} from '../../src'

/** Shared fake content for the landing block demos and the full landing page. */

function Wordmark({ icon, name }: { icon: ReactNode; name: string }) {
  return (
    <span className="flex items-center gap-2 text-lg font-semibold tracking-tight whitespace-nowrap [&_svg]:size-5">
      {icon}
      {name}
    </span>
  )
}

export const logos: LogoItem[] = [
  { name: 'Northwind', logo: <Wordmark icon={<Waves />} name="Northwind" /> },
  { name: 'Lumen', logo: <Wordmark icon={<Zap />} name="Lumen" /> },
  { name: 'Fernhill', logo: <Wordmark icon={<Leaf />} name="Fernhill" /> },
  { name: 'Summit', logo: <Wordmark icon={<Mountain />} name="Summit" /> },
  { name: 'Polar', logo: <Wordmark icon={<Snowflake />} name="Polar" /> },
  { name: 'Harbor', logo: <Wordmark icon={<Anchor />} name="Harbor" /> },
  { name: 'Compass', logo: <Wordmark icon={<Compass />} name="Compass" /> },
  { name: 'Quill', logo: <Wordmark icon={<Feather />} name="Quill" /> },
]

export const features: FeatureItem[] = [
  {
    icon: <Zap />,
    title: 'Fast by default',
    description: 'Zero-runtime styles on Tailwind CSS v4. Ship less JavaScript, render faster.',
  },
  {
    icon: <Palette />,
    title: 'Themeable to the core',
    description:
      'One accent, one radius, a handful of tokens. Re-brand the whole system in minutes.',
  },
  {
    icon: <Accessibility />,
    title: 'Accessible',
    description: 'Built on Radix primitives with keyboard support, focus management and ARIA.',
  },
  {
    icon: <Layers />,
    title: 'Composable',
    description: 'Small, predictable parts with asChild, data-slot hooks and className overrides.',
  },
  {
    icon: <Moon />,
    title: 'Dark mode',
    description: 'Every component ships with a tuned dark palette and system preference support.',
  },
  {
    icon: <Gauge />,
    title: 'Production-ready',
    description: 'Typed props, tested behavior and a DataTable that handles 10k rows with ease.',
  },
]

export const testimonials: Testimonial[] = [
  {
    quote:
      'We replaced three internal UI kits with momi-ui. Our product finally feels like one product.',
    name: 'Linh Tran',
    role: 'Design Lead, Northwind',
    rating: 5,
  },
  {
    quote: 'The defaults are so good we barely touched the theme. Shipped our new site in a week.',
    name: 'Minh Nguyen',
    role: 'Founder, Lumen',
    rating: 5,
  },
  {
    quote:
      'Accessible out of the box. Our audit went from 40 issues to two — and those were our own copy.',
    name: 'An Pham',
    role: 'Frontend Engineer, Summit',
    rating: 5,
  },
  {
    quote: 'DataTable alone saved us a month. Pinned columns, virtualization, reorder — all there.',
    name: 'Bao Le',
    role: 'Staff Engineer, Polar',
    rating: 4,
  },
  {
    quote: 'Calm, consistent, quick. Exactly the kind of UI our customers trust.',
    name: 'Chi Vo',
    role: 'Head of Product, Harbor',
    rating: 5,
  },
  {
    quote:
      'Landing blocks + app components in one system means marketing and product finally match.',
    name: 'Duy Ho',
    role: 'Growth, Fernhill',
    rating: 5,
  },
]

export const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Open source',
    description: 'Everything you need to build.',
    price: 0,
    features: ['All components', 'Landing blocks', 'Dark mode & theming', 'Community support'],
    cta: <Button variant="outline">Get started</Button>,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For teams shipping every week.',
    price: { monthly: 19, yearly: 15 },
    highlighted: true,
    badge: 'Most popular',
    features: [
      'Everything in Open source',
      'Premium page templates',
      'Figma kit',
      'Priority support',
    ],
    cta: <Button>Start free trial</Button>,
  },
  {
    id: 'team',
    name: 'Team',
    description: 'Scale your design system.',
    price: { monthly: 49, yearly: 39 },
    features: [
      'Everything in Pro',
      'Unlimited seats',
      'Private theme registry',
      { label: 'SSO & audit log', included: false },
    ],
    cta: <Button variant="outline">Contact sales</Button>,
  },
]

export const faqs: FaqItem[] = [
  {
    question: 'Do I need Tailwind CSS?',
    answer:
      'No. Tailwind v4 projects import momi-ui/tailwind.css to share one stylesheet; other projects import the precompiled momi-ui/styles.css.',
  },
  {
    question: 'Can I use it with Next.js?',
    answer:
      'Yes. The bundle is marked "use client", so components work in the App Router; server components can render them as children.',
  },
  {
    question: 'How do I change the brand color?',
    answer:
      'Override --primary, --primary-foreground and --ring on :root and .dark. Everything follows.',
  },
  {
    question: 'Is it accessible?',
    answer:
      'Interactive components are built on Radix primitives and tested with keyboard and screen readers.',
  },
  {
    question: 'What does Pro add?',
    answer:
      'Premium templates, a Figma kit and priority support. The component library itself is free.',
  },
]

export const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Components', href: '#/button' },
      { label: 'Blocks', href: '#/hero' },
      { label: 'Pricing', href: '#/pricing' },
      { label: 'Changelog', href: '#/overview' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#/overview' },
      { label: 'Design tokens', href: '#/tokens' },
      { label: 'Examples', href: '#/landing-page' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#/team' },
      { label: 'Blog', href: '#/overview' },
      { label: 'Contact', href: '#/cta' },
    ],
  },
]

export const social = [
  { label: 'Blog', href: '#/overview', icon: <Rss /> },
  { label: 'Community', href: '#/overview', icon: <MessageCircle /> },
  { label: 'Email', href: '#/overview', icon: <Mail /> },
]

export function Brand() {
  return (
    <a
      href="#/landing-page"
      className="flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary">
        <span className="size-2.5 rounded-full bg-primary-foreground" />
      </span>
      momi<span className="-ms-2 text-muted-foreground">/ui</span>
    </a>
  )
}

/** Small fake dashboard used as hero / feature media. */
export function DashboardPreview() {
  const bars = [38, 52, 44, 63, 58, 72, 66, 81, 77, 90, 84, 96]
  return (
    <div className="grid gap-4 bg-background p-4 sm:p-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Revenue', '$48.2k', '+12%'],
          ['Users', '3,942', '+4%'],
          ['Uptime', '99.99%', 'stable'],
        ].map(([label, value, delta]) => (
          <div key={label} className="grid gap-1 rounded-lg border p-3 text-start">
            <span className="text-[11px] text-muted-foreground">{label}</span>
            <span className="text-base font-semibold tracking-tight sm:text-lg">{value}</span>
            <Badge size="sm" tone="success" className="h-4 px-1.5 text-[10px]">
              {delta}
            </Badge>
          </div>
        ))}
      </div>
      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-medium">Monthly active teams</span>
          <span className="text-muted-foreground">Last 12 months</span>
        </div>
        <div className="flex h-28 items-end gap-1.5 sm:h-36">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-primary/80 transition-[height] duration-700"
              style={{ height: `${h}%`, opacity: 0.35 + (i / bars.length) * 0.65 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
