import { Alert, Code, Text } from '../../src'
import { CodeBlock, Example } from '../components/demo'

export default function InstallationDemo() {
  return (
    <div className="space-y-12">
      <Example title="1. Install" layout="stack">
        <CodeBlock code="npm install momi-ui" />
        <Text size="sm" tone="muted">
          Peer dependencies: <Code>react</Code> and <Code>react-dom</Code> 19+.
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
