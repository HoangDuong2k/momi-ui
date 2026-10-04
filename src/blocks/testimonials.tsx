import type * as React from 'react'
import { cn } from '../lib/cn'
import { StarIcon } from '../lib/icons'
import { Avatar } from '../components/avatar'
import { Reveal } from './reveal'

export interface Testimonial {
  quote: React.ReactNode
  name: string
  role?: React.ReactNode
  avatar?: string
  /** 1–5 stars. */
  rating?: number
  /** Company logo shown at the top. */
  logo?: React.ReactNode
}

export function StarRating({
  value,
  max = 5,
  className,
}: {
  value: number
  max?: number
  className?: string
}) {
  return (
    <div
      role="img"
      aria-label={`${value} out of ${max} stars`}
      className={cn('flex gap-0.5 text-warning', className)}
    >
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} className={cn('size-4', i >= Math.round(value) && 'opacity-25')} />
      ))}
    </div>
  )
}

export interface TestimonialCardProps
  extends Omit<React.ComponentProps<'figure'>, 'children' | 'role'>, Testimonial {
  /** `card` bordered surface · `plain` no surface. @default 'card' */
  variant?: 'card' | 'plain'
}

export function TestimonialCard({
  quote,
  name,
  role,
  avatar,
  rating,
  logo,
  variant = 'card',
  className,
  ...props
}: TestimonialCardProps) {
  return (
    <figure
      data-slot="testimonial"
      className={cn(
        'flex flex-col gap-5',
        variant === 'card' && 'rounded-2xl border bg-card p-6 text-card-foreground shadow-xs',
        className,
      )}
      {...props}
    >
      {logo && <div className="text-muted-foreground">{logo}</div>}
      {rating !== undefined && <StarRating value={rating} />}
      <blockquote className="text-[15px] leading-relaxed text-pretty">{quote}</blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <Avatar src={avatar} name={name} size="sm" />
        <div className="min-w-0 text-sm">
          <div className="truncate font-medium">{name}</div>
          {role && <div className="truncate text-muted-foreground">{role}</div>}
        </div>
      </figcaption>
    </figure>
  )
}

export interface TestimonialGridProps extends React.ComponentProps<'div'> {
  items: Testimonial[]
  /** Max columns of the masonry layout. @default 3 */
  columns?: 2 | 3
}

/** Masonry wall of testimonial cards. */
export function TestimonialGrid({ items, columns = 3, className, ...props }: TestimonialGridProps) {
  return (
    <div
      data-slot="testimonial-grid"
      className={cn(
        'columns-1 gap-4 *:mb-4 *:break-inside-avoid sm:columns-2',
        columns === 3 && 'lg:columns-3',
        className,
      )}
      {...props}
    >
      {items.map((item, i) => (
        <Reveal key={i} delay={(i % columns) * 80}>
          <TestimonialCard {...item} />
        </Reveal>
      ))}
    </div>
  )
}

export interface FeaturedTestimonialProps
  extends Omit<React.ComponentProps<'figure'>, 'children' | 'role'>, Testimonial {}

/** One large, centered quote. */
export function FeaturedTestimonial({
  quote,
  name,
  role,
  avatar,
  rating,
  logo,
  className,
  ...props
}: FeaturedTestimonialProps) {
  return (
    <figure
      data-slot="featured-testimonial"
      className={cn('mx-auto flex max-w-3xl flex-col items-center gap-8 text-center', className)}
      {...props}
    >
      {logo && <div className="text-muted-foreground">{logo}</div>}
      {rating !== undefined && <StarRating value={rating} />}
      <blockquote className="text-2xl leading-snug font-medium tracking-tight text-balance sm:text-3xl">
        “{quote}”
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <Avatar src={avatar} name={name} />
        <div className="text-start text-sm">
          <div className="font-medium">{name}</div>
          {role && <div className="text-muted-foreground">{role}</div>}
        </div>
      </figcaption>
    </figure>
  )
}
