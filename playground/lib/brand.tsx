import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeProvider } from '../../src'
import { BrandContext, type Brand } from './brand-context'

const STORAGE_KEY = 'momi-playground-brand'

function loadBrand(): Brand {
  // `?brand=studio` / `?brand=default` makes a shareable link.
  const fromUrl = new URLSearchParams(window.location.search).get('brand')
  if (fromUrl === 'studio' || fromUrl === 'default') return fromUrl
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'studio' ? 'studio' : 'default'
  } catch {
    return 'default'
  }
}

/**
 * Playground-only: switches between momi's default look and "Studio", a warm dark brand theme
 * (tokens in index.css). Studio is dark-only, so it forces the theme with `forcedTheme`.
 */
export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<Brand>(loadBrand)

  useEffect(() => {
    const root = document.documentElement
    if (brand === 'studio') root.dataset.brand = 'studio'
    else delete root.dataset.brand
    try {
      window.localStorage.setItem(STORAGE_KEY, brand)
    } catch {
      // Storage unavailable — the brand still applies for this session.
    }
  }, [brand])

  const value = useMemo(() => ({ brand, setBrand }), [brand])

  return (
    <BrandContext value={value}>
      <ThemeProvider
        defaultTheme="system"
        storageKey="momi-playground-theme"
        forcedTheme={brand === 'studio' ? 'dark' : undefined}
      >
        {children}
      </ThemeProvider>
    </BrandContext>
  )
}
