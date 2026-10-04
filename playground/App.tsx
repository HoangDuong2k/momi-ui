import { ArrowLeft, ArrowRight } from 'lucide-react'
import { createElement, useEffect, useState } from 'react'
import { Button, Heading, Text } from '../src'
import { CodeBlock, SourceView } from './components/demo'
import { Header, Sidebar } from './components/shell'
import { useHashRoute } from './lib/use-hash-route'
import { demos, sources } from './registry'

export function App() {
  const route = useHashRoute()
  const index = Math.max(
    0,
    demos.findIndex((d) => d.id === route),
  )
  const entry = demos[index]
  const prev = demos[index - 1]
  const next = demos[index + 1]
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    document.title = `${entry.title} · momi-ui`
  }, [entry])

  return (
    <div className="min-h-dvh">
      <Header navOpen={navOpen} onToggleNav={() => setNavOpen((o) => !o)} />
      <div className="mx-auto flex max-w-[90rem]">
        <Sidebar active={entry.id} open={navOpen} onNavigate={() => setNavOpen(false)} />
        <main className="min-w-0 flex-1 px-4 pt-10 pb-24 sm:px-8 lg:px-14">
          <div className="mx-auto max-w-4xl">
            <header className="mb-12 space-y-4 border-b pb-10">
              <Text size="sm" tone="muted" weight="medium">
                {entry.group}
              </Text>
              <Heading as="h1" size="3xl">
                {entry.title}
              </Heading>
              <Text size="lg" tone="muted" className="max-w-2xl">
                {entry.description}
              </Text>
              {entry.imports && (
                <CodeBlock
                  className="mt-6"
                  code={`import { ${entry.imports.join(', ')} } from 'momi-ui'`}
                />
              )}
            </header>

            {createElement(entry.component)}

            <div className="mt-16 space-y-10">
              <SourceView key={entry.id} source={sources[`./demos/${entry.id}.tsx`]} />
              <nav
                className="flex items-center justify-between gap-4 border-t pt-8"
                aria-label="Pagination"
              >
                {prev ? (
                  <Button variant="ghost" asChild leftIcon={<ArrowLeft />}>
                    <a href={`#/${prev.id}`}>{prev.title}</a>
                  </Button>
                ) : (
                  <span />
                )}
                {next && (
                  <Button variant="ghost" asChild rightIcon={<ArrowRight />}>
                    <a href={`#/${next.id}`}>{next.title}</a>
                  </Button>
                )}
              </nav>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
