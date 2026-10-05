import { Toggle as TogglePrimitive, Toolbar as ToolbarPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../lib/cn'
import type { Shortcut } from '../lib/shortcut'
import { Button, buttonVariants, type ButtonProps, type ButtonSize } from './button'
import { useDefaultSize } from './density-provider'
import { ToolbarScopeContext, toggleVariants } from './toggle-group'
import { Tooltip } from './tooltip'

const ToolbarSizeContext = React.createContext<ButtonSize>('sm')

const squareSizes: Record<ButtonSize, string> = {
  xs: 'size-6',
  sm: 'size-8',
  md: 'size-9',
  lg: 'size-11',
}

const separatorLengths: Record<ButtonSize, string> = {
  xs: 'data-[orientation=vertical]:h-4 data-[orientation=horizontal]:w-4',
  sm: 'data-[orientation=vertical]:h-5 data-[orientation=horizontal]:w-5',
  md: 'data-[orientation=vertical]:h-5 data-[orientation=horizontal]:w-5',
  lg: 'data-[orientation=vertical]:h-6 data-[orientation=horizontal]:w-6',
}

/** Wrap an icon-only control in a tooltip that shows its label (and shortcut). */
function withTooltip(node: React.ReactElement, label?: string, shortcut?: Shortcut | string[]) {
  return label ? (
    <Tooltip content={label} shortcut={shortcut}>
      {node}
    </Tooltip>
  ) : (
    node
  )
}

/* -------------------------------------------------------------------------------------------------
 * Toolbar
 * -----------------------------------------------------------------------------------------------*/

export interface ToolbarProps extends React.ComponentProps<typeof ToolbarPrimitive.Root> {
  /** Size of the buttons and toggle groups inside. @default 'sm' (`xs` when compact) */
  size?: ButtonSize
  /** `surface` draws a bordered bar around the controls. @default 'plain' */
  variant?: 'plain' | 'surface'
}

/**
 * A row of controls reached with one Tab stop; the arrow keys move between buttons, toggles,
 * links and toggle groups inside.
 */
export function Toolbar({ size: sizeProp, variant = 'plain', className, ...props }: ToolbarProps) {
  const size = useDefaultSize(sizeProp, { comfortable: 'sm', compact: 'xs' })
  const scope = React.useMemo(() => ({ size }), [size])
  return (
    <ToolbarSizeContext value={size}>
      <ToolbarScopeContext value={scope}>
        <ToolbarPrimitive.Root
          data-slot="toolbar"
          data-variant={variant}
          className={cn(
            'group/toolbar flex min-w-0 items-center gap-1 data-[orientation=vertical]:flex-col',
            variant === 'surface' &&
              'w-fit rounded-lg border border-border-strong bg-card p-1 shadow-xs data-[orientation=vertical]:h-fit',
            className,
          )}
          {...props}
        />
      </ToolbarScopeContext>
    </ToolbarSizeContext>
  )
}

/** Visually groups related controls; keyboard navigation still flows across groups. */
export function ToolbarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="group"
      data-slot="toolbar-group"
      className={cn(
        'flex items-center gap-0.5 group-data-[orientation=vertical]/toolbar:flex-col',
        className,
      )}
      {...props}
    />
  )
}

export function ToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  const size = React.useContext(ToolbarSizeContext)
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn(
        'shrink-0 bg-border',
        'data-[orientation=vertical]:mx-1 data-[orientation=vertical]:w-px',
        'data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:h-px',
        separatorLengths[size],
        className,
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * ToolbarButton
 * -----------------------------------------------------------------------------------------------*/

interface IconOnlyProps {
  /** Icon for an icon-only control (when there are no children). */
  icon?: React.ReactNode
  /** Accessible name and tooltip of an icon-only control; a tooltip for controls with text. */
  label?: string
  /** Shortcut shown in the tooltip, e.g. `['mod', 'S']`. */
  shortcut?: Shortcut | string[]
}

export interface ToolbarButtonProps extends ButtonProps, IconOnlyProps {}

/** A Button that joins the toolbar's arrow-key navigation. Defaults to the `ghost` variant. */
export function ToolbarButton({
  variant = 'ghost',
  size: sizeProp,
  icon,
  label,
  shortcut,
  disabled,
  className,
  children,
  ...props
}: ToolbarButtonProps) {
  const toolbarSize = React.useContext(ToolbarSizeContext)
  const size = sizeProp ?? toolbarSize
  const iconOnly = children == null && icon != null
  return withTooltip(
    <ToolbarPrimitive.Button asChild disabled={disabled}>
      <Button
        data-slot="toolbar-button"
        variant={variant}
        size={size}
        disabled={disabled}
        aria-label={iconOnly ? label : undefined}
        className={cn(iconOnly && cn('px-0', squareSizes[size]), className)}
        {...props}
      >
        {iconOnly ? icon : children}
      </Button>
    </ToolbarPrimitive.Button>,
    label,
    shortcut,
  )
}

/* -------------------------------------------------------------------------------------------------
 * ToolbarToggle
 * -----------------------------------------------------------------------------------------------*/

export interface ToolbarToggleProps
  extends React.ComponentProps<typeof TogglePrimitive.Root>, IconOnlyProps {
  /** @default the toolbar's size */
  size?: ButtonSize
}

/** A single on/off button, e.g. "Snap" on a timeline toolbar. */
export function ToolbarToggle({
  size: sizeProp,
  icon,
  label,
  shortcut,
  disabled,
  className,
  children,
  ...props
}: ToolbarToggleProps) {
  const toolbarSize = React.useContext(ToolbarSizeContext)
  const size = sizeProp ?? toolbarSize
  const iconOnly = children == null && icon != null
  return withTooltip(
    <ToolbarPrimitive.Button asChild disabled={disabled}>
      <TogglePrimitive.Root
        data-slot="toolbar-toggle"
        disabled={disabled}
        aria-label={iconOnly ? label : undefined}
        className={cn(toggleVariants({ variant: 'ghost', size, iconOnly }), className)}
        {...props}
      >
        {iconOnly ? icon : children}
      </TogglePrimitive.Root>
    </ToolbarPrimitive.Button>,
    label,
    shortcut,
  )
}

/* -------------------------------------------------------------------------------------------------
 * ToolbarLink
 * -----------------------------------------------------------------------------------------------*/

export function ToolbarLink({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Link>) {
  const size = React.useContext(ToolbarSizeContext)
  return (
    <ToolbarPrimitive.Link
      data-slot="toolbar-link"
      className={cn(buttonVariants({ variant: 'ghost', tone: 'neutral', size }), className)}
      {...props}
    />
  )
}
