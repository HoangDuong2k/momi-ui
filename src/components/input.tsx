import { cva } from 'class-variance-authority'
import type * as React from 'react'
import { cn } from '../lib/cn'
import { useDefaultSize } from './density-provider'
import { useFormControlProps } from './form-field'

export type InputSize = 'xs' | 'sm' | 'md' | 'lg'

/** Shared look for text-like controls (Input, NativeSelect, …). */
export const inputVariants = cva(
  [
    'flex w-full min-w-0 rounded-md border border-input bg-surface-sunken text-foreground shadow-xs',
    'transition-[color,border-color,box-shadow] duration-150 outline-none',
    'placeholder:text-muted-foreground/70',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30',
    'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20',
    'read-only:focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
    'file:me-3 file:inline-flex file:h-full file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
  ],
  {
    variants: {
      size: {
        xs: 'h-6 rounded-sm px-2 text-xs file:text-xs',
        sm: 'h-8 px-2.5 text-sm',
        md: 'h-9 px-3 text-base sm:text-sm',
        lg: 'h-11 rounded-lg px-4 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

const sectionWidth: Record<InputSize, string> = { xs: 'w-6', sm: 'w-8', md: 'w-9', lg: 'w-11' }
const startPadding: Record<InputSize, string> = { xs: 'ps-6', sm: 'ps-8', md: 'ps-9', lg: 'ps-11' }
const endPadding: Record<InputSize, string> = { xs: 'pe-6', sm: 'pe-8', md: 'pe-9', lg: 'pe-11' }

/** Default control size at each density (Input, Select, NativeSelect, Combobox, pickers). */
export const controlSizeDefaults = { comfortable: 'md', compact: 'xs' } as const satisfies Record<
  string,
  InputSize
>

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  /** @default 'md' (`xs` inside a compact `DensityProvider`) */
  size?: InputSize
  /** Content (usually an icon) rendered inside the input, at the start. */
  leftSection?: React.ReactNode
  /** Content rendered inside the input, at the end. Buttons inside stay clickable. */
  rightSection?: React.ReactNode
  /** Class for the wrapper rendered when a section is present. */
  wrapperClassName?: string
}

export function Input(props: InputProps) {
  const {
    className,
    size: sizeProp,
    leftSection,
    rightSection,
    wrapperClassName,
    ...rest
  } = useFormControlProps(props)
  const size = useDefaultSize<InputSize>(sizeProp, controlSizeDefaults)

  const input = (
    <input
      data-slot="input"
      className={cn(
        inputVariants({ size }),
        leftSection != null && startPadding[size],
        rightSection != null && endPadding[size],
        className,
      )}
      {...rest}
    />
  )

  if (leftSection == null && rightSection == null) return input

  const section = cn(
    'pointer-events-none absolute inset-y-0 flex items-center justify-center text-muted-foreground',
    "[&_button]:pointer-events-auto [&_svg:not([class*='size-'])]:size-4",
    size === 'xs' && "[&_svg:not([class*='size-'])]:size-3.5",
    sectionWidth[size],
  )

  return (
    <div data-slot="input-wrapper" className={cn('relative w-full', wrapperClassName)}>
      {leftSection != null && <span className={cn(section, 'start-0')}>{leftSection}</span>}
      {input}
      {rightSection != null && <span className={cn(section, 'end-0')}>{rightSection}</span>}
    </div>
  )
}
