import * as React from 'react'

interface UseControllableStateParams<T> {
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}

/** State that can be controlled (`value` + `onChange`) or uncontrolled (`defaultValue`). */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>) {
  const [internal, setInternal] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? value : internal

  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )

  return [current, setValue] as const
}
