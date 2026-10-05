import { Slot } from 'radix-ui'
import type * as React from 'react'
import { useMessages } from '../i18n/locale-provider'
import { cn } from '../lib/cn'
import { ChevronRightIcon, EllipsisIcon } from '../lib/icons'

export function Breadcrumb({ 'aria-label': ariaLabel, ...props }: React.ComponentProps<'nav'>) {
  const t = useMessages('breadcrumb')
  return <nav data-slot="breadcrumb" aria-label={ariaLabel ?? t.nav} {...props} />
}

export function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2',
        className,
      )}
      {...props}
    />
  )
}

export function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  )
}

export function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<'a'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'a'
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40',
        "[&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    />
  )
}

/** The current page (not a link). */
export function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('font-medium text-foreground', className)}
      {...props}
    />
  )
}

/** Divider between items. Defaults to a chevron; pass children (e.g. "/") to change it. */
export function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('text-muted-foreground/60 [&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRightIcon className="rtl:rotate-180" />}
    </li>
  )
}

/** Collapsed middle items. Wrap in a DropdownMenuTrigger to reveal them. */
export function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  const t = useMessages('breadcrumb')
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      className={cn('flex size-6 items-center justify-center', className)}
      {...props}
    >
      <EllipsisIcon className="size-4" />
      <span className="sr-only">{t.more}</span>
    </span>
  )
}
