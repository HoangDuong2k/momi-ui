import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../lib/cn'
import { joinIds } from '../lib/ids'
import { CheckIcon, MinusIcon } from '../lib/icons'
import { useFormControlProps } from './form-field'
import { ChoiceLabel } from './internal/choice-label'

const checkboxSizes = {
  sm: 'size-3.5 rounded-[4px] [&_svg]:size-2.5',
  md: 'size-4 rounded-[5px] [&_svg]:size-3',
  lg: 'size-5 rounded-[6px] [&_svg]:size-3.5',
} as const

export interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  /** @default 'md' */
  size?: keyof typeof checkboxSizes
  label?: React.ReactNode
  description?: React.ReactNode
  /** Class for the wrapper rendered when `label`/`description` is set. */
  wrapperClassName?: string
}

export function Checkbox(props: CheckboxProps) {
  const {
    className,
    size = 'md',
    label,
    description,
    wrapperClassName,
    id,
    ...rest
  } = useFormControlProps(props)
  const generatedId = React.useId()
  const controlId = id ?? (label || description ? generatedId : undefined)
  const descriptionId = description ? `${controlId}-description` : undefined

  const control = (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      id={controlId}
      className={cn(
        'peer inline-flex shrink-0 items-center justify-center border border-input bg-background text-primary-foreground shadow-xs',
        'transition-[background-color,border-color,box-shadow] duration-150 outline-none dark:bg-input/30',
        'focus-visible:ring-[3px] focus-visible:ring-ring/40',
        'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checkboxSizes[size],
        className,
      )}
      {...rest}
      aria-describedby={joinIds(rest['aria-describedby'], descriptionId)}
    >
      <CheckboxPrimitive.Indicator className="group/indicator flex items-center justify-center text-current">
        <CheckIcon className="hidden group-data-[state=checked]/indicator:block" />
        <MinusIcon className="hidden group-data-[state=indeterminate]/indicator:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
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
