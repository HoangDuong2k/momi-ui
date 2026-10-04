import { cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../lib/cn'

export const cardVariants = cva('flex flex-col rounded-xl text-card-foreground', {
  variants: {
    variant: {
      outline: 'border bg-card shadow-xs',
      elevated:
        'border border-border/60 bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)]',
      ghost: 'bg-muted/50',
    },
    padding: {
      none: 'gap-0 py-0 [--card-px:0px]',
      sm: 'gap-4 py-4 [--card-px:1rem]',
      md: 'gap-6 py-6 [--card-px:1.5rem]',
      lg: 'gap-8 py-8 [--card-px:2rem]',
    },
    interactive: {
      true: 'transition-[box-shadow,transform,border-color] duration-200 ease-out-soft hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md',
    },
  },
  defaultVariants: {
    variant: 'outline',
    padding: 'md',
  },
})

export interface CardProps extends React.ComponentProps<'div'> {
  /** @default 'outline' */
  variant?: 'outline' | 'elevated' | 'ghost'
  /** Inner spacing; sub-components follow it. @default 'md' */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Lift on hover — for clickable cards. */
  interactive?: boolean
  asChild?: boolean
}

export function Card({ className, variant, padding, interactive, asChild, ...props }: CardProps) {
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <Comp
      data-slot="card"
      className={cn(cardVariants({ variant, padding, interactive }), className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-(--card-px)',
        'has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-(--card-px)',
        className,
      )}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('text-base leading-snug font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

/** Top-right slot inside `CardHeader` (a button, menu, badge…). */
export function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-(--card-px)', className)} {...props} />
}

export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center gap-2 px-(--card-px) [.border-t]:pt-(--card-px)', className)}
      {...props}
    />
  )
}
