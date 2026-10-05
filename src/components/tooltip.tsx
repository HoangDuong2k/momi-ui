import { Tooltip as TooltipPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../lib/cn'
import { useCollisionProps, usePortalContainer } from './portal-provider'
import type { Shortcut } from '../lib/shortcut'
import { Kbd } from './typography'

const InsideProviderContext = React.createContext(false)

export interface TooltipProviderProps extends React.ComponentProps<
  typeof TooltipPrimitive.Provider
> {
  /** @default 200 */
  delayDuration?: number
}

/**
 * Optional: wrap your app (or a toolbar) so tooltips share timing —
 * moving between tooltips opens the next one instantly.
 */
export function TooltipProvider({ delayDuration = 200, ...props }: TooltipProviderProps) {
  return (
    <InsideProviderContext value={true}>
      <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
    </InsideProviderContext>
  )
}

export interface TooltipProps extends Omit<
  React.ComponentProps<typeof TooltipPrimitive.Root>,
  'children'
> {
  /** Tooltip text or content. Nothing is rendered when empty. */
  content: React.ReactNode
  /**
   * Keyboard shortcut shown after the content, formatted for the user's platform:
   * `shortcut={['mod', 'S']}` → "Save project ⌘S" on a Mac, "Save project Ctrl+S" elsewhere.
   */
  shortcut?: Shortcut | string[]
  /** The trigger: a single element that accepts a ref (button, link, …). */
  children: React.ReactElement
  /** @default 'top' */
  side?: React.ComponentProps<typeof TooltipPrimitive.Content>['side']
  align?: React.ComponentProps<typeof TooltipPrimitive.Content>['align']
  /** @default 6 */
  sideOffset?: number
  showArrow?: boolean
  disabled?: boolean
  contentClassName?: string
  /** Keep the tooltip inside this element (defaults to `PortalProvider`'s boundary). */
  collisionBoundary?: React.ComponentProps<typeof TooltipPrimitive.Content>['collisionBoundary']
  /** @default 8 */
  collisionPadding?: React.ComponentProps<typeof TooltipPrimitive.Content>['collisionPadding']
  /** Mount it here instead of `PortalProvider`'s container (or `document.body`). */
  container?: Element | DocumentFragment | null
}

/** A short label shown on hover/focus: `<Tooltip content="Copy"><IconButton … /></Tooltip>`. */
export function Tooltip({
  content,
  shortcut,
  children,
  side = 'top',
  align,
  sideOffset = 6,
  showArrow = false,
  disabled = false,
  contentClassName,
  collisionBoundary,
  collisionPadding,
  container,
  delayDuration,
  ...rootProps
}: TooltipProps) {
  const insideProvider = React.useContext(InsideProviderContext)
  const portalContainer = usePortalContainer(container)
  const collision = useCollisionProps({ collisionBoundary, collisionPadding })
  if (disabled || content == null || content === '') return children

  const tooltip = (
    <TooltipPrimitive.Root data-slot="tooltip" delayDuration={delayDuration} {...rootProps}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal container={portalContainer}>
        <TooltipPrimitive.Content
          data-slot="tooltip-content"
          side={side}
          align={align}
          sideOffset={sideOffset}
          {...collision}
          className={cn(
            'z-50 max-w-xs origin-(--radix-tooltip-content-transform-origin) rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-balance text-background shadow-md',
            'data-[state=closed]:animate-pop-out data-[state=delayed-open]:animate-pop-in data-[state=instant-open]:animate-pop-in',
            'data-[side=bottom]:[--momi-pop-y:-3px] data-[side=left]:[--momi-pop-x:3px] data-[side=right]:[--momi-pop-x:-3px] data-[side=top]:[--momi-pop-y:3px]',
            contentClassName,
          )}
        >
          {shortcut ? (
            <span className="flex items-center gap-2">
              <span className="min-w-0">{content}</span>
              <Kbd
                keys={shortcut}
                className="h-4 shrink-0 border-background/20 bg-background/10 px-1 text-[10px] text-background"
              />
            </span>
          ) : (
            content
          )}
          {showArrow && (
            <TooltipPrimitive.Arrow width={10} height={5} className="fill-foreground" />
          )}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )

  if (insideProvider) return tooltip
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration ?? 200}>
      {tooltip}
    </TooltipPrimitive.Provider>
  )
}
