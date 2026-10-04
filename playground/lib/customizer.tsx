import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTheme } from '../../src'
import {
  CustomizerContext,
  type CustomizerContextValue,
  type CustomizerState,
} from './customizer-context'
import { accents } from './customizer-presets'

const STORAGE_KEY = 'momi-playground-customizer'
const DEFAULT_STATE: CustomizerState = { accent: 'neutral', radius: '0.625rem' }

function loadState(): CustomizerState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw
      ? { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<CustomizerState>) }
      : DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

/** Playground-only: live accent color + radius, applied as CSS variables on <html>. */
export function CustomizerProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme()
  const [state, setState] = useState<CustomizerState>(loadState)

  useEffect(() => {
    const root = document.documentElement
    const tokens = accents.find((a) => a.id === state.accent)?.[resolvedTheme]
    if (tokens) {
      root.style.setProperty('--primary', tokens.primary)
      root.style.setProperty('--primary-foreground', tokens.foreground)
      root.style.setProperty('--ring', tokens.primary)
    } else {
      root.style.removeProperty('--primary')
      root.style.removeProperty('--primary-foreground')
      root.style.removeProperty('--ring')
    }
    root.style.setProperty('--radius', state.radius)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore unavailable storage — the customizer still works for this session.
    }
  }, [state, resolvedTheme])

  const value = useMemo<CustomizerContextValue>(
    () => ({
      ...state,
      setAccent: (accent) => setState((s) => ({ ...s, accent })),
      setRadius: (radius) => setState((s) => ({ ...s, radius })),
    }),
    [state],
  )

  return <CustomizerContext value={value}>{children}</CustomizerContext>
}
