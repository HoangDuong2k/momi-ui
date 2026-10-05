import type * as React from 'react'
import { cn } from '../lib/cn'

export interface AppWindowFrameProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  /** Window chrome. @default 'macos' */
  variant?: 'macos' | 'windows' | 'minimal'
  /** Window title in the title bar. */
  title?: React.ReactNode
  /** Tilt the window back in 3D — straightens on hover. For hero sections. */
  tilt?: boolean
  /** Soft accent-colored glow behind the window. */
  glow?: boolean
  contentClassName?: string
}

function WindowsControls() {
  const button = 'flex h-full w-11 items-center justify-center'
  const icon = 'size-2.5'
  return (
    <div aria-hidden className="flex h-full shrink-0 text-muted-foreground">
      <span className={button}>
        <svg viewBox="0 0 10 10" className={icon} fill="none" stroke="currentColor">
          <path d="M0 5.5h10" />
        </svg>
      </span>
      <span className={button}>
        <svg viewBox="0 0 10 10" className={icon} fill="none" stroke="currentColor">
          <rect x="0.5" y="0.5" width="9" height="9" rx="1.5" />
        </svg>
      </span>
      <span className={button}>
        <svg viewBox="0 0 10 10" className={icon} fill="none" stroke="currentColor">
          <path d="m0.5 0.5 9 9m0-9-9 9" />
        </svg>
      </span>
    </div>
  )
}

function TitleBar({
  variant,
  title,
}: {
  variant: NonNullable<AppWindowFrameProps['variant']>
  title?: React.ReactNode
}) {
  if (variant === 'windows') {
    return (
      <div
        data-slot="app-window-titlebar"
        className="flex h-8 shrink-0 items-center gap-2 border-b bg-muted/40 ps-3"
      >
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{title}</span>
        <WindowsControls />
      </div>
    )
  }
  if (variant === 'minimal') {
    if (!title) return null
    return (
      <div
        data-slot="app-window-titlebar"
        className="flex h-8 shrink-0 items-center justify-center border-b bg-muted/30 px-4"
      >
        <span className="truncate text-xs font-medium text-muted-foreground">{title}</span>
      </div>
    )
  }
  return (
    <div
      data-slot="app-window-titlebar"
      className="relative flex h-10 shrink-0 items-center border-b bg-muted/40 px-4"
    >
      <div aria-hidden className="flex gap-2">
        <span className="size-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10 ring-inset" />
        <span className="size-3 rounded-full bg-[#febc2e] ring-1 ring-black/10 ring-inset" />
        <span className="size-3 rounded-full bg-[#28c840] ring-1 ring-black/10 ring-inset" />
      </div>
      {title && (
        <span className="absolute inset-x-24 truncate text-center text-xs font-medium text-muted-foreground">
          {title}
        </span>
      )}
    </div>
  )
}

/**
 * A desktop app window (macOS, Windows or minimal chrome) around a screenshot or video —
 * the desktop-app sibling of `BrowserFrame`.
 */
export function AppWindowFrame({
  variant = 'macos',
  title,
  tilt = false,
  glow = false,
  className,
  contentClassName,
  children,
  ...props
}: AppWindowFrameProps) {
  return (
    <div
      data-slot="app-window-frame"
      data-variant={variant}
      className={cn('group/window relative isolate', tilt && 'perspective-[2400px]', className)}
      {...props}
    >
      {glow && (
        <div
          aria-hidden
          data-slot="app-window-glow"
          className="pointer-events-none absolute -inset-x-[10%] -inset-y-[14%] -z-10 bg-[radial-gradient(closest-side,var(--primary),transparent)] opacity-25 blur-2xl dark:opacity-35"
        />
      )}
      <div
        className={cn(
          'flex flex-col overflow-hidden border bg-card text-card-foreground shadow-[0_30px_80px_-28px_rgb(0_0_0/0.35)] dark:shadow-[0_30px_80px_-24px_rgb(0_0_0/0.8)]',
          variant === 'windows' ? 'rounded-lg' : 'rounded-xl',
          tilt &&
            'origin-top scale-[0.97] rotate-x-[14deg] group-hover/window:scale-100 group-hover/window:rotate-x-0 motion-safe:transition-[rotate,scale,transform] motion-safe:duration-700 motion-safe:ease-out-soft',
        )}
      >
        <TitleBar variant={variant} title={title} />
        <div className={cn('relative min-h-0 flex-1', contentClassName)}>{children}</div>
      </div>
    </div>
  )
}
