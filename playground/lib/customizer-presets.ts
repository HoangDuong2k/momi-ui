interface AccentTokens {
  primary: string
  foreground: string
}

export interface Accent {
  id: string
  label: string
  swatch: string
  light?: AccentTokens
  dark?: AccentTokens
}

const white = 'oklch(0.985 0 0)'

export const accents: Accent[] = [
  { id: 'neutral', label: 'Neutral', swatch: 'oklch(0.205 0 0)' },
  {
    id: 'blue',
    label: 'Blue',
    swatch: 'oklch(0.546 0.245 262.881)',
    light: { primary: 'oklch(0.546 0.245 262.881)', foreground: white },
    dark: { primary: 'oklch(0.623 0.214 259.815)', foreground: white },
  },
  {
    id: 'indigo',
    label: 'Indigo',
    swatch: 'oklch(0.511 0.262 276.966)',
    light: { primary: 'oklch(0.511 0.262 276.966)', foreground: white },
    dark: { primary: 'oklch(0.585 0.233 277.117)', foreground: white },
  },
  {
    id: 'violet',
    label: 'Violet',
    swatch: 'oklch(0.541 0.281 293.009)',
    light: { primary: 'oklch(0.541 0.281 293.009)', foreground: white },
    dark: { primary: 'oklch(0.606 0.25 292.717)', foreground: white },
  },
  {
    id: 'emerald',
    label: 'Emerald',
    swatch: 'oklch(0.596 0.145 163.225)',
    light: { primary: 'oklch(0.508 0.118 165.612)', foreground: white },
    dark: { primary: 'oklch(0.696 0.17 162.48)', foreground: 'oklch(0.2 0.04 165)' },
  },
  {
    id: 'rose',
    label: 'Rose',
    swatch: 'oklch(0.586 0.253 17.585)',
    light: { primary: 'oklch(0.586 0.253 17.585)', foreground: white },
    dark: { primary: 'oklch(0.645 0.246 16.439)', foreground: white },
  },
  {
    id: 'orange',
    label: 'Orange',
    swatch: 'oklch(0.646 0.222 41.116)',
    light: { primary: 'oklch(0.553 0.195 38.402)', foreground: white },
    dark: { primary: 'oklch(0.705 0.213 47.604)', foreground: 'oklch(0.21 0.04 45)' },
  },
]

export const radii = [
  { value: '0rem', label: 'None' },
  { value: '0.375rem', label: 'Small' },
  { value: '0.625rem', label: 'Default' },
  { value: '0.875rem', label: 'Large' },
  { value: '1.25rem', label: 'Full' },
]
