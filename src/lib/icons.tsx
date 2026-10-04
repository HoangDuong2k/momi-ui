import type * as React from 'react'

/** Minimal internal icon set so the library has no icon-package dependency. */
type IconProps = React.ComponentProps<'svg'>

const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={3} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function MinusIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={3} {...props}>
      <path d="M5 12h14" />
    </svg>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  )
}
