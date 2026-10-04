import * as React from 'react'
import { cn } from '../lib/cn'
import { useControllableState } from '../lib/use-controllable-state'
import { useFormControlProps } from './form-field'

export interface InputOTPProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'defaultValue' | 'onChange' | 'size' | 'maxLength' | 'pattern'
> {
  /** Number of characters. @default 6 */
  length?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Called once every slot is filled. */
  onComplete?: (value: string) => void
  /** Allowed characters. @default /^[0-9]$/ */
  pattern?: RegExp
  /** Split the slots into groups, e.g. `[3, 3]`. */
  groups?: number[]
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** Hide the characters (PIN). */
  mask?: boolean
  containerClassName?: string
}

const slotSizes = {
  sm: 'h-9 w-8 text-base',
  md: 'h-11 w-10 text-lg',
  lg: 'h-14 w-12 text-2xl',
} as const

/**
 * One-time-code input. A single real `<input>` sits over the visual slots, so autofill
 * (`autocomplete="one-time-code"`), paste, selection and screen readers all work natively.
 */
export function InputOTP(props: InputOTPProps) {
  const {
    length = 6,
    value: valueProp,
    defaultValue = '',
    onValueChange,
    onComplete,
    pattern = /^[0-9]$/,
    groups,
    size = 'md',
    mask = false,
    disabled,
    className,
    containerClassName,
    onFocus,
    onBlur,
    onSelect,
    onKeyUp,
    ...rest
  } = useFormControlProps(props)

  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const [focused, setFocused] = React.useState(false)
  const [caret, setCaret] = React.useState(0)

  const sanitize = (raw: string) =>
    Array.from(raw)
      .filter((ch) => pattern.test(ch))
      .join('')
      .slice(0, length)

  const syncCaret = (input: HTMLInputElement) =>
    setCaret(Math.min(input.selectionStart ?? input.value.length, length - 1))

  const numeric = pattern.test('0') && !pattern.test('a')
  const slotGroups = groups && groups.reduce((a, b) => a + b, 0) === length ? groups : [length]

  let slotIndex = 0
  return (
    <div
      data-slot="input-otp"
      data-disabled={disabled || undefined}
      data-invalid={rest['aria-invalid'] ? '' : undefined}
      className={cn(
        'group/otp relative inline-flex w-fit',
        disabled && 'opacity-50',
        containerClassName,
      )}
    >
      <input
        {...rest}
        value={value}
        disabled={disabled}
        // No maxLength: pasted codes like "123-456" must be filtered before they're trimmed.
        inputMode={numeric ? 'numeric' : 'text'}
        autoComplete="one-time-code"
        spellCheck={false}
        onChange={(e) => {
          const next = sanitize(e.target.value)
          setValue(next)
          setCaret(Math.min(next.length, length - 1))
          if (next.length === length && next !== value) onComplete?.(next)
        }}
        onFocus={(e) => {
          setFocused(true)
          syncCaret(e.currentTarget)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          onBlur?.(e)
        }}
        onSelect={(e) => {
          syncCaret(e.currentTarget)
          onSelect?.(e)
        }}
        onKeyUp={(e) => {
          syncCaret(e.currentTarget)
          onKeyUp?.(e)
        }}
        className={cn(
          'absolute inset-0 z-10 h-full w-full cursor-text bg-transparent font-mono text-transparent caret-transparent outline-none selection:bg-transparent disabled:cursor-not-allowed',
          className,
        )}
      />
      <div aria-hidden className="flex items-center gap-2">
        {slotGroups.map((count, g) => (
          <React.Fragment key={g}>
            {g > 0 && <span className="h-0.5 w-3 rounded-full bg-border" />}
            <div className="flex items-center">
              {Array.from({ length: count }, () => {
                const i = slotIndex++
                const char = value[i]
                const active =
                  focused &&
                  (caret === i ||
                    (value.length === length && i === length - 1 && caret >= length - 1))
                return (
                  <div
                    key={i}
                    data-active={active || undefined}
                    data-filled={char !== undefined || undefined}
                    className={cn(
                      'relative -ms-px flex items-center justify-center border border-input bg-background font-medium tabular-nums shadow-xs transition-[border-color,box-shadow] first:ms-0 first:rounded-s-md last:rounded-e-md dark:bg-input/30',
                      'data-[active]:z-10 data-[active]:border-ring data-[active]:ring-[3px] data-[active]:ring-ring/30',
                      'group-data-[invalid]/otp:border-destructive',
                      slotSizes[size],
                    )}
                  >
                    {char !== undefined ? (mask ? '•' : char) : null}
                    {active && char === undefined && (
                      <span className="pointer-events-none absolute h-1/2 w-px animate-caret-blink bg-foreground" />
                    )}
                  </div>
                )
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
