import { Alert, Code, Text } from '../../src'
import { CodeBlock, Example } from '../components/demo'

export default function InstallationDemo() {
  return (
    <div className="space-y-12">
      <Example title="1. Install" layout="stack">
        <Text size="sm">
          momi-ui isn&apos;t on npm yet. <strong>Developing side by side</strong> — point at the
          repo and keep <Code>dist/</Code> rebuilding:
        </Text>
        <CodeBlock
          code={`// your app's package.json
"momi-ui": "file:../momi-ui"

// in ../momi-ui
npm run dev:lib   # rebuilds JS, types and CSS on every change`}
        />
        <Text size="sm">
          <strong>CI and releases</strong> — install a git tag; <Code>prepare</Code> builds it on
          install:
        </Text>
        <CodeBlock code={`"momi-ui": "github:HoangDuong2k/momi-ui#v0.3.0"`} />
        <Text size="sm" tone="muted">
          Peer dependencies: <Code>react</Code> and <Code>react-dom</Code> 19+. With{' '}
          <Code>file:</Code>, add{' '}
          <Code>resolve.dedupe: [&apos;react&apos;, &apos;react-dom&apos;]</Code> to your Vite
          config.
        </Text>
      </Example>

      <Example title="2. Add the styles" layout="stack">
        <Text size="sm">
          <strong>Tailwind CSS v4 project</strong> (recommended) — in your main CSS file:
        </Text>
        <CodeBlock
          code={`@import 'tailwindcss';
@import 'momi-ui/tailwind.css'; /* tokens + scans the momi-ui bundle */`}
        />
        <Text size="sm">
          <strong>No Tailwind</strong> — import the precompiled stylesheet once:
        </Text>
        <CodeBlock code={`import 'momi-ui/styles.css'`} />
        <Text size="sm">
          <strong>Existing global CSS</strong> (e.g. <Code>button {'{ … }'}</Code> rules) — put it
          in a layer between Tailwind&apos;s base and components so it beats the reset but not
          momi&apos;s classes:
        </Text>
        <CodeBlock
          code={`@layer theme, base, legacy, components, utilities;
@import 'tailwindcss';
@import 'momi-ui/tailwind.css';
@import './legacy.css' layer(legacy);`}
        />
      </Example>

      <Example title="3. Providers (optional)" layout="stack">
        <CodeBlock
          code={`import { ThemeProvider, Toaster, TooltipProvider } from 'momi-ui'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}`}
        />
        <Text size="sm" tone="muted">
          ThemeProvider handles light/dark/system. Toaster is needed for <Code>toast()</Code>;
          TooltipProvider makes neighbouring tooltips open instantly.
        </Text>
      </Example>

      <Example title="4. Use components" layout="stack">
        <CodeBlock
          code={`import { Button, Card, CardContent, CardHeader, CardTitle } from 'momi-ui'

export function Welcome() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello momi</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Get started</Button>
      </CardContent>
    </Card>
  )
}`}
        />
      </Example>

      <Example title="Theming" layout="stack">
        <CodeBlock
          code={`:root {
  --primary: oklch(0.546 0.245 262.881);
  --primary-foreground: oklch(0.985 0 0);
  --ring: oklch(0.546 0.245 262.881);
  --radius: 0.75rem;
}
.dark {
  --primary: oklch(0.623 0.214 259.815);
}`}
        />
        <Alert tone="info" title="Next.js">
          The bundle starts with &quot;use client&quot;, so components work in the App Router. Wrap
          providers in a client component and render it from your root layout.
        </Alert>
      </Example>
    </div>
  )
}
