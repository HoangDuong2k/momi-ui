import {
  ArrowRight,
  Download,
  Ellipsis,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Plus,
  Sparkles,
  UserPlus,
} from 'lucide-react'
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
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Pagination,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
  Tooltip,
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
        <WorkspaceCard />
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
          momi-ui 0.2 · Phase 2
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
          Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search — coming in Phase 4
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

const invoices = [
  { id: 'INV-024', customer: 'Linh Tran', status: 'Paid', tone: 'success', amount: '$250.00' },
  { id: 'INV-023', customer: 'Minh Nguyen', status: 'Pending', tone: 'warning', amount: '$150.00' },
  { id: 'INV-022', customer: 'Bao Le', status: 'Failed', tone: 'danger', amount: '$450.00' },
] as const

const activity = [
  ['Linh Tran', 'paid invoice INV-024', '2m ago'],
  ['Minh Nguyen', 'was sent a reminder', '1h ago'],
  ['Bao Le', 'card was declined', '3h ago'],
] as const

function WorkspaceCard() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink href="#/overview">Workspace</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#/overview">Aurora</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Billing</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <CardTitle className="text-lg">Billing</CardTitle>
        <CardAction className="flex gap-2">
          <Tooltip content="Export CSV">
            <IconButton aria-label="Export CSV" variant="outline" size="sm">
              <Download />
            </IconButton>
          </Tooltip>
          <NewInvoiceDialog />
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Alert
          tone="warning"
          title="Usage at 85%"
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success('Plan upgraded to Pro')}
            >
              Upgrade
            </Button>
          }
        >
          You&apos;re close to this month&apos;s limit.
        </Alert>
        <Progress value={85} tone="warning" label="Monthly usage" showValue size="sm" />
        <Tabs defaultValue="invoices">
          <TabsList variant="underline">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="invoices">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead align="end">Amount</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.id}</TableCell>
                    <TableCell>{inv.customer}</TableCell>
                    <TableCell>
                      <Badge size="sm" tone={inv.tone} dot>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell align="end" className="tabular-nums">
                      {inv.amount}
                    </TableCell>
                    <TableCell align="end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <IconButton aria-label={`Actions for ${inv.id}`} size="sm">
                            <Ellipsis />
                          </IconButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => toast(`Reminder sent for ${inv.id}`)}>
                            Send reminder
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="danger">Void</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="activity" className="grid gap-4 pt-2">
            {activity.map(([who, what, when]) => (
              <div key={who} className="flex items-center gap-3">
                <Avatar name={who} size="sm" />
                <Text size="sm" className="flex-1">
                  <span className="font-medium">{who}</span>{' '}
                  <span className="text-muted-foreground">{what}</span>
                </Text>
                <Text size="xs" tone="muted">
                  {when}
                </Text>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex-col gap-3 border-t sm:flex-row sm:justify-between">
        <Text size="sm" tone="muted">
          Showing 3 of 24 invoices
        </Text>
        <Pagination pageCount={8} size="sm" compact />
      </CardFooter>
    </Card>
  )
}

function NewInvoiceDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" leftIcon={<Plus />}>
          New invoice
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>New invoice</DialogTitle>
          <DialogDescription>Bill a customer for a one-off charge.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <FormField label="Customer">
            <Select defaultValue="linh">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linh">Linh Tran</SelectItem>
                <SelectItem value="minh">Minh Nguyen</SelectItem>
                <SelectItem value="bao">Bao Le</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Amount">
            <Input
              type="number"
              placeholder="0.00"
              leftSection={<span className="text-sm">$</span>}
            />
          </FormField>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={() => toast.success('Invoice created', { description: 'INV-025 · $0.00' })}
            >
              Create
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    items: 'Dialog, Drawer, Popover, Tooltip, menus, Select, Tabs, Accordion, Toast, Table…',
    status: 'done',
  },
  {
    phase: 'Phase 3',
    title: 'Landing blocks',
    items: 'Navbar, Hero, Features, Pricing, Testimonials, FAQ, CTA, Footer…',
    status: 'next',
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
