import type * as React from 'react'
import { cn } from '../lib/cn'
import { ChevronDownIcon } from '../lib/icons'
import { useFormControlProps } from './form-field'
import { inputVariants, type InputSize } from './input'

export interface NativeSelectProps extends Omit<React.ComponentProps<'select'>, 'size'> {
  /** @default 'md' */
  size?: InputSize
  /** Adds an empty, non-selectable first option. */
  placeholder?: string
  wrapperClassName?: string
}

/** Styled native `<select>` — best for simple lists and mobile. */
export function NativeSelect(props: NativeSelectProps) {
  const {
    className,
    size = 'md',
    placeholder,
    wrapperClassName,
    children,
    value,
    defaultValue,
    multiple,
    ...rest
  } = useFormControlProps(props)

  // Start on the placeholder when the select is uncontrolled.
  const initialValue =
    value === undefined && defaultValue === undefined && placeholder && !multiple
      ? ''
      : defaultValue

  return (
    <div data-slot="native-select-wrapper" className={cn('relative w-full', wrapperClassName)}>
      <select
        data-slot="native-select"
        value={value}
        defaultValue={initialValue}
        multiple={multiple}
        className={cn(
          inputVariants({ size }),
          'cursor-pointer appearance-none pe-9',
          "[&_option]:text-foreground [&:has(option[value='']:checked)]:text-muted-foreground",
          multiple && 'h-auto py-2 pe-3',
          className,
        )}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      {!multiple && (
        <ChevronDownIcon className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      )}
    </div>
  )
}
