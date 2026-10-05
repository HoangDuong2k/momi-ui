import { DropdownMenu as MenuPrimitive } from 'radix-ui'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { useMessages } from '../i18n/locale-provider'
import { cn } from '../lib/cn'
import { mergeRefs } from '../lib/merge-refs'
import { CheckIcon, ChevronRightIcon } from '../lib/icons'
import { MenuShortcut, type MenuShortcutProps } from './internal/menu-shortcut'

export type { MenuShortcutProps }
import {
  menuContentClass,
  menuIndicatorClass,
  menuIndicatorItemClass,
  menuItemClass,
  menuLabelClass,
  menuSeparatorClass,
  menuSubTriggerClass,
  popAnimationClass,
  surfaceClass,
} from './internal/overlay-styles'

export interface MenuPosition {
  /** Viewport coordinates, e.g. `event.clientX` / `event.clientY`. */
  x: number
  y: number
}

/** Opened at a point (`position`) rather than from a trigger. */
const PositionedContext = React.createContext(false)

/**
 * Mounted inside an open positioned menu. Layout effects run before Radix moves focus into the
 * menu, so this sees the element that had focus.
 */
function RememberFocus({
  targetRef,
  interactedRef,
}: {
  targetRef: React.RefObject<HTMLElement | null>
  interactedRef: React.RefObject<boolean>
}) {
  React.useLayoutEffect(() => {
    targetRef.current = document.activeElement as HTMLElement | null
    interactedRef.current = false
  }, [targetRef, interactedRef])
  return null
}

export interface DropdownMenuProps extends React.ComponentProps<typeof MenuPrimitive.Root> {
  /**
   * Open at a viewport point instead of from a `DropdownMenuTrigger` — for right-click menus on a
   * canvas, timeline or preview. Control it with `open` / `onOpenChange`. The menu flips and
   * shifts to stay inside the window. Non-modal by default, so a right-click elsewhere reopens it.
   */
  position?: MenuPosition | null
}

export function DropdownMenu({ position, modal, children, ...props }: DropdownMenuProps) {
  const positioned = position !== undefined
  // Keep the last point while the menu animates out after `position` is cleared.
  const [anchor, setAnchor] = React.useState(position ?? null)
  if (position && (position.x !== anchor?.x || position.y !== anchor?.y)) setAnchor(position)
  const t = useMessages('common')

  return (
    <MenuPrimitive.Root data-slot="dropdown-menu" modal={modal ?? !positioned} {...props}>
      {positioned &&
        anchor &&
        typeof document !== 'undefined' &&
        // In <body>, so a transformed ancestor (e.g. a Dialog) can't offset the fixed anchor.
        createPortal(
          <MenuPrimitive.Trigger asChild>
            {/* Remounts when the point moves, so an open menu follows it. It also names the menu. */}
            <span
              key={`${anchor.x}:${anchor.y}`}
              aria-hidden
              aria-label={t.menu}
              data-slot="dropdown-menu-anchor"
              className="pointer-events-none fixed size-0"
              style={{ left: anchor.x, top: anchor.y }}
            />
          </MenuPrimitive.Trigger>,
          document.body,
        )}
      <PositionedContext value={positioned}>{children}</PositionedContext>
    </MenuPrimitive.Root>
  )
}

export function DropdownMenuTrigger(props: React.ComponentProps<typeof MenuPrimitive.Trigger>) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

export function DropdownMenuGroup(props: React.ComponentProps<typeof MenuPrimitive.Group>) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

export function DropdownMenuContent({
  side,
  align,
  sideOffset,
  collisionPadding = 8,
  onCloseAutoFocus,
  onInteractOutside,
  onPointerDownOutside,
  className,
  children,
  ref,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Content>) {
  const positioned = React.useContext(PositionedContext)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const setContent = React.useMemo(() => mergeRefs(contentRef, ref), [ref])
  // A positioned menu has no trigger to return focus to: restore whatever had focus before.
  const returnFocusRef = React.useRef<HTMLElement | null>(null)
  const interactedOutsideRef = React.useRef(false)

  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        data-slot="dropdown-menu-content"
        // At a point the menu opens to its right like a native context menu, flipping left near
        // the window edge.
        side={side ?? (positioned ? 'right' : undefined)}
        align={align ?? (positioned ? 'start' : undefined)}
        sideOffset={sideOffset ?? (positioned ? 2 : 6)}
        collisionPadding={collisionPadding}
        ref={setContent}
        onPointerDownOutside={(event) => {
          onPointerDownOutside?.(event)
          // A press on this menu's own trigger is handled by the trigger, which toggles the menu.
          // Otherwise pressing it while the menu animates closed reopens the menu, and the closing
          // content — still mounted — treats the press as "outside" and closes it again.
          const content = contentRef.current
          const triggerId = content?.getAttribute('aria-labelledby')
          const trigger = triggerId ? content?.ownerDocument.getElementById(triggerId) : null
          const target = event.detail.originalEvent.target
          if (trigger && target instanceof Node && trigger.contains(target)) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          interactedOutsideRef.current = true
          onInteractOutside?.(event)
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event)
          if (!positioned || event.defaultPrevented) return
          event.preventDefault()
          const target = returnFocusRef.current
          returnFocusRef.current = null
          if (!interactedOutsideRef.current && target?.isConnected) target.focus()
        }}
        className={cn(
          surfaceClass,
          popAnimationClass,
          menuContentClass,
          'max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin)',
          className,
        )}
        {...props}
      >
        {positioned && (
          <RememberFocus targetRef={returnFocusRef} interactedRef={interactedOutsideRef} />
        )}
        {children}
      </MenuPrimitive.Content>
    </MenuPrimitive.Portal>
  )
}

export interface DropdownMenuItemProps extends React.ComponentProps<typeof MenuPrimitive.Item> {
  /** Indent to align with items that have an indicator. */
  inset?: boolean
  /** @default 'default' */
  variant?: 'default' | 'danger'
}

export function DropdownMenuItem({
  inset,
  variant = 'default',
  className,
  ...props
}: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(menuItemClass, className)}
      {...props}
    />
  )
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(menuItemClass, menuIndicatorItemClass, className)}
      {...props}
    >
      <span className={menuIndicatorClass}>
        <MenuPrimitive.ItemIndicator>
          <CheckIcon className="size-3.5 text-foreground" />
        </MenuPrimitive.ItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

export function DropdownMenuRadioGroup(
  props: React.ComponentProps<typeof MenuPrimitive.RadioGroup>,
) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.RadioItem>) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(menuItemClass, menuIndicatorItemClass, className)}
      {...props}
    >
      <span className={menuIndicatorClass}>
        <MenuPrimitive.ItemIndicator>
          <span className="block size-1.5 rounded-full bg-foreground" />
        </MenuPrimitive.ItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

export function DropdownMenuLabel({
  inset,
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Label> & { inset?: boolean }) {
  return (
    <MenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset || undefined}
      className={cn(menuLabelClass, className)}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(menuSeparatorClass, className)}
      {...props}
    />
  )
}

export function DropdownMenuShortcut(props: MenuShortcutProps) {
  return <MenuShortcut slot="dropdown-menu-shortcut" {...props} />
}

export function DropdownMenuSub(props: React.ComponentProps<typeof MenuPrimitive.Sub>) {
  return <MenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

export function DropdownMenuSubTrigger({
  inset,
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <MenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset || undefined}
      className={cn(menuItemClass, menuSubTriggerClass, className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ms-auto size-4 rtl:rotate-180" />
    </MenuPrimitive.SubTrigger>
  )
}

export function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.SubContent>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        className={cn(
          surfaceClass,
          popAnimationClass,
          menuContentClass,
          'origin-(--radix-dropdown-menu-content-transform-origin)',
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  )
}
