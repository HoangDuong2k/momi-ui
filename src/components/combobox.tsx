import { Popover as PopoverPrimitive } from 'radix-ui'
import * as React from 'react'
import { useMessages } from '../i18n/locale-provider'
import type { MomiMessages } from '../i18n/messages'
import { cn } from '../lib/cn'
import { CheckIcon, ChevronsUpDownIcon, PlusIcon, XIcon } from '../lib/icons'
import { useControllableState } from '../lib/use-controllable-state'
import { Badge } from './badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command'
import { useFormControlProps } from './form-field'
import { useDefaultSize } from './density-provider'
import { controlSizeDefaults, inputVariants, type InputSize } from './input'
import { popAnimationClass, surfaceClass } from './internal/overlay-styles'
import { useOverlayPlacement, type OverlayPlacementProps } from './portal-provider'

export interface ComboboxOption {
  value: string
  label: string
  description?: React.ReactNode
  icon?: React.ReactNode
  keywords?: string[]
  disabled?: boolean
  /** Options with the same group are listed under one heading. */
  group?: string
}

export interface ComboboxOptionState {
  selected: boolean
}

interface ComboboxBaseProps extends OverlayPlacementProps {
  options: ComboboxOption[]
  /**
   * Let people add an option that isn't in the list: when the search text matches no option
   * exactly, a "Create “…”" item appears at the end. Return (or resolve) the new option to select
   * it; return nothing to handle the value yourself. Called once per creation.
   */
  onCreate?: (query: string) => ComboboxOption | void | Promise<ComboboxOption | void>
  /**
   * Content of a list row (the check mark for selected rows stays). The row has
   * `data-highlighted` while active — style it with `group-data-[highlighted]/option:`.
   */
  renderOption?: (option: ComboboxOption, state: ComboboxOptionState) => React.ReactNode
  /** @default messages.combobox.placeholder ('Select…') */
  placeholder?: string
  /** @default messages.combobox.searchPlaceholder ('Search…') */
  searchPlaceholder?: string
  /** @default messages.combobox.empty ('No results found.') */
  emptyText?: React.ReactNode
  /** Override built-in text for this instance. */
  labels?: Partial<MomiMessages['combobox']>
  /** @default 'md' */
  size?: InputSize
  disabled?: boolean
  id?: string
  className?: string
  /** Width of the dropdown; defaults to the trigger width. */
  contentClassName?: string
  'aria-label'?: string
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
  'aria-describedby'?: string
  required?: boolean
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  multiple: true
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Max badges shown in the trigger before "+N". @default 2 */
  maxBadges?: number
  /**
   * A selected value in the trigger (default: a Badge). Chips sit inside the trigger button, so
   * make a remove control a `<span role="button">` that calls `remove()` from `onPointerDown`
   * (after `preventDefault()` + `stopPropagation()`), like the built-in clear button.
   */
  renderChip?: (option: ComboboxOption, remove: () => void) => React.ReactNode
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

/** Same normalization as Command's default filter: case- and diacritics-insensitive. */
const normalize = (s: string) =>
  s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as PromiseLike<unknown> | null)?.then === 'function'

/** Searchable select (single or multiple), built from Popover + Command. */
export function Combobox(props: ComboboxProps) {
  const {
    options,
    labels,
    placeholder,
    searchPlaceholder,
    emptyText,
    size: sizeProp,
    className,
    contentClassName,
    id,
    disabled,
    required,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
    container,
    collisionBoundary,
    collisionPadding,
    onCreate,
    renderOption,
  } = useFormControlProps(props)
  const placement = useOverlayPlacement({ container, collisionBoundary, collisionPadding })
  const t = useMessages('combobox', labels)
  const size = useDefaultSize<InputSize>(sizeProp, controlSizeDefaults)
  const [open, setOpenState] = React.useState(false)
  const [query, setQueryState] = React.useState('')
  // Options created here but not (yet) passed back in `options` — still shown and selectable.
  const [created, setCreated] = React.useState<ComboboxOption[]>([])
  const creatingRef = React.useRef(false)

  const setQuery = (next: string) => setQueryState(next)
  const setOpen = (next: boolean) => {
    setOpenState(next)
    if (!next) setQuery('')
  }

  const [single, setSingle] = useControllableState<string | null>({
    value: props.multiple ? undefined : props.value,
    defaultValue: props.multiple ? null : (props.defaultValue ?? null),
    onChange: props.multiple ? undefined : props.onValueChange,
  })
  const [many, setMany] = useControllableState<string[]>({
    value: props.multiple ? props.value : undefined,
    defaultValue: props.multiple ? (props.defaultValue ?? []) : [],
    onChange: props.multiple ? props.onValueChange : undefined,
  })

  // Latest selection, for an async `onCreate` that resolves after the user picked other values.
  const manyRef = React.useRef(many)
  React.useEffect(() => {
    manyRef.current = many
  })

  const allOptions = React.useMemo(() => {
    if (created.length === 0) return options
    const known = new Set(options.map((o) => o.value))
    return [...options, ...created.filter((o) => !known.has(o.value))]
  }, [options, created])

  const selected = props.multiple ? many : single ? [single] : []
  const byValue = new Map(allOptions.map((o) => [o.value, o]))
  const selectedOptions = selected.map((v) => byValue.get(v)).filter(Boolean) as ComboboxOption[]

  const toggle = (value: string) => {
    if (props.multiple) {
      setMany(many.includes(value) ? many.filter((v) => v !== value) : [...many, value])
      // Start the next search afresh instead of appending to the text that found this one.
      setQuery('')
    } else {
      setSingle(value === single ? null : value)
      setOpen(false)
    }
  }

  /* Creating ------------------------------------------------------------------------------- */
  const trimmed = query.trim()
  const normalizedQuery = normalize(query)
  const exactMatch = normalizedQuery
    ? allOptions.find(
        (o) => normalize(o.label) === normalizedQuery || normalize(o.value) === normalizedQuery,
      )
    : undefined
  const canCreate = Boolean(onCreate) && trimmed !== '' && !exactMatch

  const selectCreated = (option: ComboboxOption) => {
    setCreated((prev) => (prev.some((o) => o.value === option.value) ? prev : [...prev, option]))
    if (props.multiple) {
      const current = manyRef.current
      if (!current.includes(option.value)) setMany([...current, option.value])
    } else {
      setSingle(option.value)
      setOpen(false)
    }
  }

  const create = () => {
    if (!onCreate || creatingRef.current || !canCreate) return
    const finish = (option: ComboboxOption | void) => {
      creatingRef.current = false
      setQuery('')
      if (option) selectCreated(option)
    }
    creatingRef.current = true
    let result: ReturnType<NonNullable<typeof onCreate>>
    try {
      result = onCreate(trimmed)
    } catch (error) {
      creatingRef.current = false
      throw error
    }
    if (isThenable(result)) {
      Promise.resolve(result).then(finish, () => {
        creatingRef.current = false
      })
    } else {
      finish(result)
    }
  }

  const onCommandKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.nativeEvent.isComposing) return
    // Backspace in an empty search removes the last value — but not from key auto-repeat, which
    // would otherwise keep deleting values after clearing the text.
    if (
      event.key === 'Backspace' &&
      !event.repeat &&
      props.multiple &&
      query === '' &&
      many.length > 0
    ) {
      event.preventDefault()
      setMany(many.slice(0, -1))
    }
  }

  const groups = new Map<string | undefined, ComboboxOption[]>()
  for (const option of allOptions) {
    const list = groups.get(option.group) ?? []
    list.push(option)
    groups.set(option.group, list)
  }

  const maxBadges = props.multiple ? (props.maxBadges ?? 2) : 0
  let display: React.ReactNode = (
    <span className="truncate text-muted-foreground/70">{placeholder ?? t.placeholder}</span>
  )
  if (selectedOptions.length > 0) {
    if (props.multiple) {
      display = (
        <span className="flex min-w-0 flex-wrap items-center gap-1">
          {selectedOptions.slice(0, maxBadges).map((o) =>
            props.renderChip ? (
              <React.Fragment key={o.value}>
                {props.renderChip(o, () => setMany(many.filter((v) => v !== o.value)))}
              </React.Fragment>
            ) : (
              <Badge
                key={o.value}
                size={size === 'xs' ? 'xs' : 'sm'}
                shape="rounded"
                className="max-w-32"
              >
                <span className="truncate">{o.label}</span>
              </Badge>
            ),
          )}
          {selectedOptions.length > maxBadges && (
            <Badge size={size === 'xs' ? 'xs' : 'sm'} shape="rounded" variant="outline">
              +{selectedOptions.length - maxBadges}
            </Badge>
          )}
        </span>
      )
    } else {
      const option = selectedOptions[0]
      display = (
        <span className="flex min-w-0 items-center gap-2">
          {option.icon && <span className="shrink-0 [&_svg]:size-4">{option.icon}</span>}
          <span className="truncate">{option.label}</span>
        </span>
      )
    }
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={props['aria-label']}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          aria-required={required || undefined}
          data-slot="combobox-trigger"
          className={cn(
            inputVariants({ size }),
            'h-auto items-center justify-between gap-2 text-start',
            size === 'xs'
              ? 'min-h-6 py-0.5 [&_svg]:size-3.5'
              : size === 'sm'
                ? 'min-h-8 py-1'
                : size === 'lg'
                  ? 'min-h-11 py-2'
                  : 'min-h-9 py-1.5',
            'cursor-pointer',
            className,
          )}
        >
          {display}
          <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
            {props.multiple && selectedOptions.length > 0 && (
              <span
                role="button"
                tabIndex={-1}
                aria-label={t.clear}
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setMany([])
                }}
                className="rounded-sm p-0.5 hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </span>
            )}
            <ChevronsUpDownIcon className="size-4" />
          </span>
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={placement.container}>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          {...placement.collision}
          className={cn(
            surfaceClass,
            popAnimationClass,
            'w-(--radix-popover-trigger-width) min-w-56 origin-(--radix-popover-content-transform-origin) overflow-hidden p-0',
            // Never taller than the space Radix found (window or PortalProvider boundary): the list scrolls.
            'flex max-h-(--radix-popover-content-available-height) flex-col',
            contentClassName,
          )}
        >
          <Command
            className="min-h-0"
            search={query}
            onSearchChange={setQuery}
            onKeyDown={onCommandKeyDown}
          >
            <CommandInput placeholder={searchPlaceholder ?? t.searchPlaceholder} />
            <CommandList className="min-h-0">
              <CommandEmpty>{emptyText ?? t.empty}</CommandEmpty>
              {[...groups.entries()].map(([group, list]) => {
                const items = list.map((option) => {
                  const isSelected = selected.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      keywords={[option.value, ...(option.keywords ?? [])]}
                      disabled={option.disabled}
                      onSelect={() => toggle(option.value)}
                      aria-checked={isSelected}
                      className="group/option pe-8"
                    >
                      {renderOption ? (
                        renderOption(option, { selected: isSelected })
                      ) : (
                        <>
                          {option.icon}
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate">{option.label}</span>
                            {option.description && (
                              <span className="truncate text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            )}
                          </span>
                        </>
                      )}
                      {isSelected && (
                        <CheckIcon className="absolute end-2 size-3.5 text-foreground!" />
                      )}
                    </CommandItem>
                  )
                })
                return group ? (
                  <CommandGroup key={group} heading={group}>
                    {items}
                  </CommandGroup>
                ) : (
                  <React.Fragment key="__ungrouped">{items}</React.Fragment>
                )
              })}
              {canCreate && (
                <CommandItem
                  // Its label contains the search, so it always passes the filter — but only as a
                  // plain match, so any listed option that also matches is highlighted first.
                  value={t.create(trimmed)}
                  onSelect={create}
                  data-combobox-create=""
                  className="text-muted-foreground"
                >
                  <PlusIcon />
                  <span className="truncate">{t.create(trimmed)}</span>
                </CommandItem>
              )}
            </CommandList>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
