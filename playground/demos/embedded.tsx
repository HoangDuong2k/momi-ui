import { CalendarDays, Ellipsis, Filter, PanelRight, Plus, Settings2 } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  Button,
  ColorPicker,
  Combobox,
  DatePicker,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  Input,
  Kanban,
  Popover,
  PopoverContent,
  PopoverTrigger,
  PortalProvider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Text,
  Tooltip,
  type KanbanValue,
} from '../../src'
import { CodeBlock, Example } from '../components/demo'

interface Task {
  id: string
  title: string
  tag: string
}

const initialBoard: KanbanValue<Task> = {
  todo: [
    { id: '1', title: 'Write release notes', tag: 'Docs' },
    { id: '2', title: 'Review the onboarding flow', tag: 'Design' },
  ],
  doing: [{ id: '3', title: 'Fix the export dialog', tag: 'Bug' }],
  done: [{ id: '4', title: 'Ship the color picker', tag: 'Feature' }],
}

/** A small app living in a 640×400 frame — the frame is the only space its overlays may use. */
function EmbeddedApp({ frame }: { frame: HTMLElement }) {
  const [board, setBoard] = useState(initialBoard)
  const [selected, setSelected] = useState<Task | null>(null)

  return (
    <PortalProvider container={frame} collisionBoundary={frame} collisionPadding={6}>
      <div className="flex h-full flex-col">
        <header className="flex h-10 shrink-0 items-center gap-1.5 border-b px-2.5">
          <span className="me-auto text-sm font-semibold tracking-tight">Tasks</span>
          <Tooltip content="Filter tasks">
            <IconButton size="sm" aria-label="Filter tasks">
              <Filter />
            </IconButton>
          </Tooltip>
          <Popover>
            <PopoverTrigger asChild>
              <IconButton size="sm" aria-label="Due date">
                <CalendarDays />
              </IconButton>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-2">
              <Text size="sm" weight="medium">
                Due before
              </Text>
              <DatePicker aria-label="Due before" size="sm" />
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton size="sm" aria-label="More">
                <Ellipsis />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Sort by due date</DropdownMenuItem>
              <DropdownMenuItem>Group by tag</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="danger">Clear done</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog>
            <DialogTrigger asChild>
              <IconButton size="sm" aria-label="Settings">
                <Settings2 />
              </IconButton>
            </DialogTrigger>
            <DialogContent size="sm">
              <DialogHeader>
                <DialogTitle>Board settings</DialogTitle>
                <DialogDescription>Centered in the frame, sized to it.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <Select defaultValue="week">
                  <SelectTrigger aria-label="Range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                  </SelectContent>
                </Select>
                <Combobox
                  aria-label="Tags"
                  multiple
                  options={['Docs', 'Design', 'Bug', 'Feature'].map((t) => ({
                    value: t,
                    label: t,
                  }))}
                />
                <div className="flex items-center justify-between">
                  <Text size="sm">Accent</Text>
                  <ColorPicker aria-label="Accent" variant="swatch" defaultValue="#2fb5a8" />
                </div>
                <Switch label="Show done column" defaultChecked />
              </div>
              <DialogFooter>
                <Button>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="min-h-0 flex-1 p-2.5">
          <Kanban
            aria-label="Tasks"
            columns={[
              { id: 'todo', title: 'To do', tone: 'info' },
              { id: 'doing', title: 'Doing', tone: 'warning' },
              { id: 'done', title: 'Done', tone: 'success' },
            ]}
            value={board}
            onValueChange={setBoard}
            columnWidth="fill"
            minColumnWidth={170}
            getItemLabel={(task) => task.title}
            onCardClick={setSelected}
            className="h-full"
            renderCard={(task) => (
              <div className="grid gap-1.5">
                <span className="leading-snug font-medium">{task.title}</span>
                <Badge size="xs" shape="rounded" className="w-fit">
                  {task.tag}
                </Badge>
              </div>
            )}
          />
        </div>
      </div>

      {/* Non-modal side sheet below the frame's top bar: the board stays usable next to it. */}
      <Drawer
        modal={false}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DrawerContent size="sm" closeOnInteractOutside={false} style={{ top: 41 }}>
          <DrawerHeader>
            <DrawerTitle>{selected?.title}</DrawerTitle>
            <DrawerDescription>Click another card — the sheet follows it.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="grid content-start gap-3">
            <Input aria-label="Title" key={selected?.id} defaultValue={selected?.title} />
            <DatePicker aria-label="Due date" />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </PortalProvider>
  )
}

export default function EmbeddedDemo() {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null)
  return (
    <div className="space-y-12">
      <Example
        title="An app inside a 640×400 frame"
        description="The frame is a containing block for fixed elements (contain: layout — a transform or filter does the same). Menus, popovers, tooltips, selects and the dialog open inside it and flip to stay inside it; the dialog and its overlay are sized to the frame; dragged cards follow the pointer; the side sheet sits under the frame's top bar."
        layout="full"
        className="overflow-x-auto bg-dots p-6 sm:p-10"
      >
        <div
          ref={setFrame}
          data-testid="embedded-frame"
          className="relative mx-auto h-[400px] w-[640px] overflow-hidden rounded-xl border bg-background shadow-xl [contain:layout]"
        >
          {frame && <EmbeddedApp frame={frame} />}
        </div>
      </Example>

      <Example title="Usage" layout="stack">
        <Text size="sm">
          Wrap the embedded UI once. Every overlay below — including Kanban and SortableList drag
          previews — mounts in <code>container</code> and stays inside{' '}
          <code>collisionBoundary</code>; dialog and drawer sizes follow the container instead of
          the window. Component props (<code>container</code>, <code>collisionBoundary</code>,{' '}
          <code>collisionPadding</code>) still win.
        </Text>
        <CodeBlock
          code={`import { PortalProvider } from 'momi-ui'

<PortalProvider container={frameEl} collisionBoundary={frameEl} collisionPadding={6}>
  <EmbeddedApp />
</PortalProvider>`}
        />
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <PanelRight className="size-3.5" /> Drawer modal=false + closeOnInteractOutside=false
          </span>
          <span className="inline-flex items-center gap-1">
            <Plus className="size-3.5" /> Kanban columnWidth="fill"
          </span>
        </div>
      </Example>
    </div>
  )
}
