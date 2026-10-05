import * as React from 'react'
import { useLocale, useMessages } from '../i18n/locale-provider'
import type { MomiMessages } from '../i18n/messages'
import { cn } from '../lib/cn'
import { mergeRefs } from '../lib/merge-refs'
import { useControllableState } from '../lib/use-controllable-state'
import { useEscapeGuard } from '../lib/use-escape-guard'
import { dragStepFactor, usePointerDrag } from '../lib/use-pointer-drag'
import { useDefaultSize } from './density-provider'
import { useFormControlProps } from './form-field'
import { controlSizeDefaults, inputVariants, type InputSize } from './input'

/**
 * Read a typed number, accepting a decimal comma or dot ("0,5" and "0.5"), a Unicode minus and
 * thousands separators when both marks appear ("1.234,5", "1,234.5"). Returns `null` if invalid.
 */
export function parseDecimal(text: string): number | null {
  let s = text
    .trim()
    .replace(/[\s\u00a0\u202f']/g, '')
    .replace(/\u2212/g, '-')
    // A trailing unit the user typed along ("50%", "12px").
    .replace(/[^\d.,]+$/, '')
  if (!s) return null
  const comma = s.lastIndexOf(',')
  const dot = s.lastIndexOf('.')
  if (comma >= 0 && dot >= 0) s = s.split(comma > dot ? '.' : ',').join('')
  s = s.replace(',', '.')
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return null
  return Number(s)
}

const roundTo = (n: number, decimals: number) => {
  const factor = 10 ** decimals
  return Math.round(n * factor) / factor
}

const decimalsOf = (n: number) => {
  const text = String(roundTo(Math.abs(n), 10))
  return text.includes('.') ? text.split('.')[1].length : 0
}

const identity = (n: number) => n

const startPadding: Record<InputSize, string> = { xs: 'ps-2', sm: 'ps-2.5', md: 'ps-3', lg: 'ps-4' }
const endPadding: Record<InputSize, string> = { xs: 'pe-2', sm: 'pe-2.5', md: 'pe-3', lg: 'pe-4' }

export interface NumberFieldProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'min' | 'max' | 'step' | 'prefix'
> {
  value?: number
  /** @default 0 (or `min`) */
  defaultValue?: number
  /** Every change, including each step of a drag. */
  onValueChange?: (value: number) => void
  /** Once per finished change: drag released, Enter, blur, arrow key, reset. */
  onValueCommit?: (value: number) => void
  min?: number
  max?: number
  /** Step for arrow keys and dragging, in stored units. Shift ×10, Alt ×0.1. @default 1 */
  step?: number
  /** Decimals shown and kept, in displayed units. Defaults to the step's decimals + 1. */
  precision?: number
  /** Suffix such as "%", "px" or "s". */
  unit?: React.ReactNode
  /** Drag handle before the number, e.g. "X" or an icon. The field itself is also draggable. */
  label?: React.ReactNode
  /** Value restored by double-clicking the label. */
  resetValue?: number
  /** Number shown for a stored value, e.g. `(v) => v * 100` to show 0..1 as a percentage. */
  format?: (value: number) => number
  /** Inverse of `format`: the stored value for a shown number, e.g. `(n) => n / 100`. */
  parse?: (display: number) => number
  /** Horizontal pixels per step when dragging. @default 2 */
  pixelsPerStep?: number
  /** @default 'md' (`xs` inside a compact `DensityProvider`) */
  size?: InputSize
  /** Override built-in text for this instance. */
  labels?: Partial<MomiMessages['numberField']>
  /** Class for the field box (the input itself gets `className`). */
  wrapperClassName?: string
}

/**
 * Number input you can drag horizontally — on its label or on the field — like the value fields of
 * video and design tools. Arrow keys step, Enter commits, Esc restores.
 */
export function NumberField(props: NumberFieldProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    min,
    max,
    step = 1,
    precision: precisionProp,
    unit,
    label,
    resetValue,
    format = identity,
    parse = identity,
    pixelsPerStep = 2,
    size: sizeProp,
    labels,
    wrapperClassName,
    className,
    disabled,
    readOnly,
    ref,
    onKeyDown,
    onBlur,
    onFocus,
    ...inputProps
  } = useFormControlProps(props)
  const t = useMessages('numberField', labels)
  const { locale } = useLocale()
  const size = useDefaultSize<InputSize>(sizeProp, controlSizeDefaults)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const clamp = (n: number) =>
    Math.min(max ?? Infinity, Math.max(min ?? -Infinity, Number.isFinite(n) ? n : 0))
  const precision = precisionProp ?? Math.min(10, decimalsOf(format(step) - format(0)) + 1)
  /** Round through the displayed number so stored values match what the user sees. */
  const normalize = (n: number) => clamp(parse(roundTo(format(clamp(n)), precision)))

  const [current, setCurrent] = useControllableState<number>({
    value,
    defaultValue: normalize(defaultValue ?? min ?? 0),
    onChange: onValueChange,
  })
  const [draft, setDraft] = React.useState<string | null>(null)
  const isGuardedEscape = useEscapeGuard(draft !== null)

  const displayNumber = roundTo(format(current), precision)
  const formatter = React.useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: precision, useGrouping: false }),
    [locale, precision],
  )
  const displayText = formatter.format(displayNumber)
  const canEdit = !disabled && !readOnly

  function set(next: number, commit: boolean) {
    const normalized = normalize(next)
    if (normalized !== current) setCurrent(normalized)
    if (commit) onValueCommit?.(normalized)
    return normalized
  }

  /** Commit the typed text; returns the value now in effect. */
  function commitDraft(): number {
    if (draft === null) return current
    setDraft(null)
    const typed = parseDecimal(draft)
    if (typed === null) return current
    const next = normalize(parse(typed))
    return next !== current ? set(next, true) : current
  }

  /* Dragging --------------------------------------------------------------------------------- */
  const dragRef = React.useRef<{ start: number; offset: number; last: number } | null>(null)

  const dragOptions = {
    threshold: 3,
    disabled: !canEdit,
    onStart: () => {
      const start = commitDraft()
      dragRef.current = { start, offset: 0, last: start }
    },
    onMove: (info: { deltaX: number; shiftKey: boolean; altKey: boolean }) => {
      const drag = dragRef.current
      if (!drag) return
      drag.offset += (info.deltaX / pixelsPerStep) * step * dragStepFactor(info)
      drag.last = set(drag.start + drag.offset, false)
    },
    onEnd: (_: unknown, cancelled: boolean) => {
      const drag = dragRef.current
      dragRef.current = null
      if (!drag) return
      if (cancelled) set(drag.start, false)
      else if (drag.last !== drag.start) onValueCommit?.(drag.last)
    },
  }
  const labelDrag = usePointerDrag({
    ...dragOptions,
    onClick: () => {
      inputRef.current?.focus()
      inputRef.current?.select()
    },
  })
  const fieldDrag = usePointerDrag({
    ...dragOptions,
    onClick: () => {
      inputRef.current?.focus()
      inputRef.current?.select()
    },
  })
  const dragging = labelDrag.dragging || fieldDrag.dragging

  // Mouse/pen drags on the unfocused field scrub; a plain click focuses it. Touch scrolls instead.
  const isFocused = () =>
    typeof document !== 'undefined' && document.activeElement === inputRef.current
  const lastPointerType = React.useRef<string>('mouse')
  function onFieldPointerDown(event: React.PointerEvent<HTMLInputElement>) {
    lastPointerType.current = event.pointerType
    if (event.pointerType === 'touch' || isFocused() || !canEdit) return
    fieldDrag.onPointerDown(event)
  }

  function reset() {
    if (resetValue === undefined || !canEdit) return
    setDraft(null)
    set(resetValue, true)
  }

  /* Keyboard --------------------------------------------------------------------------------- */
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event)
    if (event.nativeEvent.isComposing) return
    if (event.defaultPrevented && !isGuardedEscape(event.nativeEvent)) return
    if (event.key === 'Enter') {
      commitDraft()
      return
    }
    if (event.key === 'Escape') {
      if (draft !== null) {
        event.preventDefault()
        event.stopPropagation()
        setDraft(null)
      }
      return
    }
    if (!canEdit) return
    const factor = dragStepFactor(event)
    const base = draft !== null ? normalize(parse(parseDecimal(draft) ?? format(current))) : current
    let next: number | null = null
    if (event.key === 'ArrowUp') next = base + step * factor
    else if (event.key === 'ArrowDown') next = base - step * factor
    else if (event.key === 'PageUp') next = base + step * 10
    else if (event.key === 'PageDown') next = base - step * 10
    else if (event.key === 'Home' && min !== undefined) next = min
    else if (event.key === 'End' && max !== undefined) next = max
    if (next === null) return
    event.preventDefault()
    setDraft(null)
    set(next, true)
  }

  const hint = resetValue !== undefined ? `${t.dragHint}, ${t.resetHint}` : t.dragHint
  const unitText = typeof unit === 'string' ? ` ${unit}` : ''

  return (
    <div
      data-slot="number-field"
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        inputVariants({ size }),
        'items-center overflow-hidden px-0',
        size === 'xs' ? 'gap-1' : size === 'sm' ? 'gap-1.5' : 'gap-2',
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30',
        'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50 has-[input[aria-invalid=true]]:border-destructive',
        dragging && 'border-ring select-none',
        wrapperClassName,
      )}
    >
      {label != null && (
        <span
          aria-hidden
          data-slot="number-field-label"
          title={canEdit ? hint : undefined}
          onPointerDown={labelDrag.onPointerDown}
          onDoubleClick={reset}
          className={cn(
            'flex h-full shrink-0 items-center self-stretch text-muted-foreground select-none',
            "[&_svg:not([class*='size-'])]:size-3.5",
            size === 'xs' ? 'ps-2 text-[11px]' : 'ps-2.5 text-xs',
            canEdit && 'cursor-ew-resize touch-none hover:text-foreground',
            dragging && 'text-foreground',
          )}
        >
          {label}
        </span>
      )}
      <input
        {...inputProps}
        ref={mergeRefs(ref, inputRef)}
        type="text"
        inputMode="decimal"
        role="spinbutton"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        data-slot="number-field-input"
        aria-label={
          inputProps['aria-label'] ??
          (typeof label === 'string' && !inputProps['aria-labelledby'] ? label : undefined)
        }
        aria-valuenow={displayNumber}
        aria-valuemin={min !== undefined ? roundTo(format(min), precision) : undefined}
        aria-valuemax={max !== undefined ? roundTo(format(max), precision) : undefined}
        aria-valuetext={`${displayText}${unitText}`}
        disabled={disabled}
        readOnly={readOnly}
        value={draft ?? displayText}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={(e) => {
          commitDraft()
          onBlur?.(e)
        }}
        onPointerDown={onFieldPointerDown}
        onMouseDown={(e) => {
          // Keep the caret out until the press turns out to be a click (handled on release).
          // Touch taps focus normally — they never scrub.
          if (!isFocused() && canEdit && lastPointerType.current !== 'touch') e.preventDefault()
        }}
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent tabular-nums outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed',
          canEdit && 'cursor-ew-resize focus:cursor-text',
          label == null && startPadding[size],
          unit == null && endPadding[size],
          className,
        )}
      />
      {unit != null && (
        <span
          data-slot="number-field-unit"
          onMouseDown={(e) => {
            e.preventDefault()
            inputRef.current?.focus()
          }}
          className={cn(
            'shrink-0 text-muted-foreground select-none',
            size === 'xs' ? 'pe-2 text-[11px]' : 'pe-2.5 text-xs',
          )}
        >
          {unit}
        </span>
      )}
    </div>
  )
}
