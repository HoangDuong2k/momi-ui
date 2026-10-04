import { Slider as SliderPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../lib/cn'
import { useFormField } from './form-field'

const sizes = {
  sm: {
    track: 'data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1',
    thumb: 'size-3.5',
  },
  md: {
    track: 'data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1.5',
    thumb: 'size-4.5',
  },
} as const

export interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  /** @default 'md' */
  size?: keyof typeof sizes
  /** Show the value above each thumb while dragging/focused (`'always'` keeps it visible). */
  showValue?: boolean | 'always'
  /** Format the shown value. */
  formatValue?: (value: number) => React.ReactNode
  /** Tick marks under the track. */
  marks?: { value: number; label?: React.ReactNode }[]
  /** Accessible names per thumb, e.g. `['Minimum', 'Maximum']`. */
  thumbLabels?: string[]
}

/** Pick a number or a range by dragging. Pass two values for a range. */
export function Slider({
  size = 'md',
  showValue = false,
  formatValue = (v) => v,
  marks,
  thumbLabels,
  min = 0,
  max = 100,
  value,
  defaultValue,
  onValueChange,
  disabled,
  'aria-labelledby': ariaLabelledBy,
  className,
  ...props
}: SliderProps) {
  const field = useFormField()
  // Track the uncontrolled value so we know how many thumbs to render.
  const [internal, setInternal] = React.useState(defaultValue ?? value ?? [min])
  const values = value ?? internal

  return (
    <div data-slot="slider-wrapper" className={cn('relative w-full', marks && 'pb-6')}>
      <SliderPrimitive.Root
        data-slot="slider"
        min={min}
        max={max}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(v) => {
          setInternal(v)
          onValueChange?.(v)
        }}
        aria-labelledby={ariaLabelledBy ?? field?.labelId}
        disabled={disabled ?? field?.disabled}
        className={cn(
          'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50',
          'data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            'relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full',
            sizes[size].track,
          )}
        >
          <SliderPrimitive.Range className="absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" />
        </SliderPrimitive.Track>
        {values.map((v, i) => (
          <SliderPrimitive.Thumb
            key={i}
            aria-label={thumbLabels?.[i]}
            className={cn(
              'group/thumb relative block shrink-0 rounded-full border-2 border-primary bg-background shadow-sm',
              'transition-[box-shadow,transform] outline-none hover:scale-110 focus-visible:ring-[4px] focus-visible:ring-ring/30 active:scale-110',
              'data-[disabled]:pointer-events-none',
              sizes[size].thumb,
            )}
          >
            {showValue && (
              <span
                className={cn(
                  'pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-background tabular-nums shadow-sm transition-opacity',
                  showValue === 'always'
                    ? 'opacity-100'
                    : 'opacity-0 group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100 group-active/thumb:opacity-100',
                )}
              >
                {formatValue(v)}
              </span>
            )}
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
      {marks && (
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-5">
          {marks.map((mark) => {
            const pct = ((mark.value - min) / (max - min)) * 100
            return (
              <span
                key={mark.value}
                className="absolute top-0 -translate-x-1/2 text-xs text-muted-foreground tabular-nums"
                style={{ left: `${pct}%` }}
              >
                {mark.label ?? mark.value}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
