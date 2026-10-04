import { ArrowRight, Eye, EyeOff, KeyRound, Mail, Sparkles, UserPlus } from 'lucide-react'
import { useState } from 'react'
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  FormField,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  Kbd,
  Link,
  NativeSelect,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Switch,
  Text,
} from '../../src'

export default function OverviewDemo() {
  return (
    <div className="space-y-10">
      <MiniHero />
      <Grid columns={{ base: 1, lg: 2 }} gap={6}>
        <SignUpCard />
        <div className="grid content-start gap-6">
          <TeamCard />
          <NotificationsCard />
        </div>
        <PlanCard />
      </Grid>
      <Roadmap />
    </div>
  )
}

function MiniHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-dots px-6 py-16 text-center sm:px-12 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-radial from-transparent to-background/90" />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
        <Badge variant="outline" dot tone="success">
          momi-ui 0.1 · Phase 1
        </Badge>
        <Heading as="h2" size="display">
          Build calm interfaces, faster.
        </Heading>
        <Text size="lg" tone="muted" className="max-w-xl">
          A Modern Minimal component library for React and Tailwind CSS v4 — with the building
          blocks for product UIs and landing pages.
        </Text>
        <HStack gap={3} wrap justify="center">
          <Button size="lg" rightIcon={<ArrowRight />}>
            Get started
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#/button">Browse components</a>
          </Button>
        </HStack>
        <Text size="sm" tone="muted">
          Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search — coming in Phase 2
        </Text>
      </div>
    </div>
  )
}

function SignUpCard() {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="text-lg">Create an account</CardTitle>
        <CardDescription>Start your 14-day trial. No credit card required.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" leftIcon={<Mail />}>
            Magic link
          </Button>
          <Button variant="outline" leftIcon={<KeyRound />}>
            Passkey
          </Button>
        </div>
        <Separator label="or continue with" />
        <FormField label="Work email">
          <Input type="email" placeholder="you@company.com" leftSection={<Mail />} />
        </FormField>
        <FormField label="Password" description="At least 8 characters.">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            rightSection={
              <IconButton
                size="sm"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="size-7"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </IconButton>
            }
          />
        </FormField>
        <Checkbox label="Send me product updates" defaultChecked />
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4">
        <Button fullWidth size="lg">
          Create account
        </Button>
        <Text size="sm" tone="muted" align="center">
          Already have an account? <Link href="#">Sign in</Link>
        </Text>
      </CardFooter>
    </Card>
  )
}

const members = [
  { name: 'Linh Tran', email: 'linh@momi.dev', role: 'owner', status: 'online' as const },
  { name: 'Minh Nguyen', email: 'minh@momi.dev', role: 'admin', status: 'away' as const },
  { name: 'An Pham', email: 'an@momi.dev', role: 'member', status: 'offline' as const },
]

function TeamCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team members</CardTitle>
        <CardDescription>Invite your team to collaborate.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline" leftIcon={<UserPlus />}>
            Invite
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4">
        {members.map((m) => (
          <div key={m.email} className="flex items-center gap-3">
            <Avatar name={m.name} status={m.status} size="sm" />
            <div className="min-w-0 flex-1">
              <Text size="sm" weight="medium" truncate>
                {m.name}
              </Text>
              <Text size="xs" tone="muted" truncate>
                {m.email}
              </Text>
            </div>
            <NativeSelect
              size="sm"
              defaultValue={m.role}
              aria-label={`Role for ${m.name}`}
              wrapperClassName="w-28"
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </NativeSelect>
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-between border-t">
        <AvatarGroup size="xs" max={4}>
          {['Linh Tran', 'Minh Nguyen', 'An Pham', 'Bao Le', 'Chi Vo', 'Duy Ho'].map((n) => (
            <Avatar key={n} name={n} />
          ))}
        </AvatarGroup>
        <Badge tone="primary">6 seats used</Badge>
      </CardFooter>
    </Card>
  )
}

function NotificationsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what you want to hear about.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Switch
          label="Product updates"
          description="New features and improvements."
          defaultChecked
        />
        <Separator />
        <Switch label="Weekly digest" description="A summary of activity every Monday." />
        <Separator />
        <Switch
          label="Security alerts"
          description="Always on for owners."
          defaultChecked
          disabled
        />
      </CardContent>
    </Card>
  )
}

function PlanCard() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Choose a plan</CardTitle>
        <CardDescription>Switch or cancel anytime.</CardDescription>
        <CardAction>
          <Badge variant="soft" tone="success" dot>
            Save 20% yearly
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <RadioGroup defaultValue="pro" columns={3} aria-label="Plan">
          <RadioGroupItem
            variant="card"
            value="hobby"
            label="Hobby"
            description="For side projects."
            aside="$0"
          />
          <RadioGroupItem
            variant="card"
            value="pro"
            label="Pro"
            description="For growing teams."
            aside="$19"
          />
          <RadioGroupItem
            variant="card"
            value="scale"
            label="Scale"
            description="SSO & audit logs."
            aside="$49"
          />
        </RadioGroup>
      </CardContent>
      <CardFooter className="justify-end gap-2 border-t">
        <Button variant="ghost">Cancel</Button>
        <Button leftIcon={<Sparkles />}>Upgrade</Button>
      </CardFooter>
    </Card>
  )
}

const roadmap = [
  {
    phase: 'Phase 0',
    title: 'Setup',
    items: 'Vite, Tailwind v4, tokens, theming, playground',
    status: 'done',
  },
  {
    phase: 'Phase 1',
    title: 'Foundations',
    items: 'Layout, typography, buttons, forms, card, badge, avatar',
    status: 'done',
  },
  {
    phase: 'Phase 2',
    title: 'Interactive',
    items: 'Dialog, Drawer, Popover, Tooltip, Dropdown, Tabs, Accordion, Toast, Table…',
    status: 'next',
  },
  {
    phase: 'Phase 3',
    title: 'Landing blocks',
    items: 'Navbar, Hero, Features, Pricing, Testimonials, FAQ, CTA, Footer…',
    status: 'planned',
  },
  {
    phase: 'Phase 4',
    title: 'Advanced',
    items: 'Combobox, Command, DatePicker, Slider, OTP, FileUpload, docs & publish',
    status: 'planned',
  },
] as const

function Roadmap() {
  return (
    <section className="space-y-4">
      <Heading as="h2" size="md">
        Roadmap
      </Heading>
      <div className="divide-y rounded-xl border">
        {roadmap.map((r) => (
          <div
            key={r.phase}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-6"
          >
            <span className="w-20 font-mono text-xs text-muted-foreground">{r.phase}</span>
            <div className="min-w-0 flex-1">
              <Text size="sm" weight="medium">
                {r.title}
              </Text>
              <Text size="sm" tone="muted">
                {r.items}
              </Text>
            </div>
            <Badge
              size="sm"
              tone={r.status === 'done' ? 'success' : r.status === 'next' ? 'primary' : 'neutral'}
              dot={r.status !== 'planned'}
            >
              {r.status === 'done' ? 'Done' : r.status === 'next' ? 'Next' : 'Planned'}
            </Badge>
          </div>
        ))}
      </div>
    </section>
  )
}
