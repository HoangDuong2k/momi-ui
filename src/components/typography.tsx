import { cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../lib/cn'
import { ArrowUpRightIcon } from '../lib/icons'
import { toneText, type Tone } from '../lib/tones'

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const

const alignClasses = {
  left: 'text-start',
  center: 'text-center',
  right: 'text-end',
} as const

type Weight = keyof typeof weightClasses
type Align = keyof typeof alignClasses

/* -------------------------------------------------------------------------------------------------
 * Heading
 * -----------------------------------------------------------------------------------------------*/

const headingSizes = {
  xs: 'text-base',
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
  '2xl': 'text-3xl sm:text-4xl',
  '3xl': 'text-4xl sm:text-5xl',
  '4xl': 'text-4xl sm:text-5xl lg:text-6xl',
  display: 'text-5xl leading-[1.05] tracking-[-0.035em] sm:text-6xl lg:text-7xl',
} as const

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type HeadingSize = keyof typeof headingSizes

const defaultHeadingSize: Record<HeadingLevel, HeadingSize> = {
  h1: '2xl',
  h2: 'xl',
  h3: 'lg',
  h4: 'md',
  h5: 'sm',
  h6: 'xs',
}

export interface HeadingProps extends React.ComponentProps<'h2'> {
  /** Semantic level. @default 'h2' */
  as?: HeadingLevel
  /** Visual size, independent from the level. Defaults by level. */
  size?: HeadingSize
  /** @default 'semibold' */
  weight?: Weight
  align?: Align
  asChild?: boolean
}

export function Heading({
  as = 'h2',
  size,
  weight = 'semibold',
  align,
  asChild,
  className,
  ...props
}: HeadingProps) {
  const Comp = asChild ? Slot.Root : as
  return (
    <Comp
      data-slot="heading"
      className={cn(
        'tracking-tight text-balance text-foreground',
        headingSizes[size ?? defaultHeadingSize[as]],
        weightClasses[weight],
        align && alignClasses[align],
        className,
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * Text
 * -----------------------------------------------------------------------------------------------*/

const textSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
} as const

export interface TextProps extends React.ComponentProps<'p'> {
  /** @default 'p' */
  as?: 'p' | 'span' | 'div' | 'strong' | 'em' | 'small'
  /** Inherits when omitted. */
  size?: keyof typeof textSizes
  /** `muted` for secondary copy; semantic tones for status text. Inherits when omitted. */
  tone?: 'default' | 'muted' | Exclude<Tone, 'neutral'>
  weight?: Weight
  align?: Align
  truncate?: boolean
  asChild?: boolean
}

export function Text({
  as = 'p',
  size,
  tone,
  weight,
  align,
  truncate,
  asChild,
  className,
  ...props
}: TextProps) {
  const Comp = asChild ? Slot.Root : as
  return (
    <Comp
      data-slot="text"
      className={cn(
        'text-pretty',
        size && textSizes[size],
        tone === 'default' && 'text-foreground',
        tone === 'muted' && 'text-muted-foreground',
        tone && tone !== 'default' && tone !== 'muted' && toneText[tone],
        weight && weightClasses[weight],
        align && alignClasses[align],
        truncate && 'truncate',
        className,
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * Link
 * -----------------------------------------------------------------------------------------------*/

export const linkVariants = cva(
  'rounded-sm font-medium underline-offset-4 transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
  {
    variants: {
      variant: {
        default: 'text-primary hover:underline',
        muted: 'text-muted-foreground hover:text-foreground',
        underline: 'text-foreground underline decoration-foreground/30 hover:decoration-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface LinkProps extends React.ComponentProps<'a'> {
  /** @default 'default' */
  variant?: 'default' | 'muted' | 'underline'
  /** Opens in a new tab and shows an arrow icon. */
  external?: boolean
  /** Style a router link: `<Link asChild><RouterLink to="/" /></Link>`. */
  asChild?: boolean
}

export function Link({
  variant,
  external,
  asChild,
  className,
  children,
  target,
  rel,
  ...props
}: LinkProps) {
  const Comp = asChild ? Slot.Root : 'a'
  return (
    <Comp
      data-slot="link"
      className={cn(linkVariants({ variant }), className)}
      target={external ? '_blank' : target}
      rel={external ? 'noopener noreferrer' : rel}
      {...props}
    >
      <Slot.Slottable>{children}</Slot.Slottable>
      {external && (
        <ArrowUpRightIcon className="ms-0.5 inline-block size-[0.9em] -translate-y-px align-middle opacity-60" />
      )}
    </Comp>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Code, Kbd, Blockquote
 * -----------------------------------------------------------------------------------------------*/

export function Code({ className, ...props }: React.ComponentProps<'code'>) {
  return (
    <code
      data-slot="code"
      className={cn(
        'rounded-md border border-border/60 bg-muted px-[0.35em] py-[0.15em] font-mono text-[0.85em] font-medium',
        className,
      )}
      {...props}
    />
  )
}

export function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'pointer-events-none inline-flex h-5 min-w-5 items-center justify-center gap-0.5 rounded-[5px] border border-b-2 bg-muted px-1.5',
        'font-sans text-[11px] font-medium text-muted-foreground select-none',
        className,
      )}
      {...props}
    />
  )
}

export interface BlockquoteProps extends React.ComponentProps<'blockquote'> {
  /** Attribution shown below the quote. */
  author?: React.ReactNode
}

export function Blockquote({ author, className, children, ...props }: BlockquoteProps) {
  return (
    <blockquote
      data-slot="blockquote"
      className={cn('border-s-2 border-foreground/15 ps-5 text-foreground/85', className)}
      {...props}
    >
      <div className="text-lg leading-relaxed text-pretty">{children}</div>
      {author && <footer className="mt-3 text-sm text-muted-foreground">— {author}</footer>}
    </blockquote>
  )
}
