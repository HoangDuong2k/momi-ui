import { Accordion as AccordionPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../lib/cn'
import { ChevronDownIcon, PlusIcon } from '../lib/icons'

type AccordionVariant = 'default' | 'bordered' | 'separated'
type AccordionIndicator = 'chevron' | 'plus'

const AccordionStyleContext = React.createContext<{
  variant: AccordionVariant
  indicator: AccordionIndicator
}>({ variant: 'default', indicator: 'chevron' })

export type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root> & {
  /** `default` divided list · `bordered` one framed box · `separated` one card per item. */
  variant?: AccordionVariant
  /** `plus` turns into ×  when open — nice for FAQs. @default 'chevron' */
  indicator?: AccordionIndicator
}

const rootVariants: Record<AccordionVariant, string> = {
  default: 'w-full',
  bordered: 'w-full rounded-xl border px-4',
  separated: 'grid w-full gap-3',
}

export function Accordion({
  variant = 'default',
  indicator = 'chevron',
  className,
  ...props
}: AccordionProps) {
  const style = React.useMemo(() => ({ variant, indicator }), [variant, indicator])
  return (
    <AccordionStyleContext value={style}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        data-variant={variant}
        className={cn(rootVariants[variant], className)}
        {...props}
      />
    </AccordionStyleContext>
  )
}

export function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  const { variant } = React.useContext(AccordionStyleContext)
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        variant === 'separated'
          ? 'rounded-xl border bg-card px-4 transition-shadow data-[state=open]:shadow-sm'
          : 'border-b last:border-b-0',
        className,
      )}
      {...props}
    />
  )
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  const { indicator } = React.useContext(AccordionStyleContext)
  const Icon = indicator === 'plus' ? PlusIcon : ChevronDownIcon
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'flex flex-1 items-center justify-between gap-4 rounded-md py-4 text-start text-sm font-medium',
          'transition-colors outline-none hover:text-foreground/80 focus-visible:ring-[3px] focus-visible:ring-ring/40',
          'disabled:pointer-events-none disabled:opacity-50',
          indicator === 'plus'
            ? '[&[data-state=open]>svg]:rotate-45'
            : '[&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <Icon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out-soft" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        'overflow-hidden text-sm text-muted-foreground [--momi-collapse-height:var(--radix-accordion-content-height)]',
        'data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down',
      )}
      {...props}
    >
      <div className={cn('pb-4 leading-relaxed', className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}
