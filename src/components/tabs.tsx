import { Tabs as TabsPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../lib/cn'

type TabsVariant = 'segmented' | 'underline' | 'pills'

const TabsVariantContext = React.createContext<TabsVariant>('segmented')

export function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-4 data-[orientation=vertical]:flex-row', className)}
      {...props}
    />
  )
}

const listVariants: Record<TabsVariant, string> = {
  segmented: 'inline-flex w-fit items-center gap-1 rounded-lg bg-muted p-1',
  underline: 'flex w-full items-center gap-6 border-b',
  pills: 'inline-flex w-fit items-center gap-1',
}

export interface TabsListProps extends React.ComponentProps<typeof TabsPrimitive.List> {
  /** @default 'segmented' */
  variant?: TabsVariant
  /** Stretch the list and share the width between triggers. */
  fullWidth?: boolean
}

export function TabsList({
  variant = 'segmented',
  fullWidth = false,
  className,
  ...props
}: TabsListProps) {
  return (
    <TabsVariantContext value={variant}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(
          'shrink-0 text-muted-foreground',
          'data-[orientation=vertical]:h-fit data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
          listVariants[variant],
          variant === 'underline' &&
            'data-[orientation=vertical]:w-48 data-[orientation=vertical]:gap-0 data-[orientation=vertical]:border-e data-[orientation=vertical]:border-b-0',
          fullWidth && 'w-full *:flex-1',
          className,
        )}
        {...props}
      />
    </TabsVariantContext>
  )
}

const triggerVariants: Record<TabsVariant, string> = {
  segmented:
    'h-8 rounded-md px-3 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-input/50',
  underline:
    'relative h-10 px-0.5 hover:text-foreground data-[state=active]:text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:transition-colors data-[state=active]:after:bg-foreground data-[orientation=vertical]:justify-start data-[orientation=vertical]:px-3 data-[orientation=vertical]:after:inset-y-1 data-[orientation=vertical]:after:start-auto data-[orientation=vertical]:after:-end-px data-[orientation=vertical]:after:h-auto data-[orientation=vertical]:after:w-0.5',
  pills:
    'h-8 rounded-full px-3.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const variant = React.useContext(TabsVariantContext)
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap',
        'transition-[color,background-color,box-shadow] duration-150 outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        triggerVariants[variant],
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'min-w-0 flex-1 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[state=active]:animate-fade-in',
        className,
      )}
      {...props}
    />
  )
}
