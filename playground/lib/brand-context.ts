import { createContext, useContext } from 'react'

export type Brand = 'default' | 'studio'

export interface BrandContextValue {
  brand: Brand
  setBrand: (brand: Brand) => void
}

export const BrandContext = createContext<BrandContextValue | null>(null)

export function useBrand() {
  const context = useContext(BrandContext)
  if (!context) throw new Error('useBrand must be used inside <BrandProvider>.')
  return context
}
