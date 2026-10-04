import type * as React from 'react'
import { cn } from '../lib/cn'
import { Marquee } from './marquee'

export interface LogoItem {
  /** Accessible name of the company. */
  name: string
  /** Logo element (SVG/img). Falls back to the name as a wordmark. */
  logo?: React.ReactNode
  href?: string
}

export interface LogoCloudProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  title?: React.ReactNode
  logos: LogoItem[]
  /** @default 'grid' */
  variant?: 'grid' | 'marquee'
  /** Show logos in color only on hover. @default true */
  grayscale?: boolean
}

function Logo({ item, grayscale }: { item: LogoItem; grayscale: boolean }) {
  const content = item.logo ?? (
    <span className="text-lg font-semibold tracking-tight whitespace-nowrap">{item.name}</span>
  )
  const className = cn(
    'flex h-10 items-center justify-center text-muted-foreground transition-[opacity,color,filter] duration-200',
    grayscale && 'opacity-70 grayscale hover:text-foreground hover:opacity-100 hover:grayscale-0',
  )
  return item.href ? (
    <a
      href={item.href}
      aria-label={item.name}
      className={cn(
        className,
        'rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
      )}
    >
      {content}
    </a>
  ) : (
    <div role="img" aria-label={item.name} className={className}>
      {content}
    </div>
  )
}

/** "Trusted by" strip of customer logos, as a wrapping row or an endless marquee. */
export function LogoCloud({
  title,
  logos,
  variant = 'grid',
  grayscale = true,
  className,
  ...props
}: LogoCloudProps) {
  return (
    <div data-slot="logo-cloud" className={cn('flex flex-col gap-8', className)} {...props}>
      {title && <p className="text-center text-sm text-muted-foreground">{title}</p>}
      {variant === 'marquee' ? (
        <Marquee gap="3.5rem" duration={35}>
          {logos.map((item) => (
            <Logo key={item.name} item={item} grayscale={grayscale} />
          ))}
        </Marquee>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((item) => (
            <Logo key={item.name} item={item} grayscale={grayscale} />
          ))}
        </div>
      )}
    </div>
  )
}
