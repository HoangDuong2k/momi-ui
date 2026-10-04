import type * as React from 'react'
import { cn } from '../../lib/cn'
import { Label } from '../label'

interface ChoiceLabelProps {
  control: React.ReactNode
  controlId?: string
  label?: React.ReactNode
  description?: React.ReactNode
  descriptionId?: string
  disabled?: boolean
  className?: string
}

/** Lays out a checkbox / radio / switch next to its label and description. */
export function ChoiceLabel({
  control,
  controlId,
  label,
  description,
  descriptionId,
  disabled,
  className,
}: ChoiceLabelProps) {
  return (
    <div
      data-slot="choice"
      data-disabled={disabled || undefined}
      className={cn('flex items-start gap-2.5', className)}
    >
      <div className="flex h-5 items-center">{control}</div>
      <div className={cn('grid gap-1', disabled && 'opacity-50')}>
        {label && (
          <Label htmlFor={controlId} className={cn('leading-5', disabled && 'cursor-not-allowed')}>
            {label}
          </Label>
        )}
        {description && (
          <p id={descriptionId} className="text-[0.8125rem] leading-snug text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
