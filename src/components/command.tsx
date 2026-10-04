import * as React from 'react'
import { cn } from '../lib/cn'
import { useControllableState } from '../lib/use-controllable-state'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './dialog'
import {
  menuItemClass,
  menuLabelClass,
  menuSeparatorClass,
  menuShortcutClass,
} from './internal/overlay-styles'

/* -------------------------------------------------------------------------------------------------
 * Filtering
 * -----------------------------------------------------------------------------------------------*/

export type CommandFilter = (value: string, search: string, keywords: string[]) => number

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')

/** Every search word must appear in the value or keywords. Prefix matches rank higher. */
export const defaultCommandFilter: CommandFilter = (value, search, keywords) => {
  const query = normalize(search.trim())
  if (!query) return 1
  const haystack = normalize([value, ...keywords].join(' '))
  const words = query.split(/\s+/)
  if (!words.every((w) => haystack.includes(w))) return 0
  return normalize(value).startsWith(query) ? 2 : 1
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface ItemRecord {
  id: string
  value: string
  keywords: string[]
  groupId?: string
  disabled: boolean
}

interface CommandContextValue {
  listId: string
  search: string
  setSearch: (search: string) => void
  activeId: string | null
  setActiveId: (id: string | null) => void
  isVisible: (id: string) => boolean
  visibleCount: number
  visibleGroups: Set<string>
  register: (record: ItemRecord) => void
  unregister: (id: string) => void
  setHandler: (id: string, handler: () => void) => void
  select: (id: string) => void
}

const CommandContext = React.createContext<CommandContextValue | null>(null)
const GroupContext = React.createContext<string | undefined>(undefined)

function useCommand() {
  const context = React.useContext(CommandContext)
  if (!context) throw new Error('Command components must be used inside <Command>.')
  return context
}

/* -------------------------------------------------------------------------------------------------
 * Command
 * -----------------------------------------------------------------------------------------------*/

export interface CommandProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  search?: string
  defaultSearch?: string
  onSearchChange?: (search: string) => void
  /** Custom ranking; return 0 to hide an item. */
  filter?: CommandFilter
  /** Set to false when items are filtered elsewhere (e.g. server search). @default true */
  shouldFilter?: boolean
  /** Wrap keyboard navigation at the ends. @default true */
  loop?: boolean
  /** Accessible name for the list. */
  label?: string
}

/** Searchable list of actions with full keyboard support. Base for CommandDialog and Combobox. */
export function Command({
  search: searchProp,
  defaultSearch = '',
  onSearchChange,
  filter = defaultCommandFilter,
  shouldFilter = true,
  loop = true,
  label,
  className,
  onKeyDown,
  children,
  ...props
}: CommandProps) {
  const listId = React.useId()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [search, setSearchState] = useControllableState({
    value: searchProp,
    defaultValue: defaultSearch,
    onChange: onSearchChange,
  })
  const [items, setItems] = React.useState<Map<string, ItemRecord>>(() => new Map())
  const [activeIdState, setActiveId] = React.useState<string | null>(null)
  const handlers = React.useRef(new Map<string, () => void>())

  const register = React.useCallback((record: ItemRecord) => {
    setItems((prev) => {
      const current = prev.get(record.id)
      if (
        current &&
        current.value === record.value &&
        current.disabled === record.disabled &&
        current.groupId === record.groupId &&
        current.keywords.join('\u0000') === record.keywords.join('\u0000')
      ) {
        return prev
      }
      return new Map(prev).set(record.id, record)
    })
  }, [])

  const unregister = React.useCallback((id: string) => {
    handlers.current.delete(id)
    setItems((prev) => {
      if (!prev.has(id)) return prev
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  const visible = React.useMemo(() => {
    const ids = new Set<string>()
    const groups = new Set<string>()
    for (const item of items.values()) {
      if (!shouldFilter || filter(item.value, search, item.keywords) > 0) {
        ids.add(item.id)
        if (item.groupId) groups.add(item.groupId)
      }
    }
    return { ids, groups }
  }, [items, search, filter, shouldFilter])

  // Fall back to the first visible, enabled item when the active one is filtered out.
  const firstEnabled = React.useMemo(() => {
    for (const item of items.values()) {
      if (visible.ids.has(item.id) && !item.disabled) return item.id
    }
    return null
  }, [items, visible])
  const activeId =
    activeIdState && visible.ids.has(activeIdState) && !items.get(activeIdState)?.disabled
      ? activeIdState
      : firstEnabled

  const setSearch = (next: string) => {
    setSearchState(next)
    setActiveId(null)
  }

  const select = (id: string) => {
    if (items.get(id)?.disabled) return
    handlers.current.get(id)?.()
  }

  const move = (direction: 1 | -1 | 'first' | 'last') => {
    const options = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>(
        '[data-slot="command-item"]:not([data-disabled])',
      ) ?? [],
    )
    if (options.length === 0) return
    const index = options.findIndex((el) => el.id === activeId)
    let next: number
    if (direction === 'first') next = 0
    else if (direction === 'last') next = options.length - 1
    else {
      next = index + direction
      if (next < 0) next = loop ? options.length - 1 : 0
      if (next >= options.length) next = loop ? 0 : options.length - 1
    }
    const target = options[next]
    setActiveId(target.id)
    target.scrollIntoView({ block: 'nearest' })
  }

  const context: CommandContextValue = {
    listId,
    search,
    setSearch,
    activeId,
    setActiveId,
    isVisible: (id) => visible.ids.has(id),
    visibleCount: visible.ids.size,
    visibleGroups: visible.groups,
    register,
    unregister,
    setHandler: (id, handler) => handlers.current.set(id, handler),
    select,
  }

  return (
    <CommandContext value={context}>
      <div
        ref={rootRef}
        data-slot="command"
        aria-label={label}
        className={cn(
          'flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground',
          className,
        )}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.defaultPrevented || e.nativeEvent.isComposing) return
          if (e.key === 'ArrowDown') move(1)
          else if (e.key === 'ArrowUp') move(-1)
          else if (e.key === 'Home' && e.ctrlKey) move('first')
          else if (e.key === 'End' && e.ctrlKey) move('last')
          else if (e.key === 'Enter' && activeId) select(activeId)
          else return
          e.preventDefault()
        }}
        {...props}
      >
        {children}
      </div>
    </CommandContext>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Parts
 * -----------------------------------------------------------------------------------------------*/

function SearchIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function CommandInput({
  className,
  wrapperClassName,
  ...props
}: Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> & { wrapperClassName?: string }) {
  const { search, setSearch, listId, activeId } = useCommand()
  return (
    <div
      data-slot="command-input-wrapper"
      className={cn('flex h-12 items-center gap-2 border-b px-3', wrapperClassName)}
    >
      <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
      <input
        data-slot="command-input"
        role="combobox"
        aria-expanded
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId ?? undefined}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={cn(
          'flex h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  )
}

export function CommandList({ className, ...props }: React.ComponentProps<'div'>) {
  const { listId } = useCommand()
  return (
    <div
      id={listId}
      role="listbox"
      data-slot="command-list"
      className={cn('max-h-80 scroll-py-1 overflow-x-hidden overflow-y-auto p-1', className)}
      {...props}
    />
  )
}

export function CommandEmpty({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { visibleCount } = useCommand()
  if (visibleCount > 0) return null
  return (
    <div
      role="presentation"
      data-slot="command-empty"
      className={cn('py-8 text-center text-sm text-muted-foreground', className)}
      {...props}
    >
      {children ?? 'No results found.'}
    </div>
  )
}

export interface CommandGroupProps extends Omit<React.ComponentProps<'div'>, 'heading'> {
  heading?: React.ReactNode
}

export function CommandGroup({ heading, className, children, ...props }: CommandGroupProps) {
  const id = React.useId()
  const { visibleGroups } = useCommand()
  const headingId = `${id}-heading`
  return (
    <GroupContext value={id}>
      <div
        role="group"
        data-slot="command-group"
        aria-labelledby={heading ? headingId : undefined}
        hidden={!visibleGroups.has(id)}
        className={cn('overflow-hidden', className)}
        {...props}
      >
        {heading && (
          <div id={headingId} className={cn(menuLabelClass, 'pt-2')}>
            {heading}
          </div>
        )}
        {children}
      </div>
    </GroupContext>
  )
}

export interface CommandItemProps extends Omit<React.ComponentProps<'div'>, 'onSelect'> {
  /** Text used for filtering. Defaults to the text content when it's a string. */
  value?: string
  /** Extra search terms. */
  keywords?: string[]
  disabled?: boolean
  onSelect?: () => void
}

export function CommandItem({
  value,
  keywords,
  disabled = false,
  onSelect,
  className,
  children,
  ...props
}: CommandItemProps) {
  const id = React.useId()
  const groupId = React.useContext(GroupContext)
  const { register, unregister, setHandler, isVisible, activeId, setActiveId, select } =
    useCommand()
  const text = value ?? (typeof children === 'string' ? children : '')
  const keywordKey = (keywords ?? []).join('\u0000')

  React.useLayoutEffect(() => {
    register({
      id,
      value: text,
      keywords: keywordKey ? keywordKey.split('\u0000') : [],
      groupId,
      disabled,
    })
  }, [id, text, keywordKey, groupId, disabled, register])

  React.useLayoutEffect(() => () => unregister(id), [id, unregister])

  React.useEffect(() => {
    setHandler(id, () => onSelect?.())
  })

  if (!isVisible(id)) return null
  const active = activeId === id

  return (
    <div
      id={id}
      role="option"
      data-slot="command-item"
      aria-selected={active}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      data-highlighted={active || undefined}
      onPointerMove={() => {
        if (!disabled && !active) setActiveId(id)
      }}
      onClick={() => select(id)}
      className={cn(menuItemClass, 'min-h-9 cursor-pointer', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CommandSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  const { search } = useCommand()
  if (search) return null
  return (
    <div
      role="separator"
      data-slot="command-separator"
      className={cn(menuSeparatorClass, className)}
      {...props}
    />
  )
}

export function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span data-slot="command-shortcut" className={cn(menuShortcutClass, className)} {...props} />
  )
}

/* -------------------------------------------------------------------------------------------------
 * CommandDialog
 * -----------------------------------------------------------------------------------------------*/

export interface CommandDialogProps extends React.ComponentProps<typeof Dialog> {
  /** Accessible title (visually hidden). @default 'Command palette' */
  title?: string
  description?: string
  commandProps?: CommandProps
  className?: string
}

/** Command palette in a modal — open it with a shortcut such as ⌘K. */
export function CommandDialog({
  title = 'Command palette',
  description = 'Search for a command to run.',
  commandProps,
  className,
  children,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent
        showClose={false}
        className={cn('top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg', className)}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <Command label={title} {...commandProps}>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

/** Run `callback` on ⌘/Ctrl + `key` (default K). */
export function useCommandShortcut(callback: () => void, key = 'k') {
  const latest = React.useRef(callback)
  React.useEffect(() => {
    latest.current = callback
  })
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === key.toLowerCase() && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        latest.current()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key])
}
