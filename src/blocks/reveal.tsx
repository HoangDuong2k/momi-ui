import { Slot } from 'radix-ui'
import * as React from 'react'
import { cn } from '../lib/cn'
import { mergeRefs } from '../lib/merge-refs'

export interface UseInViewOptions {
  /** Stop observing after the element first becomes visible. @default true */
  once?: boolean
  rootMargin?: string
  threshold?: number
}

/** Track whether an element is in the viewport. Returns `[ref, inView]`. */
export function useInView<T extends Element>({
  once = true,
  rootMargin = '0px',
  threshold = 0,
}: UseInViewOptions = {}) {
  const ref = React.useRef<T>(null)
  const [inView, setInView] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      // No observer (old browsers, tests): just show the content.
      const frame = requestAnimationFrame(() => setInView(true))
      return () => cancelAnimationFrame(frame)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [once, rootMargin, threshold])

  return [ref, inView] as const
}

export interface RevealProps extends React.ComponentProps<'div'> {
  /** Delay before the transition starts, in ms. */
  delay?: number
  /** Distance to slide up from, in px. @default 16 */
  y?: number
  /** Animate every time it enters the viewport. */
  repeat?: boolean
  asChild?: boolean
}

/** Fades and slides its content in when scrolled into view. Respects reduced motion. */
export function Reveal({
  delay = 0,
  y = 16,
  repeat = false,
  asChild,
  className,
  style,
  ref,
  ...props
}: RevealProps) {
  const [inViewRef, inView] = useInView<HTMLDivElement>({
    once: !repeat,
    rootMargin: '0px 0px -8% 0px',
  })
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <Comp
      ref={mergeRefs(inViewRef, ref)}
      data-slot="reveal"
      data-visible={inView || undefined}
      className={cn(
        'translate-y-(--reveal-y) opacity-0 transition-[opacity,translate] duration-700 ease-out-soft',
        'data-visible:translate-y-0 data-visible:opacity-100',
        'motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none',
        className,
      )}
      style={
        { '--reveal-y': `${y}px`, transitionDelay: `${delay}ms`, ...style } as React.CSSProperties
      }
      {...props}
    />
  )
}
