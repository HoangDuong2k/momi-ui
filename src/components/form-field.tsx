import * as React from 'react'
import { cn } from '../lib/cn'
import { joinIds } from '../lib/ids'
import { Label } from './label'

interface FormFieldContextValue {
  id: string
  labelId?: string
  descriptionId?: string
  errorId?: string
  invalid: boolean
  required: boolean
  disabled: boolean
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

/** Read the surrounding `<FormField>` state (ids, invalid, required, disabled), if any. */
export function useFormField() {
  return React.useContext(FormFieldContext)
}

interface FormControlProps {
  id?: string
  disabled?: boolean
  required?: boolean
  'aria-describedby'?: string
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
}

/**
 * Merge a control's props with its `<FormField>`: id, aria-describedby, aria-invalid, required, disabled.
 * Props passed explicitly to the control always win.
 */
export function useFormControlProps<P extends FormControlProps>(props: P): P {
  const field = React.useContext(FormFieldContext)
  if (!field) return props
  return {
    ...props,
    id: props.id ?? field.id,
    disabled: props.disabled ?? (field.disabled || undefined),
    required: props.required ?? (field.required || undefined),
    'aria-describedby': joinIds(props['aria-describedby'], field.descriptionId, field.errorId),
    'aria-invalid': props['aria-invalid'] ?? (field.invalid || undefined),
  }
}

export interface FormFieldProps extends Omit<React.ComponentProps<'div'>, 'id'> {
  label?: React.ReactNode
  /** Helper text shown under the control. */
  description?: React.ReactNode
  /** Error message. When set, the field is marked invalid. */
  error?: React.ReactNode
  /** Force the invalid state without a message. */
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  /** Id given to the control. Defaults to the child's own `id`, else a generated one. */
  controlId?: string
}

/**
 * Wraps a form control with a label, description and error message,
 * wiring up ids and ARIA attributes automatically.
 */
export function FormField({
  label,
  description,
  error,
  invalid,
  required = false,
  disabled = false,
  controlId,
  className,
  children,
  ...props
}: FormFieldProps) {
  const generatedId = React.useId()
  // An explicit id on the (single) child control is reused so the label still points at it.
  const childId = React.isValidElement<{ id?: string }>(children) ? children.props.id : undefined
  const id = controlId ?? childId ?? `momi-field${generatedId.replace(/:/g, '')}`
  const isInvalid = invalid ?? Boolean(error)
  const hasError = isInvalid && Boolean(error)

  const context = React.useMemo<FormFieldContextValue>(
    () => ({
      id,
      labelId: label ? `${id}-label` : undefined,
      descriptionId: description ? `${id}-description` : undefined,
      errorId: hasError ? `${id}-error` : undefined,
      invalid: isInvalid,
      required,
      disabled,
    }),
    [id, label, description, hasError, isInvalid, required, disabled],
  )

  return (
    <FormFieldContext value={context}>
      <div
        data-slot="form-field"
        data-invalid={isInvalid || undefined}
        data-disabled={disabled || undefined}
        className={cn('grid gap-2', className)}
        {...props}
      >
        {label && (
          <Label
            id={context.labelId}
            htmlFor={id}
            required={required}
            className={cn(disabled && 'opacity-50')}
          >
            {label}
          </Label>
        )}
        {children}
        {description && (
          <p id={context.descriptionId} className="text-[0.8125rem] text-muted-foreground">
            {description}
          </p>
        )}
        {hasError && (
          <p id={context.errorId} className="text-[0.8125rem] font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    </FormFieldContext>
  )
}
