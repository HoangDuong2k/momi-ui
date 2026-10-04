import type * as React from 'react'
import { cn } from '../lib/cn'
import { Heading } from '../components/typography'

export interface SectionHeaderProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  /** Small label above the title (text or a Badge). */
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Buttons or links under the description. */
  actions?: React.ReactNode
  /** @default 'center' */
  align?: 'center' | 'start'
  /** @default 'h2' */
  as?: 'h1' | 'h2' | 'h3'
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg'
}

const titleSizes = { sm: 'xl', md: '2xl', lg: '3xl' } as const

/** Eyebrow, title and description for a landing-page section. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  align = 'center',
  as = 'h2',
  size = 'md',
  className,
  ...props
}: SectionHeaderProps) {
  const centered = align === 'center'
  return (
    <div
      data-slot="section-header"
      className={cn(
        'flex max-w-2xl flex-col gap-4',
        centered ? 'mx-auto items-center text-center' : 'items-start text-start',
        className,
      )}
      {...props}
    >
      {eyebrow &&
        (typeof eyebrow === 'string' ? (
          <p className="text-sm font-medium tracking-tight text-primary">{eyebrow}</p>
        ) : (
          eyebrow
        ))}
      <Heading as={as} size={titleSizes[size]}>
        {title}
      </Heading>
      {description && (
        <p className="text-base text-pretty text-muted-foreground sm:text-lg">{description}</p>
      )}
      {actions && (
        <div className={cn('mt-2 flex flex-wrap gap-3', centered && 'justify-center')}>
          {actions}
        </div>
      )}
    </div>
  )
}
