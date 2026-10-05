import type * as React from 'react'
import { useMessages } from '../i18n/locale-provider'
import { cn } from '../lib/cn'

const spinnerSizes = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
} as const

export interface SpinnerProps extends React.ComponentProps<'svg'> {
  size?: keyof typeof spinnerSizes
  /** Accessible label announced by screen readers. @default messages.common.loading ('Loading') */
  label?: string
}

export function Spinner({ size = 'md', label, className, ...props }: SpinnerProps) {
  const t = useMessages('common')
  return (
    <svg
      data-slot="spinner"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label={label ?? t.loading}
      className={cn('shrink-0 animate-spin', spinnerSizes[size], className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
