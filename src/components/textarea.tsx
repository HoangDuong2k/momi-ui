import type * as React from 'react'
import { cn } from '../lib/cn'
import { useFormControlProps } from './form-field'

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  /** Grow with the content (CSS `field-sizing: content`). @default false */
  autoResize?: boolean
}

export function Textarea(props: TextareaProps) {
  const { className, autoResize = false, ...rest } = useFormControlProps(props)
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-20 w-full rounded-md border border-input bg-surface-sunken px-3 py-2 text-base text-foreground shadow-xs sm:text-sm',
        'transition-[color,border-color,box-shadow] duration-150 outline-none',
        'placeholder:text-muted-foreground/70',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30',
        'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        autoResize ? 'field-sizing-content resize-none' : 'resize-y',
        className,
      )}
      {...rest}
    />
  )
}
