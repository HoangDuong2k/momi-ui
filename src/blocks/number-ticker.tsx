import * as React from 'react'
import { useLocale } from '../i18n/locale-provider'
import { cn } from '../lib/cn'

export interface NumberTickerProps extends Omit<
  React.ComponentProps<'span'>,
  'children' | 'prefix'
> {
  value: number
  /** Start value of the count-up. @default 0 */
  from?: number
  /** @default 1600 */
  duration?: number
  /** Fraction digits. @default 0 */
  decimals?: number
  /** BCP 47 locale for number formatting. Defaults to `LocaleProvider`'s. */
  locale?: string
  formatOptions?: Intl.NumberFormatOptions
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

type Phase = 'idle' | 'waiting' | 'running' | 'done'

/** Counts up to `value` when scrolled into view. Screen readers get the final value. */
export function NumberTicker({
  value,
  from = 0,
  duration = 1600,
  decimals = 0,
  locale: localeProp,
  formatOptions,
  prefix,
  suffix,
  className,
  ...props
}: NumberTickerProps) {
  const context = useLocale()
  const locale = localeProp ?? context.locale
  const ref = React.useRef<HTMLSpanElement>(null)
  const [phase, setPhase] = React.useState<Phase>('idle')
  const [current, setCurrent] = React.useState(from)

  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    let started = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (started) return
        if (!entry.isIntersecting) {
          setPhase('waiting')
          return
        }
        started = true
        observer.disconnect()
        setPhase('running')
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - t, 3)
          setCurrent(from + (value - from) * eased)
          if (t < 1) frame = requestAnimationFrame(tick)
          else setPhase('done')
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, from, duration])

  const format = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        ...formatOptions,
      }),
    [locale, decimals, formatOptions],
  )
  const shown = phase === 'waiting' ? from : phase === 'running' ? current : value

  return (
    <span ref={ref} data-slot="number-ticker" className={cn('tabular-nums', className)} {...props}>
      <span aria-hidden>
        {prefix}
        {format.format(shown)}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {format.format(value)}
        {suffix}
      </span>
    </span>
  )
}
