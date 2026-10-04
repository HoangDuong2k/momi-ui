import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../lib/cn'
import { Spinner } from './spinner'

export const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap select-none',
    'transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out',
    'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        solid: 'shadow-xs',
        soft: '',
        outline: 'border bg-background shadow-xs dark:bg-transparent',
        ghost: '',
        link: 'underline-offset-4 hover:underline active:scale-100',
      },
      tone: {
        primary: '',
        neutral: '',
        danger: '',
      },
      size: {
        sm: 'h-8 gap-1.5 rounded-md px-3 text-sm',
        md: 'h-9 rounded-md px-4 text-sm',
        lg: "h-11 rounded-lg px-6 text-base [&_svg:not([class*='size-'])]:size-[1.125rem]",
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    compoundVariants: [
      {
        variant: 'solid',
        tone: 'primary',
        class: 'bg-primary text-primary-foreground hover:bg-primary/90',
      },
      {
        variant: 'solid',
        tone: 'neutral',
        class: 'bg-foreground text-background hover:bg-foreground/90',
      },
      {
        variant: 'solid',
        tone: 'danger',
        class: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },

      { variant: 'soft', tone: 'primary', class: 'bg-primary/10 text-primary hover:bg-primary/15' },
      {
        variant: 'soft',
        tone: 'neutral',
        class: 'bg-secondary text-secondary-foreground hover:bg-foreground/10',
      },
      {
        variant: 'soft',
        tone: 'danger',
        class: 'bg-destructive/10 text-destructive hover:bg-destructive/15',
      },

      {
        variant: 'outline',
        tone: 'primary',
        class: 'border-primary/40 text-primary hover:bg-primary/5',
      },
      {
        variant: 'outline',
        tone: 'neutral',
        class: 'border-input text-foreground hover:bg-accent hover:text-accent-foreground',
      },
      {
        variant: 'outline',
        tone: 'danger',
        class: 'border-destructive/40 text-destructive hover:bg-destructive/5',
      },

      { variant: 'ghost', tone: 'primary', class: 'text-primary hover:bg-primary/10' },
      {
        variant: 'ghost',
        tone: 'neutral',
        class: 'text-foreground hover:bg-accent hover:text-accent-foreground',
      },
      { variant: 'ghost', tone: 'danger', class: 'text-destructive hover:bg-destructive/10' },

      { variant: 'link', class: 'h-auto px-0' },
      { variant: 'link', tone: 'primary', class: 'text-primary' },
      { variant: 'link', tone: 'neutral', class: 'text-foreground' },
      { variant: 'link', tone: 'danger', class: 'text-destructive' },
    ],
    defaultVariants: {
      variant: 'solid',
      size: 'md',
    },
  },
)

type ButtonVariantProps = VariantProps<typeof buttonVariants>
export type ButtonVariant = NonNullable<ButtonVariantProps['variant']>
export type ButtonTone = NonNullable<ButtonVariantProps['tone']>
export type ButtonSize = NonNullable<ButtonVariantProps['size']>

export interface ButtonProps extends React.ComponentProps<'button'> {
  /** @default 'solid' */
  variant?: ButtonVariant
  /** Defaults to `neutral` for `outline`/`ghost`, `primary` otherwise. */
  tone?: ButtonTone
  /** @default 'md' */
  size?: ButtonSize
  fullWidth?: boolean
  /** Render the child element (e.g. a router `<Link>`) with button styles. */
  asChild?: boolean
  /** Shows a spinner and disables the button. */
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function defaultTone(variant: ButtonVariant): ButtonTone {
  return variant === 'outline' || variant === 'ghost' ? 'neutral' : 'primary'
}

export function Button({
  className,
  variant = 'solid',
  tone,
  size = 'md',
  fullWidth,
  asChild = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  type,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  const isDisabled = disabled || loading

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-loading={loading || undefined}
      className={cn(
        buttonVariants({ variant, tone: tone ?? defaultTone(variant), size, fullWidth }),
        className,
      )}
      type={asChild ? undefined : (type ?? 'button')}
      disabled={asChild ? undefined : isDisabled}
      aria-disabled={asChild && isDisabled ? true : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" role={undefined} aria-label={undefined} aria-hidden />
      ) : (
        leftIcon
      )}
      <Slot.Slottable>{children}</Slot.Slottable>
      {!loading && rightIcon}
    </Comp>
  )
}
