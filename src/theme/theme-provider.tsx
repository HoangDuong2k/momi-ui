import * as React from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  /** The user's choice, possibly `system`. */
  theme: Theme
  /** The theme actually applied to the document. */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const MEDIA = '(prefers-color-scheme: dark)'
const THEMES: Theme[] = ['light', 'dark', 'system']

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
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'momi-theme',
  attribute = 'class',
  disableTransitionOnChange = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() =>
    storageKey && typeof window !== 'undefined'
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

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme

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
      if (!storageKey) return
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        // Storage can be unavailable (private mode, blocked cookies) — theme still applies.
      }
    },
    [storageKey],
  )

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>.')
  return context
}
