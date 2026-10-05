import * as React from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  /** The user's choice, possibly `system` (the forced theme while `forcedTheme` is set). */
  theme: Theme
  /** The theme actually applied to the document. */
  resolvedTheme: ResolvedTheme
  /** Set when the provider ignores the user's choice. */
  forcedTheme?: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const MEDIA = '(prefers-color-scheme: dark)'
const THEMES: Theme[] = ['light', 'dark', 'system']

/** Defaults shared with `ThemeScript`, so both read and apply the theme the same way. */
export const themeDefaults = {
  storageKey: 'momi-theme',
  defaultTheme: 'system',
  attribute: 'class',
} as const

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia(MEDIA).matches ? 'dark' : 'light'
}

function readStoredTheme(key: string, fallback: Theme): Theme {
  try {
    const stored = window.localStorage.getItem(key)
    return stored && (THEMES as string[]).includes(stored) ? (stored as Theme) : fallback
  } catch {
    return fallback
  }
}

/** Temporarily disable CSS transitions so colors don't animate when the theme flips. */
function suspendTransitions() {
  const style = document.createElement('style')
  style.appendChild(document.createTextNode('*,*::before,*::after{transition:none!important}'))
  document.head.appendChild(style)
  return () => {
    void window.getComputedStyle(document.body).opacity
    requestAnimationFrame(() => style.remove())
  }
}

export interface ThemeProviderProps {
  children: React.ReactNode
  /** Theme used when nothing is stored yet. @default 'system' */
  defaultTheme?: Theme
  /** localStorage key, or `false` to disable persistence. @default 'momi-theme' */
  storageKey?: string | false
  /** How the theme is applied to `<html>`. @default 'class' */
  attribute?: 'class' | 'data-theme'
  /** @default true */
  disableTransitionOnChange?: boolean
  /**
   * Always apply this theme — e.g. a dark-only desktop app. The system preference is ignored and
   * nothing is read from or written to storage.
   */
  forcedTheme?: ResolvedTheme
}

export function ThemeProvider({
  children,
  defaultTheme = themeDefaults.defaultTheme,
  storageKey = themeDefaults.storageKey,
  attribute = themeDefaults.attribute,
  disableTransitionOnChange = true,
  forcedTheme,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() =>
    storageKey && !forcedTheme && typeof window !== 'undefined'
      ? readStoredTheme(storageKey, defaultTheme)
      : defaultTheme,
  )
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>(getSystemTheme)

  React.useEffect(() => {
    if (!window.matchMedia) return
    const mql = window.matchMedia(MEDIA)
    const onChange = () => setSystemTheme(mql.matches ? 'dark' : 'light')
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme: ResolvedTheme = forcedTheme ?? (theme === 'system' ? systemTheme : theme)

  React.useEffect(() => {
    const root = document.documentElement
    const restore = disableTransitionOnChange ? suspendTransitions() : undefined
    if (attribute === 'class') {
      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)
    } else {
      root.setAttribute('data-theme', resolvedTheme)
    }
    root.style.colorScheme = resolvedTheme
    restore?.()
  }, [resolvedTheme, attribute, disableTransitionOnChange])

  const setTheme = React.useCallback(
    (next: Theme) => {
      setThemeState(next)
      if (!storageKey || forcedTheme) return
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        // Storage can be unavailable (private mode, blocked cookies) — theme still applies.
      }
    },
    [storageKey, forcedTheme],
  )

  const value = React.useMemo(
    () => ({ theme: forcedTheme ?? theme, resolvedTheme, forcedTheme, setTheme }),
    [theme, resolvedTheme, forcedTheme, setTheme],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>.')
  return context
}
