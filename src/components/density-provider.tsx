import * as React from 'react'

export type Density = 'comfortable' | 'compact'

const DensityContext = React.createContext<Density>('comfortable')

export interface DensityProviderProps {
  /** `compact` makes controls below default to their smallest size (`xs`). @default 'comfortable' */
  density?: Density
  children: React.ReactNode
}

/**
 * Sets the default `size` of controls inside it — e.g. a dense property panel in an editor.
 * A component's own `size` prop still wins. Spacing of cards, dialogs and menus is not changed.
 */
export function DensityProvider({ density = 'comfortable', children }: DensityProviderProps) {
  return <DensityContext value={density}>{children}</DensityContext>
}

export function useDensity(): Density {
  return React.useContext(DensityContext)
}

/** `size` if set, otherwise the size this component uses at the current density. */
export function useDefaultSize<S extends string>(
  size: S | undefined,
  defaults: { comfortable: S; compact: S },
): S {
  const density = React.useContext(DensityContext)
  return size ?? defaults[density]
}
