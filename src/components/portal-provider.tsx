import * as React from 'react'

type Side = 'top' | 'right' | 'bottom' | 'left'
/** Same shapes as Radix's `container` and `collisionBoundary`. */
export type PortalContainer = Element | DocumentFragment
type Boundary = Element | null

export interface PortalSettings {
  /**
   * Where overlays (popovers, menus, tooltips, dialogs, drawers, drag previews…) are mounted.
   * Defaults to `document.body`. A shadow root works too.
   */
  container?: PortalContainer | null
  /** Floating content (popovers, menus, tooltips, selects) flips and shifts to stay inside it. */
  collisionBoundary?: Boundary | Boundary[]
  /** Space kept between floating content and the boundary, in px. */
  collisionPadding?: number | Partial<Record<Side, number>>
}

const PortalContext = React.createContext<PortalSettings>({})

export interface PortalProviderProps extends PortalSettings {
  children: React.ReactNode
}

/**
 * Sets where every overlay below it is mounted and what it must stay inside — for UIs embedded in
 * a region of the page (a panel, a device frame, a widget) instead of filling the window. Nested
 * providers override only the settings they pass. Component props still win.
 */
export function PortalProvider({
  container,
  collisionBoundary,
  collisionPadding,
  children,
}: PortalProviderProps) {
  const parent = React.useContext(PortalContext)
  const value = React.useMemo<PortalSettings>(
    () => ({
      container: container !== undefined ? container : parent.container,
      collisionBoundary:
        collisionBoundary !== undefined ? collisionBoundary : parent.collisionBoundary,
      collisionPadding: collisionPadding !== undefined ? collisionPadding : parent.collisionPadding,
    }),
    [container, collisionBoundary, collisionPadding, parent],
  )
  return <PortalContext value={value}>{children}</PortalContext>
}

/** The settings from the nearest `PortalProvider` (empty without one). */
export function usePortalSettings(): PortalSettings {
  return React.useContext(PortalContext)
}

/** Portal container: an explicit one wins, then the provider's; `undefined` = `document.body`. */
export function usePortalContainer(
  container?: PortalContainer | null,
): PortalContainer | undefined {
  const settings = React.useContext(PortalContext)
  return (container !== undefined ? container : settings.container) ?? undefined
}

/**
 * Collision props for Radix floating content: the component's own props win, then the provider,
 * then the library default padding.
 */
export function useCollisionProps(
  props: Pick<PortalSettings, 'collisionBoundary' | 'collisionPadding'>,
  defaultPadding: PortalSettings['collisionPadding'] = 8,
) {
  const settings = React.useContext(PortalContext)
  return {
    collisionBoundary: props.collisionBoundary ?? settings.collisionBoundary ?? undefined,
    collisionPadding: props.collisionPadding ?? settings.collisionPadding ?? defaultPadding,
  }
}

/** Placement props of components that open their own popover (Combobox, DatePicker, …). */
export interface OverlayPlacementProps {
  /** Mount the popup here instead of `PortalProvider`'s container (or `document.body`). */
  container?: PortalContainer | null
  /** Keep the popup inside this element (defaults to `PortalProvider`'s boundary). */
  collisionBoundary?: Boundary | Boundary[]
  /** @default 8 */
  collisionPadding?: number | Partial<Record<Side, number>>
}

/** Resolved portal container and collision props for an `OverlayPlacementProps` component. */
export function useOverlayPlacement({
  container,
  collisionBoundary,
  collisionPadding,
}: OverlayPlacementProps) {
  return {
    container: usePortalContainer(container),
    collision: useCollisionProps({ collisionBoundary, collisionPadding }),
  }
}
