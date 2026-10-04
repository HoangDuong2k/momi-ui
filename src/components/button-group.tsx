import type * as React from 'react'
import { cn } from '../lib/cn'

export interface ButtonGroupProps extends React.ComponentProps<'div'> {
  /** @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /** Join the buttons into one segmented control. When `false` they are spaced apart. @default true */
  attached?: boolean
}

export function ButtonGroup({
  orientation = 'horizontal',
  attached = true,
  className,
  ...props
}: ButtonGroupProps) {
  const horizontal = orientation === 'horizontal'
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(
        'inline-flex w-fit',
        horizontal ? 'flex-row items-center' : 'flex-col items-stretch',
        !attached && 'gap-2',
        attached && '[&>*:active]:scale-100 [&>*:focus-visible]:relative [&>*:focus-visible]:z-10',
        attached &&
          horizontal &&
          '[&>*:not(:first-child)]:-ms-px [&>*:not(:first-child)]:rounded-s-none [&>*:not(:last-child)]:rounded-e-none',
        attached &&
          !horizontal &&
          '[&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none',
        className,
      )}
      {...props}
    />
  )
}
