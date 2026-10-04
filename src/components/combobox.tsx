import { Popover as PopoverPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../lib/cn'
import { CheckIcon, ChevronsUpDownIcon, XIcon } from '../lib/icons'
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
import { inputVariants, type InputSize } from './input'
import { popAnimationClass, surfaceClass } from './internal/overlay-styles'

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

interface ComboboxBaseProps {
  options: ComboboxOption[]
  /** @default 'Select…' */
  placeholder?: string
  /** @default 'Search…' */
  searchPlaceholder?: string
  /** @default 'No results found.' */
  emptyText?: React.ReactNode
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
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

/** Searchable select (single or multiple), built from Popover + Command. */
export function Combobox(props: ComboboxProps) {
  const {
    options,
    placeholder = 'Select…',
    searchPlaceholder = 'Search…',
    emptyText,
    size = 'md',
    className,
    contentClassName,
    id,
    disabled,
    required,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
  } = useFormControlProps(props)
  const [open, setOpen] = React.useState(false)

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

  const selected = props.multiple ? many : single ? [single] : []
  const byValue = new Map(options.map((o) => [o.value, o]))
  const selectedOptions = selected.map((v) => byValue.get(v)).filter(Boolean) as ComboboxOption[]

  const toggle = (value: string) => {
    if (props.multiple) {
      setMany(many.includes(value) ? many.filter((v) => v !== value) : [...many, value])
    } else {
      setSingle(value === single ? null : value)
      setOpen(false)
    }
  }

  const groups = new Map<string | undefined, ComboboxOption[]>()
  for (const option of options) {
    const list = groups.get(option.group) ?? []
    list.push(option)
    groups.set(option.group, list)
  }

  const maxBadges = props.multiple ? (props.maxBadges ?? 2) : 0
  let display: React.ReactNode = (
    <span className="truncate text-muted-foreground/70">{placeholder}</span>
  )
  if (selectedOptions.length > 0) {
    if (props.multiple) {
      display = (
        <span className="flex min-w-0 flex-wrap items-center gap-1">
          {selectedOptions.slice(0, maxBadges).map((o) => (
            <Badge key={o.value} size="sm" shape="rounded" className="max-w-32">
              <span className="truncate">{o.label}</span>
            </Badge>
          ))}
          {selectedOptions.length > maxBadges && (
            <Badge size="sm" shape="rounded" variant="outline">
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
            size === 'sm' ? 'min-h-8 py-1' : size === 'lg' ? 'min-h-11 py-2' : 'min-h-9 py-1.5',
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
                aria-label="Clear selection"
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
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            surfaceClass,
            popAnimationClass,
            'w-(--radix-popover-trigger-width) min-w-56 origin-(--radix-popover-content-transform-origin) overflow-hidden p-0',
            contentClassName,
          )}
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
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
                      className="pe-8"
                    >
                      {option.icon}
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">{option.label}</span>
                        {option.description && (
                          <span className="truncate text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        )}
                      </span>
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
            </CommandList>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
