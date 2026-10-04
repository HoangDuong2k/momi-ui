import {
  ArrowUpRight,
  Ellipsis,
  Gauge,
  Layers,
  Palette,
  Rocket,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Grid,
  IconButton,
  Text,
} from '../../src'
import { Example } from '../components/demo'

const features = [
  { icon: Zap, title: 'Fast by default', text: 'Zero-runtime styles with Tailwind CSS v4.' },
  { icon: Palette, title: 'Themeable', text: 'One accent, one radius — the system follows.' },
  {
    icon: Shield,
    title: 'Accessible',
    text: 'Built on Radix primitives with full keyboard support.',
  },
  { icon: Layers, title: 'Composable', text: 'Small parts that fit together like LEGO.' },
  { icon: Gauge, title: 'Typed', text: 'Every prop is typed and documented.' },
  { icon: Rocket, title: 'Landing-ready', text: 'Blocks for heroes, pricing, FAQ and more.' },
]

export default function CardDemo() {
  return (
    <div className="space-y-12">
      <Example title="Anatomy" layout="center" pattern>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Project Aurora</CardTitle>
            <CardDescription>Deployed 2 minutes ago from main.</CardDescription>
            <CardAction>
              <IconButton aria-label="More" size="sm">
                <Ellipsis />
              </IconButton>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Text size="sm" tone="muted">
              Cards group related content and actions. Header, content and footer follow the
              card&apos;s padding.
            </Text>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="ghost" size="sm">
              Logs
            </Button>
            <Button size="sm">Visit</Button>
          </CardFooter>
        </Card>
      </Example>

      <Example title="Variants" layout="stack" pattern>
        <Grid columns={{ base: 1, md: 3 }} gap={4}>
          {(['outline', 'elevated', 'ghost'] as const).map((variant) => (
            <Card key={variant} variant={variant}>
              <CardHeader>
                <CardTitle className="capitalize">{variant}</CardTitle>
                <CardDescription>variant=&quot;{variant}&quot;</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </Grid>
      </Example>

      <Example title="Stats" layout="stack">
        <Grid columns={{ base: 1, sm: 3 }} gap={4}>
          {[
            ['Revenue', '$48,210', '+12.4%'],
            ['Active users', '3,942', '+4.1%'],
            ['Churn', '1.8%', '-0.3%'],
          ].map(([label, value, delta]) => (
            <Card key={label} padding="sm">
              <CardContent className="grid gap-1">
                <Text size="sm" tone="muted">
                  {label}
                </Text>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tracking-tight">{value}</span>
                  <Badge size="sm" tone="success">
                    <TrendingUp />
                    {delta}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Example>

      <Example
        title="Interactive feature cards"
        description="interactive lifts on hover — pairs with asChild links."
        layout="stack"
      >
        <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
          {features.map(({ icon: Icon, title, text }) => (
            <Card key={title} interactive asChild>
              <a href="#/card" className="group">
                <CardHeader>
                  <div className="mb-3 flex size-9 items-center justify-center rounded-lg border bg-muted/60">
                    <Icon className="size-4" />
                  </div>
                  <CardTitle className="flex items-center gap-1">
                    {title}
                    <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
                  </CardTitle>
                  <CardDescription>{text}</CardDescription>
                </CardHeader>
              </a>
            </Card>
          ))}
        </Grid>
      </Example>

      <Example title="Padding" layout="stack">
        <Grid columns={{ base: 1, md: 3 }} gap={4}>
          {(['sm', 'md', 'lg'] as const).map((padding) => (
            <Card key={padding} padding={padding}>
              <CardHeader>
                <CardTitle>padding=&quot;{padding}&quot;</CardTitle>
              </CardHeader>
              <CardContent>
                <Text size="sm" tone="muted">
                  Content follows the card spacing.
                </Text>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Example>
    </div>
  )
}
