import type * as React from 'react'
import { cn } from '../lib/cn'
import { ArrowUpRightIcon, XIcon } from '../lib/icons'

export interface AnnouncementBarProps extends React.ComponentProps<'div'> {
  /** Makes the whole message a link. */
  href?: string
  /** `primary` filled bar or `subtle` muted bar. @default 'primary' */
  variant?: 'primary' | 'subtle'
  /** Shows a dismiss button. */
  onDismiss?: () => void
}

/** Thin full-width banner above the navbar for launches and news. */
export function AnnouncementBar({
  href,
  variant = 'primary',
  onDismiss,
  className,
  children,
  ...props
}: AnnouncementBarProps) {
  const content = (
    <>
      <span className="truncate">{children}</span>
      {href && <ArrowUpRightIcon className="size-3.5 shrink-0 opacity-70" />}
    </>
  )
  return (
    <div
      data-slot="announcement-bar"
      className={cn(
        'relative flex min-h-10 w-full items-center justify-center px-12 py-2 text-center text-sm',
        variant === 'primary'
          ? 'bg-primary text-primary-foreground'
          : 'border-b bg-muted/60 text-foreground',
        className,
      )}
      {...props}
    >
      {href ? (
        <a
          href={href}
          className="inline-flex max-w-full items-center gap-1.5 rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-current/50"
        >
          {content}
        </a>
      ) : (
        <span className="inline-flex max-w-full items-center gap-1.5">{content}</span>
      )}
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={onDismiss}
          className="absolute end-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current/50"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  )
}
