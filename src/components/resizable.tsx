import * as React from 'react'
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
  type GroupProps,
  type Layout,
  type LayoutStorage,
  type PanelImperativeHandle,
  type PanelProps,
  type SeparatorProps,
} from 'react-resizable-panels'
import { useMessages } from '../i18n/locale-provider'
import { cn } from '../lib/cn'
import { GripVerticalIcon } from '../lib/icons'
import { mergeRefs } from '../lib/merge-refs'

/** localStorage that never throws and stays silent on the server. */
const browserStorage: LayoutStorage = {
  getItem(key) {
    try {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // Storage can be unavailable (private mode, blocked site data) — the layout still works.
    }
  },
}

const noStorage: LayoutStorage = { getItem: () => null, setItem: () => {} }

const noopSubscribe = () => () => {}
/** False while rendering on the server or hydrating its HTML, true afterwards (and in client-only apps). */
const useHydrated = () =>
  React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )

/* -------------------------------------------------------------------------------------------------
 * ResizablePanelGroup
 * -----------------------------------------------------------------------------------------------*/

export interface ResizablePanelGroupProps extends Omit<GroupProps, 'orientation'> {
  /** @default 'horizontal' */
  direction?: 'horizontal' | 'vertical'
  /**
   * Remember the layout in localStorage under this key. Give every panel a stable `id` so the
   * saved sizes find their panels again.
   */
  autoSaveId?: string
  /**
   * Called once a resize, collapse or expand has finished, with each panel's size in percent —
   * save it yourself and pass it back as `defaultLayout`.
   */
  onLayout?: (layout: Layout) => void
}

/**
 * Panels the user can resize by dragging (or with the arrow keys on) the handles between them.
 * Built on `react-resizable-panels`: numeric sizes are pixels, strings like `"30%"` percentages.
 */
export function ResizablePanelGroup({
  direction = 'horizontal',
  autoSaveId,
  onLayout,
  defaultLayout,
  onLayoutChanged,
  className,
  ...props
}: ResizablePanelGroupProps) {
  const saved = useDefaultLayout({
    id: `momi:${autoSaveId ?? ''}`,
    storage: autoSaveId ? browserStorage : noStorage,
  })
  // The server can't read localStorage: hydrate with the default sizes, then remount once with
  // the saved ones. Client-only apps (Electron, Vite SPAs) get the saved layout on first render.
  const hydrated = useHydrated()
  const savedLayout = autoSaveId && hydrated ? saved.defaultLayout : undefined

  return (
    <Group
      key={autoSaveId && hydrated ? 'restored' : 'default'}
      data-slot="resizable-panel-group"
      data-direction={direction}
      orientation={direction}
      defaultLayout={defaultLayout ?? savedLayout}
      onLayoutChanged={(layout, meta) => {
        if (autoSaveId) saved.onLayoutChanged(layout, meta)
        onLayout?.(layout)
        onLayoutChanged?.(layout, meta)
      }}
      className={cn('size-full', className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * ResizablePanel
 * -----------------------------------------------------------------------------------------------*/

export interface ResizablePanelProps extends Omit<PanelProps, 'children'> {
  /** Called when the panel collapses (dragged below `minSize`, or `panelRef.collapse()`). */
  onCollapse?: () => void
  /** Called when a collapsed panel opens again. It returns to its previous size. */
  onExpand?: () => void
  /** Content, or a function of `{ collapsed }` — e.g. icons only in a collapsed strip. */
  children?: React.ReactNode | ((state: { collapsed: boolean }) => React.ReactNode)
}

export function ResizablePanel({
  onCollapse,
  onExpand,
  onResize,
  panelRef,
  className,
  children,
  ...props
}: ResizablePanelProps) {
  const handleRef = React.useRef<PanelImperativeHandle | null>(null)
  const ref = React.useCallback(
    (handle: PanelImperativeHandle | null) => {
      handleRef.current = handle
      mergeRefs(panelRef)(handle)
    },
    [panelRef],
  )
  const collapsedRef = React.useRef(false)
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <Panel
      data-slot="resizable-panel"
      data-collapsed={collapsed || undefined}
      panelRef={ref}
      onResize={(size, id, previous) => {
        onResize?.(size, id, previous)
        const isCollapsed = handleRef.current?.isCollapsed() ?? false
        if (isCollapsed === collapsedRef.current) return
        collapsedRef.current = isCollapsed
        setCollapsed(isCollapsed)
        // The first measurement only reports the initial state.
        if (previous) (isCollapsed ? onCollapse : onExpand)?.()
      }}
      className={cn('min-h-0 min-w-0', className)}
      {...props}
    >
      {typeof children === 'function' ? children({ collapsed }) : children}
    </Panel>
  )
}

/* -------------------------------------------------------------------------------------------------
 * ResizableHandle
 * -----------------------------------------------------------------------------------------------*/

export interface ResizableHandleProps extends SeparatorProps {
  /** Show a small grip in the middle of the line. */
  withHandle?: boolean
}

/**
 * The line between two panels. Drag it, use the arrow keys when focused, or double-click to put
 * the panels back to their default sizes.
 */
export function ResizableHandle({
  withHandle = false,
  className,
  'aria-label': ariaLabel,
  ...props
}: ResizableHandleProps) {
  const t = useMessages('resizable')
  return (
    <Separator
      data-slot="resizable-handle"
      aria-label={ariaLabel ?? t.handle}
      className={cn(
        'group/handle relative z-10 flex shrink-0 items-center justify-center bg-border outline-none',
        'transition-[background-color,box-shadow] duration-150',
        'aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=vertical]:w-px',
        'data-[separator=active]:bg-primary data-[separator=focus]:bg-ring data-[separator=hover]:bg-ring',
        'focus-visible:ring-[3px] focus-visible:ring-ring/40',
        'data-[separator=disabled]:bg-border',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <span
          aria-hidden
          className={cn(
            'flex h-6 w-3.5 shrink-0 items-center justify-center rounded-[4px] border bg-background text-muted-foreground shadow-xs',
            'transition-colors group-data-[separator=active]/handle:border-primary group-data-[separator=active]/handle:text-foreground',
            'group-aria-[orientation=horizontal]/handle:h-3.5 group-aria-[orientation=horizontal]/handle:w-6',
          )}
        >
          <GripVerticalIcon className="size-3 group-aria-[orientation=horizontal]/handle:rotate-90" />
        </span>
      )}
    </Separator>
  )
}

export type { Layout as ResizableLayout, PanelImperativeHandle as ResizablePanelHandle }
