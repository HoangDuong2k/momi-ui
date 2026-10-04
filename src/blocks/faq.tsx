import type * as React from 'react'
import { cn } from '../lib/cn'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/accordion'
import { SectionHeader } from './section-header'

export interface FaqItem {
  question: React.ReactNode
  answer: React.ReactNode
}

export interface FaqProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  items: FaqItem[]
  eyebrow?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  /** `stacked` header above the list · `split` header beside it. @default 'stacked' */
  layout?: 'stacked' | 'split'
  /** Accordion look. @default 'separated' */
  variant?: 'default' | 'bordered' | 'separated'
  /** Index of the item open by default. */
  defaultOpen?: number
}

/** Frequently asked questions as an accordion, with an optional section header. */
export function Faq({
  items,
  eyebrow,
  title,
  description,
  layout = 'stacked',
  variant = 'separated',
  defaultOpen,
  className,
  ...props
}: FaqProps) {
  const split = layout === 'split'
  const header = title ? (
    <SectionHeader
      eyebrow={eyebrow}
      title={title}
      description={description}
      align={split ? 'start' : 'center'}
      className={cn(split && 'lg:sticky lg:top-24')}
    />
  ) : null

  return (
    <div
      data-slot="faq"
      className={cn(
        'grid gap-12',
        split
          ? 'items-start lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16'
          : 'mx-auto max-w-3xl',
        className,
      )}
      {...props}
    >
      {header}
      <Accordion
        type="single"
        collapsible
        variant={variant}
        indicator="plus"
        defaultValue={defaultOpen !== undefined ? `faq-${defaultOpen}` : undefined}
      >
        {items.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-[15px]">{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
