/**
 * Semantic color tones shared by components (Badge, Alert, …).
 * Class names are written out in full so Tailwind can detect them.
 */
export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

export const toneSolid: Record<Tone, string> = {
  neutral: 'bg-foreground text-background',
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-destructive text-destructive-foreground',
  info: 'bg-info text-info-foreground',
}

export const toneSoft: Record<Tone, string> = {
  neutral: 'bg-secondary text-secondary-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
}

export const toneOutline: Record<Tone, string> = {
  neutral: 'border-border text-foreground',
  primary: 'border-primary/30 text-primary',
  success: 'border-success/30 text-success',
  warning: 'border-warning/30 text-warning',
  danger: 'border-destructive/30 text-destructive',
  info: 'border-info/30 text-info',
}

/** Soft background + matching hairline border (Alert). */
export const toneSoftBordered: Record<Tone, string> = {
  neutral: 'border-border bg-secondary text-secondary-foreground',
  primary: 'border-primary/20 bg-primary/5 text-primary',
  success: 'border-success/20 bg-success/5 text-success',
  warning: 'border-warning/25 bg-warning/5 text-warning',
  danger: 'border-destructive/20 bg-destructive/5 text-destructive',
  info: 'border-info/20 bg-info/5 text-info',
}

export const toneBg: Record<Tone, string> = {
  neutral: 'bg-foreground',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  info: 'bg-info',
}

export const toneText: Record<Tone, string> = {
  neutral: 'text-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
  info: 'text-info',
}
