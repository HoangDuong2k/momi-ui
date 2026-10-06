import { cva } from 'class-variance-authority'
import { ToggleGroup as ToggleGroupPrimitive, Toolbar as ToolbarPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../lib/cn'
import { joinIds } from '../lib/ids'
import type { Shortcut } from '../lib/shortcut'
import { useControllableState } from '../lib/use-controllable-state'
import type { ButtonSize } from './button'
import { useDefaultSize } from './density-provider'
import { useFormField } from './form-field'
import { Tooltip } from './tooltip'

export type ToggleGroupVariant = 'ghost' | 'outline' | 'segmented'

/* -------------------------------------------------------------------------------------------------
 * Shared styles (ToggleGroup items, Toolbar toggles)
 * -----------------------------------------------------------------------------------------------*/

/**
 * Look of a pressable item. Pressed state is read from `aria-pressed` / `aria-checked` (not
 * `data-state`, which a wrapping Tooltip overwrites).
 */
export const toggleVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center gap-1.5 font-medium whitespace-nowrap text-muted-foreground select-none',
    'transition-[color,background-color,border-color,box-shadow] duration-150 outline-none',
    'hover:text-foreground focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/40',
    'disabled:pointer-events-none disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        ghost: [
          'rounded-md hover:bg-accent',
          'aria-checked:bg-accent aria-checked:text-foreground aria-pressed:bg-accent aria-pressed:text-foreground',
        ],
        outline: [
          'border border-input bg-background shadow-xs dark:bg-input/30',
          'hover:bg-accent aria-checked:bg-accent aria-checked:text-foreground aria-pressed:bg-accent aria-pressed:text-foreground',
          // Joined into one segmented control.
          '-ms-px rounded-none first:ms-0 first:rounded-s-md last:rounded-e-md',
        ],
        segmented: [
          'rounded-[calc(var(--radius)-4px)]',
          'aria-checked:bg-background aria-checked:text-foreground aria-checked:shadow-sm dark:aria-checked:bg-input/50',
          'aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm dark:aria-pressed:bg-input/50',
        ],
      },
      size: {
        xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: 'h-8 px-2.5 text-sm',
        md: 'h-9 px-3 text-sm',
        lg: "h-11 px-4 text-base [&_svg:not([class*='size-'])]:size-[1.125rem]",
      },
      iconOnly: { true: 'px-0' },
    },
    compoundVariants: [
      // Segmented items sit inside a 2px-padded track, so they are 4px shorter than the size.
      { variant: 'segmented', size: 'xs', class: 'h-5' },
      { variant: 'segmented', size: 'sm', class: 'h-7' },
      { variant: 'segmented', size: 'md', class: 'h-8' },
      { variant: 'segmented', size: 'lg', class: 'h-10' },
      { iconOnly: true, size: 'xs', class: 'w-6' },
      { iconOnly: true, size: 'sm', class: 'w-8' },
      { iconOnly: true, size: 'md', class: 'w-9' },
      { iconOnly: true, size: 'lg', class: 'w-11' },
      { iconOnly: true, variant: 'segmented', size: 'xs', class: 'w-5' },
      { iconOnly: true, variant: 'segmented', size: 'sm', class: 'w-7' },
      { iconOnly: true, variant: 'segmented', size: 'md', class: 'w-8' },
      { iconOnly: true, variant: 'segmented', size: 'lg', class: 'w-10' },
    ],
    defaultVariants: { variant: 'ghost', size: 'md' },
  },
)

const groupVariants: Record<ToggleGroupVariant, string> = {
  ghost: 'gap-0.5',
  outline: 'rounded-md',
  segmented: 'gap-0.5 rounded-lg bg-muted p-0.5',
}

/**
 * Set by `Toolbar`: a ToggleGroup inside it uses Radix's toolbar parts so the arrow keys move
 * through the whole toolbar, and inherits the toolbar's size.
 */
export const ToolbarScopeContext = React.createContext<{ size: ButtonSize } | null>(null)

const ToggleGroupContext = React.createContext<{
  variant: ToggleGroupVariant
  size: ButtonSize
  toolbar: boolean
}>({ variant: 'ghost', size: 'md', toolbar: false })

/* -------------------------------------------------------------------------------------------------
 * ToggleGroup
 * -----------------------------------------------------------------------------------------------*/

interface ToggleGroupBaseProps {
  /** @default 'ghost' */
  variant?: ToggleGroupVariant
  /** @default 'md' (`xs` inside a compact `DensityProvider`; the toolbar's size inside a Toolbar) */
  size?: ButtonSize
  disabled?: boolean
  /** @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /** Arrow keys wrap around. @default true */
  loop?: boolean
  dir?: 'ltr' | 'rtl'
  className?: string
  children?: React.ReactNode
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  id?: string
}

export interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  type: 'single'
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /**
   * Let a click on the pressed item turn it off, leaving nothing selected. By default a single
   * group always keeps exactly one item on.
   */
  allowDeselect?: boolean
}

export interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  type: 'multiple'
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps

/** Buttons that toggle on and off: pick one (`type="single"`) or several (`type="multiple"`). */
export function ToggleGroup(props: ToggleGroupProps) {
  const {
    variant = 'ghost',
    size: sizeProp,
    className,
    children,
    loop = true,
    orientation = 'horizontal',
    ...rest
  } = props
  const toolbar = React.useContext(ToolbarScopeContext)
  // Inside a FormField (not a toolbar), the field's label, description, error and disabled state
  // apply to the group, as they do for RadioGroup.
  const formField = useFormField()
  const field = toolbar ? null : formField
  const densitySize = useDefaultSize(sizeProp, { comfortable: 'md', compact: 'xs' })
  const size = sizeProp ?? toolbar?.size ?? densitySize
  const isSingle = props.type === 'single'

  const [single, setSingle] = useControllableState<string>({
    value: isSingle ? props.value : undefined,
    defaultValue: isSingle ? (props.defaultValue ?? '') : '',
    onChange: isSingle ? props.onValueChange : undefined,
  })
  const [many, setMany] = useControllableState<string[]>({
    value: isSingle ? undefined : props.value,
    defaultValue: isSingle ? [] : (props.defaultValue ?? []),
    onChange: isSingle ? undefined : props.onValueChange,
  })

  const context = React.useMemo(
    () => ({ variant, size, toolbar: toolbar !== null }),
    [variant, size, toolbar],
  )
  const shared = {
    'data-slot': 'toggle-group',
    'data-variant': variant,
    'data-size': size,
    disabled: rest.disabled ?? (field?.disabled || undefined),
    dir: rest.dir,
    id: rest.id ?? field?.id,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'] ?? (rest['aria-label'] ? undefined : field?.labelId),
    'aria-describedby': joinIds(rest['aria-describedby'], field?.descriptionId, field?.errorId),
    className: cn(
      'inline-flex w-fit items-center data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
      groupVariants[variant],
      variant === 'segmented' && size === 'xs' && 'rounded-md',
      className,
    ),
  }
  const allowDeselect = isSingle && (props as ToggleGroupSingleProps).allowDeselect

  const Root = (
    toolbar ? ToolbarPrimitive.ToggleGroup : ToggleGroupPrimitive.Root
  ) as typeof ToggleGroupPrimitive.Root
  const roving = toolbar ? {} : { loop, orientation, rovingFocus: true }

  return (
    <ToggleGroupContext value={context}>
      {isSingle ? (
        <Root
          {...shared}
          {...roving}
          type="single"
          value={single}
          onValueChange={(next) => {
            if (next || allowDeselect) setSingle(next)
          }}
        >
          {children}
        </Root>
      ) : (
        <Root {...shared} {...roving} type="multiple" value={many} onValueChange={setMany}>
          {children}
        </Root>
      )}
    </ToggleGroupContext>
  )
}

export interface ToggleGroupItemProps extends React.ComponentProps<
  typeof ToggleGroupPrimitive.Item
> {
  /** Icon for an icon-only item (when there are no children). */
  icon?: React.ReactNode
  /**
   * Accessible name and tooltip of an icon-only item; a tooltip for items with text.
   */
  label?: string
  /** Shortcut shown in the tooltip, e.g. `['mod', 'L']`. */
  shortcut?: Shortcut | string[]
}

export function ToggleGroupItem({
  icon,
  label,
  shortcut,
  className,
  children,
  ...props
}: ToggleGroupItemProps) {
  const { variant, size, toolbar } = React.useContext(ToggleGroupContext)
  const iconOnly = children == null && icon != null
  const Item = (
    toolbar ? ToolbarPrimitive.ToggleItem : ToggleGroupPrimitive.Item
  ) as typeof ToggleGroupPrimitive.Item

  const item = (
    <Item
      data-slot="toggle-group-item"
      aria-label={iconOnly ? label : undefined}
      className={cn(toggleVariants({ variant, size, iconOnly }), className)}
      {...props}
    >
      {iconOnly ? icon : children}
    </Item>
  )

  return label ? (
    <Tooltip content={label} shortcut={shortcut}>
      {item}
    </Tooltip>
  ) : (
    item
  )
}
