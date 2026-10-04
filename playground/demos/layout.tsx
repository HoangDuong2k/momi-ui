import { Container, Grid, Heading, HStack, Section, Stack, Text, VStack } from '../../src'
import { Box, Example } from '../components/demo'

export default function LayoutDemo() {
  return (
    <div className="space-y-12">
      <Example
        title="Container"
        description="Centered column with responsive side padding: sm · md · lg (default) · xl · full."
        layout="stack"
        className="px-0 sm:px-0"
      >
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Container key={size} size={size}>
            <Box>size=&quot;{size}&quot;</Box>
          </Container>
        ))}
      </Example>

      <Example
        title="Stack, HStack, VStack"
        description="Flexbox with a spacing scale (1 = 0.25rem)."
        layout="stack"
      >
        <HStack gap={2}>
          <Box className="w-20">1</Box>
          <Box className="w-20">2</Box>
          <Box className="w-20">3</Box>
        </HStack>
        <VStack gap={2} className="max-w-xs">
          <Box>A</Box>
          <Box>B</Box>
        </VStack>
        <HStack justify="between">
          <Box className="w-24">start</Box>
          <Box className="w-24">end</Box>
        </HStack>
      </Example>

      <Example
        title="Responsive direction"
        description={'direction={{ base: "column", md: "row" }} — resize the window.'}
        layout="stack"
      >
        <Stack direction={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 6 }}>
          <Box className="flex-1">One</Box>
          <Box className="flex-1">Two</Box>
          <Box className="flex-1">Three</Box>
        </Stack>
      </Example>

      <Example title="Grid" description={'columns={{ base: 1, sm: 2, lg: 4 }}'} layout="stack">
        <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={3}>
          {Array.from({ length: 8 }, (_, i) => (
            <Box key={i}>{i + 1}</Box>
          ))}
        </Grid>
      </Example>

      <Example
        title="Auto-fit grid"
        description={'minChildWidth="10rem" fits as many columns as the space allows.'}
        layout="stack"
      >
        <Grid minChildWidth="10rem" gap={3}>
          {Array.from({ length: 6 }, (_, i) => (
            <Box key={i}>card {i + 1}</Box>
          ))}
        </Grid>
      </Example>

      <Example
        title="Section"
        description="Vertical rhythm for landing pages: spacing sm · md · lg, tone muted, bordered."
        layout="stack"
        className="overflow-hidden p-0 sm:p-0"
      >
        <Section spacing="sm" tone="muted" bordered>
          <Container size="sm" className="text-center">
            <Heading as="h3" size="lg">
              A section heading
            </Heading>
            <Text tone="muted" className="mt-2">
              Sections stack vertically and own their background and spacing.
            </Text>
          </Container>
        </Section>
      </Example>
    </div>
  )
}
