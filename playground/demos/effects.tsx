import { useState } from 'react'
import {
  BackgroundPattern,
  BrowserFrame,
  Button,
  NumberTicker,
  Reveal,
  type BackgroundVariant,
} from '../../src'
import { Example } from '../components/demo'
import { DashboardPreview } from '../lib/landing-content'

const variants: BackgroundVariant[] = ['grid', 'dots', 'glow', 'gradient']

export default function EffectsDemo() {
  const [key, setKey] = useState(0)

  return (
    <div className="space-y-12">
      <Example
        title="Background patterns"
        description="Decorative layers with fade masks."
        layout="stack"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {variants.map((variant) => (
            <div
              key={variant}
              className="relative isolate flex h-40 items-center justify-center overflow-hidden rounded-xl border"
            >
              <BackgroundPattern variant={variant} />
              <span className="font-mono text-sm text-muted-foreground">{variant}</span>
            </div>
          ))}
        </div>
      </Example>

      <Example title="Browser frame" layout="stack">
        <BrowserFrame url="app.momi.dev" className="mx-auto w-full max-w-3xl">
          <DashboardPreview />
        </BrowserFrame>
      </Example>

      <Example
        title="Reveal & number ticker"
        description="Animate in when scrolled into view (instantly visible with reduced motion)."
        layout="stack"
      >
        <Button size="sm" variant="outline" className="w-fit" onClick={() => setKey((k) => k + 1)}>
          Replay
        </Button>
        <div key={key} className="grid gap-4 sm:grid-cols-3">
          {[
            { value: 12000, suffix: '+', label: 'teams' },
            { value: 98.6, decimals: 1, suffix: '%', label: 'satisfaction' },
            { value: 250, prefix: '$', suffix: 'k', label: 'saved per year' },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 120} className="rounded-xl border p-6 text-center">
              <div className="text-3xl font-semibold tracking-tight">
                <NumberTicker
                  value={stat.value}
                  decimals={stat.decimals}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </Example>
    </div>
  )
}
