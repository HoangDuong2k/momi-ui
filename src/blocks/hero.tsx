import type * as React from 'react'
import { cn } from '../lib/cn'
import { ArrowUpRightIcon } from '../lib/icons'
import { Container, type ContainerProps } from '../components/layout'
import { Heading } from '../components/typography'
import { BackgroundPattern, type BackgroundVariant } from './background-pattern'
import { Reveal } from './reveal'

export interface HeroProps extends Omit<React.ComponentProps<'section'>, 'title'> {
  /** `centered` stacks everything; `split` puts media beside the copy on large screens. @default 'centered' */
  layout?: 'centered' | 'split'
  /** Above the title — e.g. a `HeroBadge`. */
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  /** Small print under the actions ("No credit card required"). */
  footnote?: React.ReactNode
  /** Screenshot, illustration or demo. */
  media?: React.ReactNode
  /** @default 'grid' */
  background?: BackgroundVariant | 'none'
  /** Vertical padding. @default 'lg' */
  size?: 'md' | 'lg'
  /** Fade content in on load. @default true */
  animate?: boolean
  /** @default 'xl' */
  containerSize?: ContainerProps['size']
}

/** The opening section of a landing page. */
export function Hero({
  layout = 'centered',
  eyebrow,
  title,
  description,
  actions,
  footnote,
  media,
  background = 'grid',
  size = 'lg',
  animate = true,
  containerSize = 'xl',
  className,
  children,
  ...props
}: HeroProps) {
  const split = layout === 'split'
  const Item = animate ? Reveal : 'div'
  const step = (i: number) => (animate ? { delay: i * 90 } : {})

  const copy = (
    <div
      className={cn(
        'flex flex-col gap-6',
        split ? 'items-start text-start' : 'mx-auto max-w-3xl items-center text-center',
      )}
    >
      {eyebrow && <Item {...step(0)}>{eyebrow}</Item>}
      <Item {...step(1)}>
        <Heading as="h1" size="display">
          {title}
        </Heading>
      </Item>
      {description && (
        <Item {...step(2)}>
          <p
            className={cn(
              'text-lg text-pretty text-muted-foreground sm:text-xl',
              !split && 'mx-auto max-w-2xl',
            )}
          >
            {description}
          </p>
        </Item>
      )}
      {(actions || footnote) && (
        <Item
          {...step(3)}
          className={cn('flex flex-col gap-4', split ? 'items-start' : 'items-center')}
        >
          {actions && (
            <div className={cn('flex flex-wrap gap-3', !split && 'justify-center')}>{actions}</div>
          )}
          {footnote && <p className="text-sm text-muted-foreground">{footnote}</p>}
        </Item>
      )}
    </div>
  )

  return (
    <section
      data-slot="hero"
      data-layout={layout}
      className={cn(
        'relative isolate overflow-hidden',
        size === 'lg' ? 'pt-20 pb-20 sm:pt-28 sm:pb-24' : 'py-16 sm:py-20',
        className,
      )}
      {...props}
    >
      {background !== 'none' && <BackgroundPattern variant={background} fade="radial" />}
      <Container size={containerSize}>
        {split ? (
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {copy}
            {media && <Item {...step(3)}>{media}</Item>}
          </div>
        ) : (
          <>
            {copy}
            {media && (
              <Item {...step(4)} className="mt-16 sm:mt-20">
                {media}
              </Item>
            )}
          </>
        )}
        {children}
      </Container>
    </section>
  )
}

export interface HeroBadgeProps extends React.ComponentProps<'a'> {
  /** Highlighted tag at the start, e.g. "New". */
  label?: React.ReactNode
}

/** Pill-shaped announcement link for the hero eyebrow. */
export function HeroBadge({ label, className, children, href, ...props }: HeroBadgeProps) {
  const Comp = href ? 'a' : 'span'
  return (
    <Comp
      data-slot="hero-badge"
      href={href}
      className={cn(
        'group inline-flex items-center gap-2 rounded-full border bg-background/60 py-1 ps-1 pe-3 text-sm shadow-xs backdrop-blur transition-colors outline-none',
        href && 'hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40',
        !label && 'ps-3',
        className,
      )}
      {...props}
    >
      {label && (
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
          {label}
        </span>
      )}
      <span className="text-muted-foreground group-hover:text-foreground">{children}</span>
      {href && (
        <ArrowUpRightIcon className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      )}
    </Comp>
  )
}
