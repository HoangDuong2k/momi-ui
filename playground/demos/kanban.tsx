import {
  ArrowDownWideNarrow,
  CalendarDays,
  CalendarClock,
  Ellipsis,
  Lock,
  MessageSquare,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Trash2,
} from 'lucide-react'
import { useRef, useState } from 'react'
import {
  Avatar,
  Badge,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  Kanban,
  Text,
  toast,
  type KanbanColumn,
  type KanbanMoveEvent,
  type KanbanValue,
  type Tone,
} from '../../src'
import { Example } from '../components/demo'

/* -------------------------------------------------------------------------------------------------
 * 1. Project board
 * -----------------------------------------------------------------------------------------------*/

type Priority = 'low' | 'medium' | 'high'

interface Task {
  id: string
  title: string
  tag: 'Design' | 'Frontend' | 'Backend' | 'Research' | 'Bug'
  assignee: string
  /** Days from today; negative = overdue. */
  due?: number
  priority: Priority
  comments?: number
}

const tagTone: Record<Task['tag'], Tone> = {
  Design: 'primary',
  Frontend: 'info',
  Backend: 'success',
  Research: 'neutral',
  Bug: 'danger',
}

const priorityIcon = { low: SignalLow, medium: SignalMedium, high: SignalHigh }
const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

const projectColumns: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog', tone: 'neutral' },
  { id: 'todo', title: 'To do', tone: 'info' },
  { id: 'doing', title: 'In progress', tone: 'warning', limit: 3 },
  { id: 'review', title: 'Review', tone: 'primary' },
  { id: 'done', title: 'Done', tone: 'success' },
]

const initialTasks: KanbanValue<Task> = {
  backlog: [
    {
      id: 't1',
      title: 'Explore a compact density mode',
      tag: 'Research',
      assignee: 'Mai Le',
      priority: 'low',
    },
    {
      id: 't2',
      title: 'Audit color contrast in dark mode',
      tag: 'Design',
      assignee: 'Vy Ho',
      priority: 'medium',
      comments: 2,
    },
  ],
  todo: [
    {
      id: 't3',
      title: 'Onboarding checklist empty state',
      tag: 'Design',
      assignee: 'Linh Tran',
      due: 6,
      priority: 'medium',
    },
    {
      id: 't4',
      title: 'Rate-limit the export endpoint',
      tag: 'Backend',
      assignee: 'Nam Pham',
      due: 3,
      priority: 'high',
      comments: 4,
    },
    {
      id: 't5',
      title: 'Keyboard shortcuts cheat sheet',
      tag: 'Frontend',
      assignee: 'Bao Vo',
      priority: 'low',
    },
  ],
  doing: [
    {
      id: 't6',
      title: 'Kanban drag and drop',
      tag: 'Frontend',
      assignee: 'An Nguyen',
      due: 1,
      priority: 'high',
      comments: 7,
    },
    {
      id: 't7',
      title: 'Invoice PDF renders blank on Safari',
      tag: 'Bug',
      assignee: 'Duy Dang',
      due: -1,
      priority: 'high',
      comments: 3,
    },
  ],
  review: [
    {
      id: 't8',
      title: 'Vietnamese translations for all components',
      tag: 'Frontend',
      assignee: 'Chi Bui',
      due: 2,
      priority: 'medium',
      comments: 1,
    },
  ],
  done: [
    {
      id: 't9',
      title: 'Interview five design partners',
      tag: 'Research',
      assignee: 'Thao Do',
      priority: 'medium',
      comments: 5,
    },
    {
      id: 't10',
      title: 'Migrate tokens to OKLCH',
      tag: 'Design',
      assignee: 'Linh Tran',
      priority: 'low',
    },
  ],
}

function dueText(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function TaskCard({ task }: { task: Task }) {
  const Priority = priorityIcon[task.priority]
  const overdue = task.due !== undefined && task.due < 0
  return (
    <div className="grid gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <Badge size="sm" tone={tagTone[task.tag]} shape="rounded">
          {task.tag}
        </Badge>
        <Priority
          aria-label={`${task.priority} priority`}
          className={cn(
            'size-4',
            task.priority === 'high' ? 'text-foreground' : 'text-muted-foreground/70',
          )}
        />
      </div>
      <p className="leading-snug font-medium text-pretty">{task.title}</p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <Avatar name={task.assignee} size="xs" />
        {task.due !== undefined && (
          <span
            className={cn('flex items-center gap-1', overdue && 'font-medium text-destructive')}
          >
            {overdue ? (
              <CalendarClock className="size-3.5" />
            ) : (
              <CalendarDays className="size-3.5" />
            )}
            {dueText(task.due)}
          </span>
        )}
        {task.comments !== undefined && (
          <span className="ms-auto flex items-center gap-1 tabular-nums">
            <MessageSquare className="size-3.5" />
            {task.comments}
          </span>
        )}
      </div>
    </div>
  )
}

function ProjectBoard() {
  const [board, setBoard] = useState(initialTasks)
  const nextId = useRef(11)

  const updateColumn = (columnId: string, update: (tasks: Task[]) => Task[]) =>
    setBoard((b) => ({ ...b, [columnId]: update(b[columnId] ?? []) }))

  return (
    <Kanban
      aria-label="Project board"
      columns={projectColumns}
      value={board}
      onValueChange={setBoard}
      getItemLabel={(task) => task.title}
      renderCard={(task) => <TaskCard task={task} />}
      onCardClick={(task) => toast(task.title, { description: `${task.tag} · ${task.assignee}` })}
      onAddCard={(columnId) =>
        updateColumn(columnId, (tasks) => [
          ...tasks,
          {
            id: `t${nextId.current++}`,
            title: 'Untitled task',
            tag: 'Research',
            assignee: 'Mai Le',
            priority: 'low',
          },
        ])
      }
      renderColumnActions={(column) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton aria-label={`${column.title} actions`} size="sm" className="size-7">
              <Ellipsis />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() =>
                updateColumn(column.id, (tasks) =>
                  [...tasks].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]),
                )
              }
            >
              <ArrowDownWideNarrow />
              Sort by priority
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="danger" onSelect={() => updateColumn(column.id, () => [])}>
              <Trash2 />
              Clear column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      collapsible
      defaultCollapsed={['backlog']}
      maxHeight={560}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * 2. Workflow rules with canMove + event log
 * -----------------------------------------------------------------------------------------------*/

interface Post {
  id: string
  title: string
  author: string
}

const stages: KanbanColumn[] = [
  { id: 'draft', title: 'Draft', tone: 'neutral' },
  { id: 'editing', title: 'Editing', tone: 'warning' },
  { id: 'approved', title: 'Approved', tone: 'info' },
  { id: 'published', title: 'Published', tone: 'success', icon: <Lock /> },
]

const initialPosts: KanbanValue<Post> = {
  draft: [
    { id: 'p1', title: 'Designing calm interfaces', author: 'Linh' },
    { id: 'p2', title: 'Why we moved to OKLCH', author: 'Nam' },
  ],
  editing: [{ id: 'p3', title: 'A field guide to focus rings', author: 'Vy' }],
  approved: [],
  published: [{ id: 'p4', title: 'Introducing momi-ui', author: 'An' }],
}

const stageIndex = (id: string) => stages.findIndex((s) => s.id === id)

/** One stage at a time, and published posts stay published. */
const canMovePost = ({ from, to }: KanbanMoveEvent<Post>) =>
  from.columnId !== 'published' &&
  Math.abs(stageIndex(to.columnId) - stageIndex(from.columnId)) <= 1

function WorkflowBoard() {
  const [posts, setPosts] = useState(initialPosts)
  const [log, setLog] = useState<string[]>([])

  return (
    <div className="grid gap-4">
      <Kanban
        aria-label="Editorial workflow"
        columns={stages}
        value={posts}
        onValueChange={setPosts}
        canMove={canMovePost}
        onCardMove={({ item, from, to }) =>
          setLog((l) =>
            [
              `“${item.title}” · ${stages[stageIndex(from.columnId)].title} → ${stages[stageIndex(to.columnId)].title}`,
              ...l,
            ].slice(0, 4),
          )
        }
        getItemLabel={(post) => post.title}
        columnWidth={240}
        renderCard={(post, { columnId }) => (
          <div className="grid gap-1">
            <p className="leading-snug font-medium">{post.title}</p>
            <Text size="xs" tone="muted">
              by {post.author}
              {columnId === 'published' && ' · locked'}
            </Text>
          </div>
        )}
      />
      <div className="rounded-lg border bg-muted/30 px-4 py-3">
        <Text size="xs" tone="muted" weight="medium" className="mb-1.5">
          onCardMove
        </Text>
        {log.length === 0 ? (
          <Text size="sm" tone="muted">
            Move a card — skipping a stage or leaving “Published” is refused.
          </Text>
        ) : (
          <ul className="grid gap-1 font-mono text-xs">
            {log.map((entry, i) => (
              <li key={i} className={cn(i > 0 && 'text-muted-foreground')}>
                {entry}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * 3. Read-only
 * -----------------------------------------------------------------------------------------------*/

const releaseColumns: KanbanColumn[] = [
  { id: 'now', title: 'Now', tone: 'success' },
  { id: 'next', title: 'Next', tone: 'info' },
  { id: 'later', title: 'Later', tone: 'neutral' },
]

const roadmap: KanbanValue<{ id: string; title: string }> = {
  now: [
    { id: 'r1', title: 'Kanban board' },
    { id: 'r2', title: 'Vietnamese locale pack' },
  ],
  next: [
    { id: 'r3', title: 'Color picker' },
    { id: 'r4', title: 'Resizable panels' },
    { id: 'r5', title: 'Scrubbable number field' },
  ],
  later: [{ id: 'r6', title: 'Desktop app theme' }],
}

export default function KanbanDemo() {
  return (
    <div className="space-y-12">
      <Example
        title="Project board"
        description="Drag cards between columns — or focus one and press Space, move it with the arrow keys, Space to drop, Esc to cancel. On touch, press and hold. The In progress column has a WIP limit of 3; Backlog starts collapsed."
        layout="full"
        className="p-4 sm:p-6"
      >
        <ProjectBoard />
      </Example>

      <Example
        title="Workflow rules"
        description="canMove decides where a card may go: here posts advance one stage at a time and never leave Published. onCardMove reports each move, ready to send to your API."
        layout="full"
        className="p-4 sm:p-6"
      >
        <WorkflowBoard />
      </Example>

      <Example
        title="Read-only"
        description="disabled turns off dragging — useful for public roadmaps."
        layout="full"
        className="p-4 sm:p-6"
      >
        <Kanban
          aria-label="Roadmap"
          columns={releaseColumns}
          defaultValue={roadmap}
          disabled
          columnWidth={220}
          renderCard={(item) => <span className="font-medium">{item.title}</span>}
        />
      </Example>
    </div>
  )
}
