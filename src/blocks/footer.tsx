import type * as React from 'react'
import { cn } from '../lib/cn'
import { Container, type ContainerProps } from '../components/layout'

export interface FooterLink {
  label: React.ReactNode
  href: string
  external?: boolean
}

export interface FooterColumn {
  title: React.ReactNode
  links: FooterLink[]
}

export interface FooterProps extends React.ComponentProps<'footer'> {
  brand?: React.ReactNode
  description?: React.ReactNode
  columns?: FooterColumn[]
  /** Extra content under the brand (e.g. a NewsletterForm). */
  aside?: React.ReactNode
  /** Copyright line. */
  copyright?: React.ReactNode
  social?: { label: string; href: string; icon: React.ReactNode }[]
  /** Links in the bottom bar (Privacy, Terms…). */
  legal?: FooterLink[]
  /** @default 'xl' */
  containerSize?: ContainerProps['size']
}

function FooterAnchor({ link, className }: { link: FooterLink; className?: string }) {
  return (
    <a
      href={link.href}
      target={link.external ? '_blank' : undefined}
      rel={link.external ? 'noopener noreferrer' : undefined}
      className={cn(
        'rounded-sm text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40',
        className,
      )}
    >
      {link.label}
    </a>
  )
}

/** Site footer: brand column, link columns and a bottom bar with legal + social links. */
export function Footer({
  brand,
  description,
  columns = [],
  aside,
  copyright,
  social,
  legal,
  containerSize = 'xl',
  className,
  ...props
}: FooterProps) {
  return (
    <footer data-slot="footer" className={cn('border-t bg-background', className)} {...props}>
      <Container
        size={containerSize}
        className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)] lg:gap-16"
      >
        <div className="flex max-w-sm flex-col gap-4">
          {brand}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          {aside}
        </div>
        {columns.length > 0 && (
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:justify-items-end">
            {columns.map((column, i) => (
              <div key={i} className="flex min-w-32 flex-col gap-3">
                <h3 className="text-sm font-medium">{column.title}</h3>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <FooterAnchor link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Container>
      {(copyright || social || legal) && (
        <div className="border-t">
          <Container
            size={containerSize}
            className="flex flex-col-reverse gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {copyright && <p className="text-sm text-muted-foreground">{copyright}</p>}
              {legal?.map((link, i) => (
                <FooterAnchor key={i} link={link} />
              ))}
            </div>
            {social && social.length > 0 && (
              <div className="flex gap-1">
                {social.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 [&_svg]:size-4"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            )}
          </Container>
        </div>
      )}
    </footer>
  )
}
