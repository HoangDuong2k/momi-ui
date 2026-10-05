import { createContext, useContext } from 'react'

export type Language = 'en' | 'vi'

export interface CustomizerState {
  accent: string
  radius: string
  language: Language
}

export interface CustomizerContextValue extends CustomizerState {
  setAccent: (id: string) => void
  setRadius: (value: string) => void
  setLanguage: (language: Language) => void
}

export const CustomizerContext = createContext<CustomizerContextValue | null>(null)

export function useCustomizer() {
  const context = useContext(CustomizerContext)
  if (!context) throw new Error('useCustomizer must be used inside <CustomizerProvider>.')
  return context
}
