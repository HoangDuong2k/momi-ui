import { Popover as PopoverPrimitive } from 'radix-ui'
import * as React from 'react'
import { useMessages } from '../i18n/locale-provider'
import type { MomiMessages } from '../i18n/messages'
import { cn } from '../lib/cn'
import {
  formatColor,
  hsvaToRgba,
  parseColor,
  rgbaToHsva,
  toHex,
  type Hsva,
  type Rgba,
} from '../lib/color'
import { useControllableState } from '../lib/use-controllable-state'
import { useEscapeGuard } from '../lib/use-escape-guard'
import { usePointerDrag } from '../lib/use-pointer-drag'
import { useDefaultSize } from './density-provider'
import { useOverlayPlacement, type OverlayPlacementProps } from './portal-provider'
import { useFormControlProps } from './form-field'
import { controlSizeDefaults, Input, inputVariants, type InputSize } from './input'
import { popAnimationClass, surfaceClass } from './internal/overlay-styles'

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

const CHECKERBOARD = 'repeating-conic-gradient(#d4d4d8 0% 25%, #fafafa 0% 50%)'
const HUE_GRADIENT =
  'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'

/** Parse a CSS color, keeping the previous hue for grays (where hue is undefined). */
function toHsva(color: string, previous?: Hsva): Hsva {
  const rgba = parseColor(color) ?? { r: 0, g: 0, b: 0, a: 1 }
  const next = rgbaToHsva(rgba)
  if (previous && (next.s === 0 || next.v === 0)) {
    return { ...next, h: previous.h, s: next.v === 0 ? previous.s : next.s }
  }
  return next
}

const rgbCss = ({ r, g, b }: Rgba) => `rgb(${r} ${g} ${b})`

function PipetteIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="m2 22 1-1h3l9-9" />
      <path d="M3 21v-3l9-9" />
      <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
    </svg>
  )
}

interface EyeDropperConstructor {
  new (): { open: () => Promise<{ sRGBHex: string }> }
}

const noopSubscribe = () => () => {}
const hasEyeDropper = () => 'EyeDropper' in window

/** A swatch of `color` over a checkerboard, so transparency is visible. */
function Swatch({ color, className }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('relative block overflow-hidden', className)}
      style={{ backgroundImage: CHECKERBOARD, backgroundSize: '8px 8px' }}
    >
      <span className="absolute inset-0" style={{ background: color }} />
    </span>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Sliders (hue, alpha) and the saturation/brightness area
 * -----------------------------------------------------------------------------------------------*/

const thumbClass =
  'pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.25),0_1px_3px_rgb(0_0_0/0.35)]'

interface ColorSliderProps {
  label: string
  value: number
  max: number
  valueText: string
  background: React.CSSProperties
  thumbColor: string
  onChange: (value: number, commit: boolean) => void
  onDragEnd: (cancelled: boolean) => void
  /** Small step and Shift step for the arrow keys. */
  steps: [number, number]
}

function ColorSlider({
  label,
  value,
  max,
  valueText,
  background,
  thumbColor,
  onChange,
  onDragEnd,
  steps,
}: ColorSliderProps) {
  const at = (clientX: number, rect: DOMRect) => clamp01((clientX - rect.left) / rect.width) * max
  const drag = usePointerDrag({
    onStart: (info) => onChange(at(info.clientX, info.rect), false),
    onMove: (info) => onChange(at(info.clientX, info.rect), false),
    onEnd: (_, cancelled) => onDragEnd(cancelled),
  })

  function onKeyDown(event: React.KeyboardEvent) {
    const step = event.shiftKey ? steps[1] : steps[0]
    const next: Record<string, number> = {
      ArrowLeft: value - step,
      ArrowDown: value - step,
      ArrowRight: value + step,
      ArrowUp: value + step,
      PageDown: value - steps[1],
      PageUp: value + steps[1],
      Home: 0,
      End: max,
    }
    if (!(event.key in next)) return
    event.preventDefault()
    onChange(Math.min(max, Math.max(0, next[event.key])), true)
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-valuetext={valueText}
      aria-orientation="horizontal"
      data-dragging={drag.dragging || undefined}
      onPointerDown={drag.onPointerDown}
      onKeyDown={onKeyDown}
      className="relative h-3 cursor-pointer touch-none rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      style={background}
    >
      <span className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]" />
      <span
        className={thumbClass}
        style={{ left: `${(value / max) * 100}%`, top: '50%', background: thumbColor }}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * ColorPickerPanel
 * -----------------------------------------------------------------------------------------------*/

export interface ColorPickerPanelProps extends Omit<
  React.ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'dir'
> {
  /** CSS color: `#rgb`, `#rrggbb`, `rgb()` or `rgba()`. */
  value?: string
  /** @default '#000000' */
  defaultValue?: string
  /** Every change, including each step of a drag. Emits `#rrggbb`, or `rgba(r,g,b,a)` below full opacity. */
  onValueChange?: (value: string) => void
  /** Once per finished change: pointer released, key pressed, value typed, swatch or eyedropper picked. */
  onValueCommit?: (value: string) => void
  /** Show the opacity slider. */
  alpha?: boolean
  /** Suggested colors under the editor. */
  swatches?: string[]
  /** Override built-in text for this instance. */
  labels?: Partial<MomiMessages['colorPicker']>
}

/** The color editor on its own — for a custom trigger or an always-open panel. */
export function ColorPickerPanel({
  value,
  defaultValue = '#000000',
  onValueChange,
  onValueCommit,
  alpha = false,
  swatches,
  labels,
  className,
  ...props
}: ColorPickerPanelProps) {
  const t = useMessages('colorPicker', labels)
  const [color, setColor] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  // Hue and saturation survive grays and black, which a CSS color string can't hold.
  const [hsva, setHsva] = React.useState(() => toHsva(color))
  const [synced, setSynced] = React.useState(color)
  if (color !== synced) {
    setSynced(color)
    setHsva((previous) => toHsva(color, previous))
  }
  const dragStart = React.useRef<{ color: string; hsva: Hsva; last: string } | null>(null)
  const eyeDropper = React.useSyncExternalStore(noopSubscribe, hasEyeDropper, () => false)

  const rgba = hsvaToRgba(hsva)
  const opaque = rgbCss(rgba)
  const current = formatColor(rgba)

  function update(next: Hsva, commit: boolean) {
    const normalized = { ...next, a: alpha ? next.a : 1 }
    const text = formatColor(hsvaToRgba(normalized))
    setHsva(normalized)
    setSynced(text)
    if (dragStart.current) dragStart.current.last = text
    if (text !== color) setColor(text)
    if (commit) onValueCommit?.(text)
  }

  function updateFrom(text: string, commit: boolean) {
    const parsed = parseColor(text)
    if (!parsed) return false
    update(toHsva(formatColor(parsed), hsva), commit)
    return true
  }

  // Drags commit once on release; Escape restores the color from before the drag.
  const beginDrag = () => {
    dragStart.current ??= { color, hsva, last: color }
  }
  const endDrag = (cancelled: boolean) => {
    const start = dragStart.current
    dragStart.current = null
    if (!start) return
    if (cancelled) {
      setHsva(start.hsva)
      setSynced(start.color)
      if (start.color !== color) setColor(start.color)
    } else if (start.last !== start.color) {
      onValueCommit?.(start.last)
    }
  }

  const areaAt = (info: { clientX: number; clientY: number; rect: DOMRect }) => {
    beginDrag()
    update(
      {
        ...hsva,
        s: clamp01((info.clientX - info.rect.left) / info.rect.width),
        v: 1 - clamp01((info.clientY - info.rect.top) / info.rect.height),
      },
      false,
    )
  }
  const areaDrag = usePointerDrag({
    onStart: areaAt,
    onMove: areaAt,
    onEnd: (_, cancelled) => endDrag(cancelled),
  })

  function onAreaKeyDown(event: React.KeyboardEvent) {
    const step = event.shiftKey ? 0.1 : 0.01
    const moves: Record<string, Partial<Hsva>> = {
      ArrowLeft: { s: clamp01(hsva.s - step) },
      ArrowRight: { s: clamp01(hsva.s + step) },
      ArrowDown: { v: clamp01(hsva.v - step) },
      ArrowUp: { v: clamp01(hsva.v + step) },
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    update({ ...hsva, ...move }, true)
  }

  const [draft, setDraft] = React.useState<string | null>(null)
  // Escape reverts a typed draft without closing the popover around the panel.
  useEscapeGuard(draft !== null)
  const commitDraft = () => {
    if (draft === null) return
    setDraft(null)
    const parsed = parseColor(draft)
    if (parsed && formatColor(alpha ? parsed : { ...parsed, a: 1 }) !== current) {
      updateFrom(draft, true)
    }
  }

  async function pickFromScreen() {
    const EyeDropper = (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper
    if (!EyeDropper) return
    try {
      const { sRGBHex } = await new EyeDropper().open()
      const picked = parseColor(sRGBHex)
      if (picked) updateFrom(formatColor({ ...picked, a: hsva.a }), true)
    } catch {
      // The user pressed Escape.
    }
  }

  return (
    <div
      data-slot="color-picker-panel"
      dir="ltr"
      className={cn('grid w-60 gap-3', className)}
      {...props}
    >
      <div
        role="slider"
        tabIndex={0}
        aria-label={t.area}
        aria-valuetext={t.areaValue(Math.round(hsva.s * 100), Math.round(hsva.v * 100))}
        aria-valuenow={Math.round(hsva.s * 100)}
        data-slot="color-picker-area"
        data-dragging={areaDrag.dragging || undefined}
        onPointerDown={areaDrag.onPointerDown}
        onKeyDown={onAreaKeyDown}
        className="relative h-40 cursor-crosshair touch-none rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${hsva.h} 100% 50%)`,
        }}
      >
        <span className="absolute inset-0 rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]" />
        <span
          className={cn(thumbClass, 'size-4')}
          style={{ left: `${hsva.s * 100}%`, top: `${(1 - hsva.v) * 100}%`, background: opaque }}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="grid flex-1 gap-2.5">
          <ColorSlider
            label={t.hue}
            value={hsva.h}
            max={360}
            valueText={`${Math.round(hsva.h)}°`}
            background={{ background: HUE_GRADIENT }}
            thumbColor={`hsl(${hsva.h} 100% 50%)`}
            steps={[1, 10]}
            onChange={(h, commit) => {
              if (!commit) beginDrag()
              update({ ...hsva, h: Math.min(h, 359.9) }, commit)
            }}
            onDragEnd={endDrag}
          />
          {alpha && (
            <ColorSlider
              label={t.alpha}
              value={hsva.a * 100}
              max={100}
              valueText={`${Math.round(hsva.a * 100)}%`}
              background={{
                backgroundImage: `linear-gradient(to right, transparent, ${opaque}), ${CHECKERBOARD}`,
                backgroundSize: '100% 100%, 8px 8px',
              }}
              thumbColor={current}
              steps={[1, 10]}
              onChange={(a, commit) => {
                if (!commit) beginDrag()
                update({ ...hsva, a: Math.round(a) / 100 }, commit)
              }}
              onDragEnd={endDrag}
            />
          )}
        </div>
        <Swatch
          color={current}
          className="size-8 shrink-0 rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
        />
      </div>

      <div className="flex items-center gap-2">
        <Input
          size="sm"
          aria-label={t.input}
          value={draft ?? current}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitDraft()
            } else if (e.key === 'Escape' && draft !== null) {
              e.preventDefault()
              e.stopPropagation()
              setDraft(null)
            }
          }}
          className="font-mono text-xs tabular-nums"
        />
        {eyeDropper && (
          <button
            type="button"
            aria-label={t.eyeDropper}
            title={t.eyeDropper}
            onClick={pickFromScreen}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-input bg-surface-sunken text-muted-foreground shadow-xs transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <PipetteIcon className="size-4" />
          </button>
        )}
      </div>

      {swatches && swatches.length > 0 && (
        <div
          role="group"
          aria-label={t.swatches}
          data-slot="color-picker-swatches"
          className="grid grid-cols-8 gap-1 border-t pt-3"
        >
          {swatches.map((swatch) => {
            const parsed = parseColor(swatch)
            const normalized = parsed ? formatColor(alpha ? parsed : { ...parsed, a: 1 }) : swatch
            return (
              <button
                key={swatch}
                type="button"
                aria-label={t.swatch(swatch)}
                aria-pressed={normalized === current}
                disabled={!parsed}
                onClick={() => updateFrom(normalized, true)}
                className="group/swatch aspect-square rounded-md p-0.5 transition-shadow outline-none hover:ring-1 hover:ring-foreground/20 focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-pressed:ring-2 aria-pressed:ring-foreground/60"
              >
                <Swatch
                  color={normalized}
                  className="size-full rounded-[4px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * ColorPicker
 * -----------------------------------------------------------------------------------------------*/

export interface ColorPickerProps
  extends Omit<ColorPickerPanelProps, 'className' | 'id'>, OverlayPlacementProps {
  /** `field`: swatch + value like an input · `swatch`: a square color button. @default 'field' */
  variant?: 'field' | 'swatch'
  /** @default 'md' (`xs` inside a compact `DensityProvider`) */
  size?: InputSize
  disabled?: boolean
  id?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Trigger class. */
  className?: string
  /** Popover panel class. */
  contentClassName?: string
  'aria-label'?: string
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
  'aria-describedby'?: string
  required?: boolean
}

const swatchButtonSizes: Record<InputSize, string> = {
  xs: 'size-6 rounded-sm p-0.5',
  sm: 'size-8 rounded-md p-1',
  md: 'size-9 rounded-md p-1',
  lg: 'size-11 rounded-lg p-1.5',
}

const fieldSwatchSizes: Record<InputSize, string> = {
  xs: 'size-3.5 rounded-[3px]',
  sm: 'size-4 rounded-[4px]',
  md: 'size-5 rounded-[5px]',
  lg: 'size-6 rounded-md',
}

/** A color button that opens the color editor in a popover. */
export function ColorPicker(props: ColorPickerProps) {
  const {
    variant = 'field',
    size: sizeProp,
    disabled,
    id,
    open,
    defaultOpen,
    onOpenChange,
    className,
    contentClassName,
    value,
    defaultValue = '#000000',
    onValueChange,
    onValueCommit,
    alpha,
    swatches,
    labels,
    'aria-label': ariaLabel,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    required,
    container,
    collisionBoundary,
    collisionPadding,
    ...panelProps
  } = useFormControlProps(props)
  const placement = useOverlayPlacement({ container, collisionBoundary, collisionPadding })
  const t = useMessages('colorPicker', labels)
  const size = useDefaultSize<InputSize>(sizeProp, controlSizeDefaults)
  const [color, setColor] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const parsed = parseColor(color) ?? { r: 0, g: 0, b: 0, a: 1 }
  const shown = formatColor(parsed)

  const triggerProps = {
    id,
    disabled,
    'aria-label': ariaLabel ?? (variant === 'swatch' ? `${t.trigger}: ${shown}` : undefined),
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    'aria-required': required || undefined,
  }

  return (
    <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        {variant === 'swatch' ? (
          <button
            type="button"
            data-slot="color-picker-trigger"
            data-variant="swatch"
            {...triggerProps}
            className={cn(
              'inline-flex shrink-0 items-center justify-center border border-input bg-surface-sunken shadow-xs transition-[border-color,box-shadow] outline-none',
              'hover:border-foreground/20 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30',
              'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive',
              swatchButtonSizes[size],
              className,
            )}
          >
            <Swatch
              color={shown}
              className="size-full rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
            />
          </button>
        ) : (
          <button
            type="button"
            data-slot="color-picker-trigger"
            data-variant="field"
            {...triggerProps}
            className={cn(
              inputVariants({ size }),
              'cursor-pointer items-center gap-2 text-start',
              size === 'xs' ? 'gap-1.5 ps-1' : size === 'sm' ? 'ps-1.5' : 'ps-2',
              className,
            )}
          >
            <Swatch
              color={shown}
              className={cn(
                'shrink-0 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]',
                fieldSwatchSizes[size],
              )}
            />
            <span className="min-w-0 flex-1 truncate font-mono text-[0.92em] tabular-nums">
              {toHex(parsed)}
            </span>
            {parsed.a < 1 && (
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {Math.round(parsed.a * 100)}%
              </span>
            )}
          </button>
        )}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={placement.container}>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          {...placement.collision}
          data-slot="color-picker-content"
          className={cn(
            surfaceClass,
            popAnimationClass,
            'max-h-(--radix-popover-content-available-height) origin-(--radix-popover-content-transform-origin) overflow-y-auto p-3',
            contentClassName,
          )}
        >
          <ColorPickerPanel
            value={color}
            onValueChange={setColor}
            onValueCommit={onValueCommit}
            alpha={alpha}
            swatches={swatches}
            labels={labels}
            {...panelProps}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
