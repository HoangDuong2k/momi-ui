import type * as React from 'react'
import { cn } from '../lib/cn'
import { Heading } from '../components/typography'
import { BackgroundPattern } from './background-pattern'
import { Reveal } from './reveal'

export interface CtaProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  /** Small print under the actions. */
  footnote?: React.ReactNode
  /**
   * `simple` no surface · `card` subtle surface with a glow · `primary` filled with the accent color
   * (buttons inside automatically invert). @default 'card'
   */
  variant?: 'simple' | 'card' | 'primary'
  /** @default 'center' */
  align?: 'center' | 'split'
}

/**
 * Closing call-to-action. In the `primary` variant the accent tokens are swapped inside the panel,
 * so a regular `<Button>` renders light-on-dark (or dark-on-light) automatically.
 */
export function Cta({
  title,
  description,
  actions,
  footnote,
  variant = 'card',
  align = 'center',
  className,
  ...props
}: CtaProps) {
  const centered = align === 'center'
  const primary = variant === 'primary'

  return (
    <Reveal
      data-slot="cta"
      data-variant={variant}
      className={cn(
        'relative isolate overflow-hidden',
        variant !== 'simple' && 'rounded-3xl px-6 py-14 sm:px-12 sm:py-16',
        variant === 'card' && 'border bg-card shadow-xs',
        primary &&
          'bg-primary text-primary-foreground [--cta-bg:var(--primary)] [--cta-fg:var(--primary-foreground)]',
        className,
      )}
      {...props}
    >
      {variant === 'card' && <BackgroundPattern variant="glow" fade="none" />}
      {primary && (
        <BackgroundPattern
          variant="grid"
          fade="radial"
          className="opacity-60 [--foreground:var(--cta-fg)]"
        />
      )}
      <div
        className={cn(
          'flex flex-col gap-6',
          centered
            ? 'mx-auto max-w-2xl items-center text-center'
            : 'lg:flex-row lg:items-center lg:justify-between',
          // Swap tokens so components inside read well on the accent surface.
          primary &&
            '[--accent-foreground:var(--cta-fg)] [--accent:color-mix(in_oklab,var(--cta-fg)_12%,transparent)] [--background:var(--cta-bg)] [--border:color-mix(in_oklab,var(--cta-fg)_25%,transparent)] [--foreground:var(--cta-fg)] [--input:color-mix(in_oklab,var(--cta-fg)_35%,transparent)] [--muted-foreground:color-mix(in_oklab,var(--cta-fg)_75%,transparent)] [--primary-foreground:var(--cta-bg)] [--primary:var(--cta-fg)] [--ring:var(--cta-fg)]',
        )}
      >
        <div className={cn('flex flex-col gap-4', centered ? 'items-center' : 'max-w-xl')}>
          <Heading as="h2" size="2xl" className={cn(primary && 'text-current')}>
            {title}
          </Heading>
          {description && (
            <p
              className={cn(
                'text-pretty sm:text-lg',
                primary ? 'opacity-80' : 'text-muted-foreground',
              )}
            >
              {description}
            </p>
          )}
        </div>
        {(actions || footnote) && (
          <div
            className={cn(
              'flex flex-col gap-3',
              centered ? 'items-center' : 'items-start lg:items-end',
            )}
          >
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            {footnote && (
              <p className={cn('text-sm', primary ? 'opacity-70' : 'text-muted-foreground')}>
                {footnote}
              </p>
            )}
          </div>
        )}
      </div>
    </Reveal>
  )
}
