import type * as React from 'react'
import { cn } from '../lib/cn'

export interface BrowserFrameProps extends React.ComponentProps<'div'> {
  /** Address shown in the toolbar. */
  url?: string
  contentClassName?: string
}

/** A minimal browser window around a screenshot or live UI — for heroes and feature sections. */
export function BrowserFrame({
  url,
  className,
  contentClassName,
  children,
  ...props
}: BrowserFrameProps) {
  return (
    <div
      data-slot="browser-frame"
      className={cn(
        'overflow-hidden rounded-xl border bg-card text-card-foreground shadow-[0_24px_64px_-24px_rgb(0_0_0/0.25)]',
        className,
      )}
      {...props}
    >
      <div className="flex h-10 items-center gap-3 border-b bg-muted/40 px-4">
        <div aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
        </div>
        {url && (
          <div className="mx-auto flex h-6 max-w-xs flex-1 items-center justify-center truncate rounded-md bg-background/80 px-3 text-xs text-muted-foreground">
            {url}
          </div>
        )}
        {url && <div aria-hidden className="w-[42px]" />}
      </div>
      <div className={cn('relative', contentClassName)}>{children}</div>
    </div>
  )
}
