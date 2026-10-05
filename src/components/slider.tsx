import { Direction, Slider as SliderPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../lib/cn'
import { useDefaultSize } from './density-provider'
import { useFormField } from './form-field'

const sizes = {
  xs: {
    track: 'data-[orientation=horizontal]:h-[3px] data-[orientation=vertical]:w-[3px]',
    thumb: 'size-3 border-[1.5px]',
  },
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
  /** @default 'md' (`xs` inside a compact `DensityProvider`) */
  size?: keyof typeof sizes
  /** Show the value above each thumb while dragging/focused (`'always'` keeps it visible). */
  showValue?: boolean | 'always'
  /** Format the shown value. */
  formatValue?: (value: number) => React.ReactNode
  /** Tick marks under the track. */
  marks?: { value: number; label?: React.ReactNode }[]
  /** Accessible names per thumb, e.g. `['Minimum', 'Maximum']`. */
  thumbLabels?: string[]
  /** Double-click the track or a thumb to go back to this value (calls `onValueCommit` too). */
  resetValue?: number | number[]
  /**
   * Where the filled part starts (single value only). @default min — e.g. `origin={0}` on a −1…1
   * slider fills from the middle.
   */
  origin?: number
}

const pct = (v: number, min: number, max: number) =>
  max === min ? 0 : ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100

/** Pick a number or a range by dragging. Pass two values for a range. */
export function Slider({
  size: sizeProp,
  showValue = false,
  formatValue = (v) => v,
  marks,
  thumbLabels,
  resetValue,
  origin,
  min = 0,
  max = 100,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  onDoubleClick,
  orientation = 'horizontal',
  inverted = false,
  dir,
  disabled,
  'aria-labelledby': ariaLabelledBy,
  className,
  ...props
}: SliderProps) {
  const field = useFormField()
  const size = useDefaultSize(sizeProp, { comfortable: 'md', compact: 'xs' })
  // Uncontrolled value lives here, so double-click reset works in both modes.
  const [internal, setInternal] = React.useState(defaultValue ?? value ?? [min])
  const values = value ?? internal

  const change = (next: number[]) => {
    setInternal(next)
    onValueChange?.(next)
  }

  const isDisabled = disabled ?? field?.disabled
  const reset = () => {
    if (resetValue === undefined || isDisabled) return
    const next = Array.isArray(resetValue) ? resetValue : values.map(() => resetValue)
    change(next)
    onValueCommit?.(next)
  }

  // Custom fill from `origin` for single-value sliders; Radix's Range fills from `min`.
  const fromOrigin = origin !== undefined && values.length === 1
  const start = fromOrigin ? Math.min(pct(origin, min, max), pct(values[0], min, max)) : 0
  const length = fromOrigin ? Math.abs(pct(values[0], min, max) - pct(origin, min, max)) : 0
  const vertical = orientation === 'vertical'
  // Radix reads direction from `dir` / DirectionProvider (not CSS); the marks follow the same.
  const direction = Direction.useDirection(dir)
  const fillStyle: React.CSSProperties = vertical
    ? { [inverted ? 'top' : 'bottom']: `${start}%`, height: `${length}%` }
    : { [inverted ? 'insetInlineEnd' : 'insetInlineStart']: `${start}%`, width: `${length}%` }

  return (
    <div
      data-slot="slider-wrapper"
      data-orientation={orientation}
      className={cn(
        'relative',
        vertical ? 'inline-flex h-full' : 'w-full',
        marks && (vertical ? 'pe-9' : 'pb-6'),
      )}
    >
      <SliderPrimitive.Root
        data-slot="slider"
        min={min}
        max={max}
        value={values}
        onValueChange={change}
        onValueCommit={onValueCommit}
        onDoubleClick={(e) => {
          onDoubleClick?.(e)
          if (!e.defaultPrevented) reset()
        }}
        orientation={orientation}
        inverted={inverted}
        dir={dir}
        data-origin={fromOrigin || undefined}
        aria-labelledby={ariaLabelledBy ?? field?.labelId}
        disabled={isDisabled}
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
          <SliderPrimitive.Range
            className={cn(
              'absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
              fromOrigin && 'hidden',
            )}
          />
          {fromOrigin && (
            <span
              data-slot="slider-fill"
              className={cn('absolute bg-primary', vertical ? 'w-full' : 'h-full')}
              style={fillStyle}
            />
          )}
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
        <div
          aria-hidden
          dir={direction}
          data-slot="slider-marks"
          className={vertical ? 'absolute inset-y-0 end-0 w-9' : 'absolute inset-x-0 bottom-0 h-5'}
        >
          {marks.map((mark) => {
            const at = `${pct(mark.value, min, max)}%`
            // Same side as the minimum: bottom (vertical) or inline start, swapped by `inverted`.
            const style: React.CSSProperties = vertical
              ? { [inverted ? 'top' : 'bottom']: at }
              : { [inverted ? 'insetInlineEnd' : 'insetInlineStart']: at }
            return (
              <span
                key={mark.value}
                data-slot="slider-mark"
                className={cn(
                  'absolute text-xs whitespace-nowrap text-muted-foreground tabular-nums',
                  vertical
                    ? cn('start-2', inverted ? '-translate-y-1/2' : 'translate-y-1/2')
                    : cn(
                        'top-0',
                        inverted
                          ? 'translate-x-1/2 rtl:-translate-x-1/2'
                          : '-translate-x-1/2 rtl:translate-x-1/2',
                      ),
                )}
                style={style}
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
