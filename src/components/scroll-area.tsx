import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../lib/cn'

type ScrollbarSize = 'sm' | 'md'

const barThickness: Record<'vertical' | 'horizontal', Record<ScrollbarSize, string>> = {
  vertical: { sm: 'w-1.5', md: 'w-2' },
  horizontal: { sm: 'h-1.5', md: 'h-2' },
}

export interface ScrollAreaProps extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  /** Which scrollbars to render. @default 'vertical' */
  orientation?: 'vertical' | 'horizontal' | 'both'
  /** Scrollbar thickness: `sm` 6px, `md` 8px. @default 'md' */
  size?: ScrollbarSize
  /** Ref to the scrolling element, e.g. to read or set `scrollTop`. */
  viewportRef?: React.Ref<HTMLDivElement>
  viewportClassName?: string
  /** Extra props for the scrolling element (`tabIndex`, `onScroll`, `aria-label`…). */
  viewportProps?: Omit<React.ComponentProps<typeof ScrollAreaPrimitive.Viewport>, 'ref'>
}

/**
 * Scroll container with thin themed scrollbars that appear on hover (`type="hover"`). Give it a
 * height (or max-height). For a plain `overflow: auto` element use the `momi-scrollbar` class.
 */
export function ScrollArea({
  type = 'hover',
  scrollHideDelay = 600,
  orientation = 'vertical',
  size = 'md',
  viewportRef,
  viewportClassName,
  viewportProps,
  className,
  children,
  ...props
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      type={type}
      scrollHideDelay={scrollHideDelay}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        ref={viewportRef}
        {...viewportProps}
        className={cn(
          'size-full rounded-[inherit] outline-none',
          'focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:ring-inset',
          viewportClassName,
          viewportProps?.className,
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {orientation !== 'horizontal' && <ScrollBar orientation="vertical" size={size} />}
      {orientation !== 'vertical' && <ScrollBar orientation="horizontal" size={size} />}
      {orientation === 'both' && <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />}
    </ScrollAreaPrimitive.Root>
  )
}

export interface ScrollBarProps extends React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar> {
  /** @default 'md' */
  size?: ScrollbarSize
}

/** One scrollbar. `ScrollArea` renders these for you; use it directly for custom layouts. */
export function ScrollBar({
  orientation = 'vertical',
  size = 'md',
  className,
  ...props
}: ScrollBarProps) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-size={size}
      orientation={orientation}
      className={cn(
        'z-10 flex touch-none p-px transition-colors select-none',
        'data-[state=hidden]:animate-fade-out data-[state=visible]:animate-fade-in',
        orientation === 'vertical' ? 'h-full' : 'flex-col',
        barThickness[orientation][size],
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-foreground/20 transition-colors hover:bg-foreground/35 active:bg-foreground/45"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}
