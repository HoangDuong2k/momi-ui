import { Blockquote, Code, Heading, Kbd, Link, Text } from '../../src'
import { Example, Row } from '../components/demo'

export default function TypographyDemo() {
  return (
    <div className="space-y-12">
      <Example
        title="Heading"
        description="The semantic level (as) and the visual size are independent."
        layout="stack"
      >
        <Heading as="h1" size="display">
          Display heading
        </Heading>
        <Heading as="h1">Heading 1 — default 2xl</Heading>
        <Heading as="h2">Heading 2 — default xl</Heading>
        <Heading as="h3">Heading 3 — default lg</Heading>
        <Heading as="h4">Heading 4 — default md</Heading>
        <Heading as="h5" weight="medium">
          Heading 5 — medium weight
        </Heading>
      </Example>

      <Example title="Text" layout="stack">
        <Row label="size">
          <Text as="span" size="xs">
            xs
          </Text>
          <Text as="span" size="sm">
            sm
          </Text>
          <Text as="span" size="md">
            md
          </Text>
          <Text as="span" size="lg">
            lg
          </Text>
          <Text as="span" size="xl">
            xl
          </Text>
        </Row>
        <Row label="tone">
          <Text as="span">default</Text>
          <Text as="span" tone="muted">
            muted
          </Text>
          <Text as="span" tone="primary">
            primary
          </Text>
          <Text as="span" tone="success">
            success
          </Text>
          <Text as="span" tone="warning">
            warning
          </Text>
          <Text as="span" tone="danger">
            danger
          </Text>
          <Text as="span" tone="info">
            info
          </Text>
        </Row>
        <Row label="weight">
          <Text as="span" weight="normal">
            normal
          </Text>
          <Text as="span" weight="medium">
            medium
          </Text>
          <Text as="span" weight="semibold">
            semibold
          </Text>
          <Text as="span" weight="bold">
            bold
          </Text>
        </Row>
      </Example>

      <Example title="Link" layout="start" className="gap-6">
        <Link href="#/typography">Default link</Link>
        <Link href="#/typography" variant="muted">
          Muted link
        </Link>
        <Link href="#/typography" variant="underline">
          Underlined link
        </Link>
        <Link href="https://tailwindcss.com" external>
          External link
        </Link>
      </Example>

      <Example title="Code & Kbd" layout="stack">
        <Text>
          Install with <Code>npm install momi-ui</Code> and import <Code>momi-ui/tailwind.css</Code>
          .
        </Text>
        <Text>
          Open the command menu with <Kbd>⌘</Kbd> <Kbd>K</Kbd> or <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>.
        </Text>
      </Example>

      <Example title="Blockquote" layout="stack">
        <Blockquote author="Dieter Rams">Less, but better.</Blockquote>
      </Example>

      <Example title="Prose sample" layout="stack" className="max-w-none">
        <article className="max-w-prose space-y-4">
          <Text size="sm" tone="muted" weight="medium">
            Design notes
          </Text>
          <Heading as="h2" size="xl">
            Whitespace is a feature
          </Heading>
          <Text tone="muted" size="lg">
            Modern Minimal interfaces lean on typography, spacing and a restrained palette instead
            of decoration.
          </Text>
          <Text>
            Every component in momi-ui is built from the same small set of tokens: a neutral scale,
            one accent color and a single radius. Change them once in <Code>theme.css</Code> and the
            whole system follows. Read more about <Link href="#/tokens">design tokens</Link>.
          </Text>
        </article>
      </Example>
    </div>
  )
}
