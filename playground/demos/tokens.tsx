import { Check } from 'lucide-react'
import { Button, cn, Code, Heading, Text } from '../../src'
import { CodeBlock, Example } from '../components/demo'
import { useBrand } from '../lib/brand-context'
import { useCustomizer } from '../lib/customizer-context'
import { accents, radii } from '../lib/customizer-presets'

const colorTokens = [
  ['background', 'foreground'],
  ['card', 'card-foreground'],
  ['primary', 'primary-foreground'],
  ['secondary', 'secondary-foreground'],
  ['muted', 'muted-foreground'],
  ['accent', 'accent-foreground'],
  ['destructive', 'destructive-foreground'],
  ['success', 'success-foreground'],
  ['warning', 'warning-foreground'],
  ['info', 'info-foreground'],
] as const

const lineTokens = ['border', 'input', 'ring'] as const

const surfaceTokens = [
  ['surface-sunken', 'Fields and wells (inputs, timeline)'],
  ['surface-raised', 'Menus, popovers, toasts, dialogs'],
  ['border-strong', 'Borders of raised surfaces'],
] as const

const studioCss = `/* Warm dark desktop theme — tokens only, no component overrides */
:root {
  --radius: 0.375rem;
  --font-sans: 'Hanken Grotesk Variable', system-ui, sans-serif;
  --background: #131211;   --foreground: #ece9e4;
  --card: #191816;         --popover: #211f1d;
  --muted: #211f1d;        --muted-foreground: #8e897f;
  --accent: #2b2926;       --secondary: #2b2926;
  --primary: #e3a04a;      --primary-foreground: #1c1407;
  --border: #2a2825;       --input: #3b3834;   --ring: #e3a04a;
  /* optional surfaces */
  --surface-sunken: #0f0e0d;
  --surface-raised: #211f1d;
  --border-strong: #3b3834;
}

<ThemeProvider forcedTheme="dark">…</ThemeProvider>`

function BrandTheme() {
  const { brand, setBrand } = useBrand()
  return (
    <Example
      title="Brand theme"
      description="momi-ui doesn't have to look like the default. Overriding a handful of tokens re-themes every component — including menus, popovers and toasts rendered in portals."
      layout="stack"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={brand === 'studio' ? 'outline' : 'solid'}
          onClick={() => setBrand(brand === 'studio' ? 'default' : 'studio')}
        >
          {brand === 'studio' ? 'Back to the default theme' : 'Try the Studio theme'}
        </Button>
        <Text size="sm" tone="muted">
          Studio is dark-only, so the playground passes <Code>forcedTheme=&quot;dark&quot;</Code> to{' '}
          <Code>ThemeProvider</Code>.
        </Text>
      </div>
      <CodeBlock code={studioCss} />
      <div className="grid gap-3 sm:grid-cols-3">
        {surfaceTokens.map(([token, use]) => (
          <div key={token} className="grid gap-2">
            <div
              className="h-14 rounded-lg border"
              style={
                token === 'border-strong'
                  ? { borderColor: 'var(--color-border-strong)', borderWidth: 2 }
                  : { background: `var(--color-${token})` }
              }
            />
            <span className="font-mono text-xs">--{token}</span>
            <span className="text-xs text-muted-foreground">{use}</span>
          </div>
        ))}
      </div>
    </Example>
  )
}

export default function TokensDemo() {
  return (
    <div className="space-y-12">
      <Customizer />

      <BrandTheme />

      <Example
        title="Colors"
        description="Semantic tokens — override them on :root and .dark."
        layout="stack"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {colorTokens.map(([bg, fg]) => (
            <div
              key={bg}
              className="flex h-16 items-center justify-between rounded-lg border px-4"
              style={{ background: `var(--${bg})`, color: `var(--${fg})` }}
            >
              <span className="text-sm font-medium">{bg}</span>
              <span className="font-mono text-xs opacity-70">--{fg}</span>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {lineTokens.map((token) => (
            <div key={token} className="flex items-center gap-3 rounded-lg border p-3">
              <span
                className="size-8 rounded-md border-2"
                style={{ borderColor: `var(--${token})` }}
              />
              <span className="font-mono text-xs text-muted-foreground">--{token}</span>
            </div>
          ))}
        </div>
      </Example>

      <Example title="Radius" description="Derived from a single --radius token." layout="start">
        {(
          [
            'rounded-sm',
            'rounded-md',
            'rounded-lg',
            'rounded-xl',
            'rounded-2xl',
            'rounded-full',
          ] as const
        ).map((r) => (
          <div key={r} className="flex flex-col items-center gap-2">
            <div className={cn('size-16 border-2 border-foreground/20 bg-muted', r)} />
            <span className="font-mono text-xs text-muted-foreground">{r}</span>
          </div>
        ))}
      </Example>

      <Example
        title="Type scale"
        description="Geist Variable · tight tracking on headings."
        layout="stack"
      >
        {(['display', '4xl', '3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as const).map((size) => (
          <div key={size} className="flex items-baseline gap-4">
            <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">{size}</span>
            <Heading as="h3" size={size} className="truncate">
              Calm, clear, minimal
            </Heading>
          </div>
        ))}
        <Text tone="muted" className="max-w-prose pt-2">
          Body text uses the same family at 14–16px with relaxed line height. Secondary copy uses
          the muted foreground token for a quiet hierarchy.
        </Text>
      </Example>

      <Example
        title="Elevation"
        description="Soft shadows, hairline borders."
        pattern
        layout="start"
        className="gap-6"
      >
        {(['shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl'] as const).map((s) => (
          <div
            key={s}
            className={cn(
              'flex size-24 items-end rounded-xl border bg-card p-2.5 font-mono text-[11px] text-muted-foreground',
              s,
            )}
          >
            {s}
          </div>
        ))}
      </Example>
    </div>
  )
}

function Customizer() {
  const { accent, radius, setAccent, setRadius } = useCustomizer()
  return (
    <Example
      title="Customize"
      description="Live-edit the primary color and radius. Saved in this browser only."
      layout="stack"
    >
      <div className="space-y-2">
        <span className="text-sm font-medium">Accent</span>
        <div className="flex flex-wrap gap-2">
          {accents.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAccent(a.id)}
              aria-pressed={accent === a.id}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40',
                accent === a.id && 'border-foreground/40 bg-accent',
              )}
            >
              <span
                className="flex size-4 items-center justify-center rounded-full text-white"
                style={{ background: a.swatch }}
              >
                {accent === a.id && <Check className="size-3" />}
              </span>
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium">Radius</span>
        <div className="flex flex-wrap gap-2">
          {radii.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRadius(r.value)}
              aria-pressed={radius === r.value}
              className={cn(
                'h-9 rounded-md border px-3 text-sm transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40',
                radius === r.value && 'border-foreground/40 bg-accent',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </Example>
  )
}
