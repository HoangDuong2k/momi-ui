import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../lib/cn'
import { useFormControlProps, useFormField } from './form-field'
import { ChoiceLabel } from './internal/choice-label'

export interface RadioGroupProps extends React.ComponentProps<typeof RadioGroupPrimitive.Root> {
  /** Use a grid of `card` items in columns. */
  columns?: 1 | 2 | 3 | 4
}

const columnClasses = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const

export function RadioGroup(props: RadioGroupProps) {
  const field = useFormField()
  const { className, orientation = 'vertical', columns = 1, ...rest } = useFormControlProps(props)
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      orientation={orientation}
      aria-labelledby={rest['aria-labelledby'] ?? field?.labelId}
      className={cn(
        orientation === 'horizontal' ? 'flex flex-wrap gap-x-6 gap-y-3' : 'grid gap-3',
        orientation === 'vertical' && columnClasses[columns],
        className,
      )}
      {...rest}
    />
  )
}

export interface RadioGroupItemProps extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {
  label?: React.ReactNode
  description?: React.ReactNode
  /** `card` renders a bordered, fully clickable option. @default 'default' */
  variant?: 'default' | 'card'
  /** Extra content shown at the end of a `card` item (price, icon, …). */
  aside?: React.ReactNode
  wrapperClassName?: string
}

export function RadioGroupItem({
  className,
  label,
  description,
  variant = 'default',
  aside,
  wrapperClassName,
  id,
  ...props
}: RadioGroupItemProps) {
  const generatedId = React.useId()
  const controlId = id ?? (label || description ? generatedId : undefined)
  const descriptionId = description ? `${controlId}-description` : undefined

  const control = (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      id={controlId}
      aria-describedby={descriptionId}
      className={cn(
        'peer inline-flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border border-input bg-surface-sunken text-primary shadow-xs',
        'transition-[border-color,box-shadow] duration-150 outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-ring/40',
        'aria-invalid:border-destructive data-[state=checked]:border-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-current" />
    </RadioGroupPrimitive.Item>
  )

  if (variant === 'card') {
    return (
      <label
        data-slot="radio-card"
        className={cn(
          'relative flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-4 shadow-xs',
          'transition-[border-color,box-shadow,background-color] duration-150 hover:bg-accent/40',
          'has-data-[state=checked]:border-primary has-data-[state=checked]:ring-1 has-data-[state=checked]:ring-primary',
          'has-focus-visible:ring-[3px] has-focus-visible:ring-ring/40',
          'has-disabled:cursor-not-allowed has-disabled:opacity-50',
          wrapperClassName,
        )}
      >
        <span className="flex h-5 items-center">{control}</span>
        <span className="grid flex-1 gap-1">
          {label && <span className="text-sm leading-5 font-medium">{label}</span>}
          {description && (
            <span
              id={descriptionId}
              className="text-[0.8125rem] leading-snug text-muted-foreground"
            >
              {description}
            </span>
          )}
        </span>
        {aside && <span className="shrink-0 text-sm font-medium">{aside}</span>}
      </label>
    )
  }

  if (!label && !description) return control

  return (
    <ChoiceLabel
      control={control}
      controlId={controlId}
      label={label}
      description={description}
      descriptionId={descriptionId}
      disabled={props.disabled}
      className={wrapperClassName}
    />
  )
}
