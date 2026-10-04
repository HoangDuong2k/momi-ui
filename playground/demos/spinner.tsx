import { Button, HStack, Spinner, Text } from '../../src'
import { Example } from '../components/demo'

export default function SpinnerDemo() {
  return (
    <div className="space-y-12">
      <Example title="Sizes">
        <Spinner size="xs" />
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
        <Spinner size="xl" />
      </Example>

      <Example title="Color" description="Uses currentColor.">
        <Spinner className="text-primary" />
        <Spinner className="text-muted-foreground" />
        <Spinner className="text-success" />
        <Spinner className="text-destructive" />
      </Example>

      <Example title="In context">
        <HStack gap={2} className="text-muted-foreground">
          <Spinner size="sm" />
          <Text as="span" size="sm">
            Syncing changes…
          </Text>
        </HStack>
        <Button loading>Deploying</Button>
      </Example>
    </div>
  )
}
