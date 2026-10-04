import type * as React from 'react'
import { cn } from '../lib/cn'
import { ArrowUpRightIcon, CheckIcon } from '../lib/icons'
import { Heading } from '../components/typography'
import { Reveal } from './reveal'

export interface FeatureItem {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Turns the item into a link. */
  href?: string
}

const columnClasses = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const

export interface FeatureGridProps extends React.ComponentProps<'div'> {
  items: FeatureItem[]
  /** @default 3 */
  columns?: keyof typeof columnClasses
  /** `plain` text only · `cards` each in a card · `bordered` one grid with hairlines. @default 'plain' */
  variant?: 'plain' | 'cards' | 'bordered'
  /** Stagger items in as they scroll into view. @default true */
  animate?: boolean
}

/** Grid of features with an icon, title and description. */
export function FeatureGrid({
  items,
  columns = 3,
  variant = 'plain',
  animate = true,
  className,
  ...props
}: FeatureGridProps) {
  return (
    <div
      data-slot="feature-grid"
      data-variant={variant}
      className={cn(
        'grid grid-cols-1',
        columnClasses[columns],
        variant === 'plain' && 'gap-x-8 gap-y-12',
        variant === 'cards' && 'gap-4',
        variant === 'bordered' && 'gap-px overflow-hidden rounded-xl border bg-border',
        className,
      )}
      {...props}
    >
      {items.map((item, i) => {
        const body = (
          <>
            {item.icon && (
              <span className="flex size-10 items-center justify-center rounded-lg border bg-background text-foreground shadow-xs [&_svg]:size-5">
                {item.icon}
              </span>
            )}
            <div className="grid gap-2">
              <Heading as="h3" size="xs" className="flex items-center gap-1.5">
                {item.title}
                {item.href && (
                  <ArrowUpRightIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </Heading>
              {item.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              )}
            </div>
          </>
        )
        const itemClass = cn(
          'group flex flex-col gap-4 text-start',
          variant === 'cards' && 'rounded-xl border bg-card p-6 shadow-xs',
          variant === 'bordered' && 'bg-background p-8',
          item.href &&
            'rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
          item.href &&
            variant === 'cards' &&
            'transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md',
          item.href && variant === 'bordered' && 'rounded-none transition-colors hover:bg-muted/40',
        )
        const content = item.href ? (
          <a href={item.href} className={itemClass}>
            {body}
          </a>
        ) : (
          <div className={itemClass}>{body}</div>
        )
        return animate ? (
          <Reveal key={i} delay={(i % columns) * 80} className="grid">
            {content}
          </Reveal>
        ) : (
          <div key={i} className="grid">
            {content}
          </div>
        )
      })}
    </div>
  )
}

export interface FeatureSplitProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Short benefit list with check marks. */
  bullets?: React.ReactNode[]
  actions?: React.ReactNode
  /** Image, screenshot or illustration. */
  media: React.ReactNode
  /** Put the media on the left. */
  reverse?: boolean
}

/** Copy on one side, media on the other — stack several with `reverse` alternating. */
export function FeatureSplit({
  eyebrow,
  title,
  description,
  bullets,
  actions,
  media,
  reverse = false,
  className,
  ...props
}: FeatureSplitProps) {
  return (
    <div
      data-slot="feature-split"
      className={cn('grid items-center gap-10 lg:grid-cols-2 lg:gap-16', className)}
      {...props}
    >
      <Reveal className={cn('flex flex-col items-start gap-5', reverse && 'lg:order-2')}>
        {eyebrow &&
          (typeof eyebrow === 'string' ? (
            <p className="text-sm font-medium text-primary">{eyebrow}</p>
          ) : (
            eyebrow
          ))}
        <Heading as="h3" size="xl">
          {title}
        </Heading>
        {description && (
          <p className="text-pretty text-muted-foreground sm:text-lg">{description}</p>
        )}
        {bullets && bullets.length > 0 && (
          <ul className="grid gap-3">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckIcon className="size-3" />
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
        {actions && <div className="mt-2 flex flex-wrap gap-3">{actions}</div>}
      </Reveal>
      <Reveal delay={120} className={cn(reverse && 'lg:order-1')}>
        {media}
      </Reveal>
    </div>
  )
}
