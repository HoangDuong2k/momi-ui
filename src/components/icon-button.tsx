import { cn } from '../lib/cn'
import { Button, type ButtonProps, type ButtonSize } from './button'

const iconButtonSizes: Record<ButtonSize, string> = {
  sm: 'size-8',
  md: 'size-9',
  lg: 'size-11',
}

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'fullWidth'> {
  /** Required: icon-only buttons need an accessible name. */
  'aria-label': string
  /** @default 'square' */
  shape?: 'square' | 'circle'
}

/** Square button for a single icon. Defaults to the `ghost` variant. */
export function IconButton({
  variant = 'ghost',
  size = 'md',
  shape = 'square',
  className,
  ...props
}: IconButtonProps) {
  return (
    <Button
      data-slot="icon-button"
      variant={variant}
      size={size}
      className={cn('px-0', iconButtonSizes[size], shape === 'circle' && 'rounded-full', className)}
      {...props}
    />
  )
}
