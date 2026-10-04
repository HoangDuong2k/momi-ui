import { HStack, Separator, Text } from '../../src'
import { Example } from '../components/demo'

export default function SeparatorDemo() {
  return (
    <div className="space-y-12">
      <Example title="Horizontal" layout="stack" className="max-w-md">
        <div>
          <Text weight="medium">momi-ui</Text>
          <Text size="sm" tone="muted">
            Modern Minimal components for React.
          </Text>
        </div>
        <Separator />
        <HStack gap={4} className="h-5 text-sm">
          <span>Docs</span>
          <Separator orientation="vertical" />
          <span>Components</span>
          <Separator orientation="vertical" />
          <span>Blocks</span>
        </HStack>
      </Example>

      <Example title="With label" layout="stack" className="max-w-md">
        <Separator label="or continue with" />
        <Separator label="2026" />
        <Separator label={<span className="tracking-widest uppercase">Section</span>} />
      </Example>
    </div>
  )
}
