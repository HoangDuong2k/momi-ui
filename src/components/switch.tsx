import { Switch as SwitchPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../lib/cn'
import { joinIds } from '../lib/ids'
import { useDefaultSize } from './density-provider'
import { useFormControlProps } from './form-field'
import { ChoiceLabel } from './internal/choice-label'

const trackSizes = {
  xs: 'h-3.5 w-6',
  sm: 'h-4 w-7',
  md: 'h-5 w-9',
  lg: 'h-6 w-11',
} as const

const thumbSizes = {
  xs: 'size-2.5 data-[state=checked]:translate-x-2.5 rtl:data-[state=checked]:-translate-x-2.5',
  sm: 'size-3 data-[state=checked]:translate-x-3 rtl:data-[state=checked]:-translate-x-3',
  md: 'size-4 data-[state=checked]:translate-x-4 rtl:data-[state=checked]:-translate-x-4',
  lg: 'size-5 data-[state=checked]:translate-x-5 rtl:data-[state=checked]:-translate-x-5',
} as const

export interface SwitchProps extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  /** @default 'md' (`sm` inside a compact `DensityProvider`) */
  size?: keyof typeof trackSizes
  label?: React.ReactNode
  description?: React.ReactNode
  wrapperClassName?: string
}

export function Switch(props: SwitchProps) {
  const {
    className,
    size: sizeProp,
    label,
    description,
    wrapperClassName,
    id,
    ...rest
  } = useFormControlProps(props)
  const size = useDefaultSize(sizeProp, { comfortable: 'md', compact: 'sm' })
  const generatedId = React.useId()
  const controlId = id ?? (label || description ? generatedId : undefined)
  const descriptionId = description ? `${controlId}-description` : undefined

  const control = (
    <SwitchPrimitive.Root
      data-slot="switch"
      id={controlId}
      className={cn(
        'peer inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 shadow-xs',
        'transition-colors duration-200 outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-ring/40',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        'aria-invalid:ring-2 aria-invalid:ring-destructive/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        trackSizes[size],
        className,
      )}
      {...rest}
      aria-describedby={joinIds(rest['aria-describedby'], descriptionId)}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block rounded-full bg-background shadow-sm ring-0',
          'transition-transform duration-200 ease-out-soft data-[state=unchecked]:translate-x-0',
          'dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground',
          thumbSizes[size],
        )}
      />
    </SwitchPrimitive.Root>
  )

  if (!label && !description) return control

  return (
    <ChoiceLabel
      control={control}
      controlId={controlId}
      label={label}
      description={description}
      descriptionId={descriptionId}
      disabled={rest.disabled}
      className={wrapperClassName}
    />
  )
}
