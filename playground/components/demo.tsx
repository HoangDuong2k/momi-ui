import { useState, type ReactNode } from 'react'
import { Button, cn } from '../../src'

interface ExampleProps {
  title?: string
  description?: ReactNode
  children: ReactNode
  className?: string
  /** Layout of the preview area. @default 'center' */
  layout?: 'center' | 'start' | 'stack' | 'full'
  /** Dotted background behind the preview. */
  pattern?: boolean
}

/** One titled preview block inside a demo page. */
export function Example({
  title,
  description,
  children,
  className,
  layout = 'center',
  pattern = false,
}: ExampleProps) {
  return (
    <section className="space-y-3">
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div
        className={cn(
          'rounded-xl border bg-background p-6 sm:p-8',
          pattern && 'bg-dots',
          layout === 'center' && 'flex flex-wrap items-center justify-center gap-3',
          layout === 'start' && 'flex flex-wrap items-center gap-3',
          layout === 'stack' && 'flex flex-col gap-4',
          className,
        )}
      >
        {children}
      </div>
    </section>
  )
}

/** A labelled row inside an example (e.g. one row per tone). */
export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

/** Dashed placeholder box for layout demos. */
export function Box({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-14 items-center justify-center rounded-md border border-dashed border-foreground/15 bg-muted/60 px-3 font-mono text-xs text-muted-foreground',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <pre
      className={cn(
        'overflow-x-auto rounded-lg border bg-muted/40 p-4 font-mono text-[13px] leading-relaxed',
        className,
      )}
    >
      <code>{code}</code>
    </pre>
  )
}

export function SourceView({ source }: { source?: string }) {
  const [open, setOpen] = useState(false)
  if (!source) return null
  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? 'Hide demo source' : 'View demo source'}
      </Button>
      {open && <CodeBlock code={source} className="max-h-[32rem]" />}
    </div>
  )
}
