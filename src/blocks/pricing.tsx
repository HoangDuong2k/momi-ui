import * as React from 'react'
import { cn } from '../lib/cn'
import { CheckIcon, MinusIcon } from '../lib/icons'
import { useControllableState } from '../lib/use-controllable-state'
import { Badge } from '../components/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table'
import { Reveal } from './reveal'

export type Billing = 'monthly' | 'yearly'

export interface PricingFeature {
  label: React.ReactNode
  /** @default true */
  included?: boolean
}

export interface PricingPlan {
  id: string
  name: React.ReactNode
  description?: React.ReactNode
  /** A number, per-billing prices (yearly = monthly equivalent), or text like "Custom". */
  price: number | { monthly: number; yearly: number } | string
  features?: Array<React.ReactNode | PricingFeature>
  /** Call-to-action button. */
  cta?: React.ReactNode
  /** Emphasize this plan. */
  highlighted?: boolean
  /** Label on top, e.g. "Most popular". */
  badge?: React.ReactNode
}

/* -------------------------------------------------------------------------------------------------
 * BillingToggle
 * -----------------------------------------------------------------------------------------------*/

export interface BillingToggleProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  value?: Billing
  defaultValue?: Billing
  onValueChange?: (value: Billing) => void
  /** Shown next to "Yearly", e.g. "Save 20%". */
  yearlyBadge?: React.ReactNode
  labels?: { monthly?: React.ReactNode; yearly?: React.ReactNode }
}

export function BillingToggle({
  value,
  defaultValue = 'monthly',
  onValueChange,
  yearlyBadge,
  labels,
  className,
  ...props
}: BillingToggleProps) {
  const [billing, setBilling] = useControllableState<Billing>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const options: { value: Billing; label: React.ReactNode }[] = [
    { value: 'monthly', label: labels?.monthly ?? 'Monthly' },
    { value: 'yearly', label: labels?.yearly ?? 'Yearly' },
  ]
  return (
    <div
      role="radiogroup"
      aria-label="Billing period"
      data-slot="billing-toggle"
      className={cn(
        'inline-flex items-center gap-1 rounded-full border bg-muted/60 p-1',
        className,
      )}
      {...props}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={billing === option.value}
          onClick={() => setBilling(option.value)}
          className={cn(
            'inline-flex h-8 items-center gap-2 rounded-full px-4 text-sm font-medium text-muted-foreground transition-[color,background-color,box-shadow] outline-none',
            'hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40',
            'aria-checked:bg-background aria-checked:text-foreground aria-checked:shadow-sm',
          )}
        >
          {option.label}
          {option.value === 'yearly' && yearlyBadge && (
            <Badge size="sm" tone="success" className="-me-1.5">
              {yearlyBadge}
            </Badge>
          )}
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * PricingCard
 * -----------------------------------------------------------------------------------------------*/

export interface PricingCardProps extends React.ComponentProps<'div'> {
  plan: PricingPlan
  /** @default 'monthly' */
  billing?: Billing
  /** @default '$' */
  currency?: string
  /** @default '/mo' */
  periodLabel?: React.ReactNode
  /** Note shown under the price for yearly billing. @default 'billed yearly' */
  yearlyNote?: React.ReactNode
}

export function PricingCard({
  plan,
  billing = 'monthly',
  currency = '$',
  periodLabel = '/mo',
  yearlyNote = 'billed yearly',
  className,
  ...props
}: PricingCardProps) {
  const price = typeof plan.price === 'object' ? plan.price[billing] : plan.price
  const numeric = typeof price === 'number'

  return (
    <div
      data-slot="pricing-card"
      data-highlighted={plan.highlighted || undefined}
      className={cn(
        'relative flex flex-col gap-6 rounded-2xl border bg-card p-6 text-card-foreground shadow-xs sm:p-8',
        plan.highlighted && 'border-primary shadow-lg ring-1 ring-primary',
        className,
      )}
      {...props}
    >
      {plan.badge && (
        <Badge
          variant="solid"
          tone="primary"
          className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-sm"
        >
          {plan.badge}
        </Badge>
      )}
      <div className="grid gap-2">
        <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
        {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
      </div>
      <div className="grid gap-1">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-semibold tracking-tight tabular-nums">
            {numeric ? `${currency}${price}` : price}
          </span>
          {numeric && <span className="text-sm text-muted-foreground">{periodLabel}</span>}
        </div>
        <p className="h-5 text-xs text-muted-foreground">
          {numeric && typeof plan.price === 'object' && billing === 'yearly' ? yearlyNote : null}
        </p>
      </div>
      {plan.cta && <div className="grid *:w-full">{plan.cta}</div>}
      {plan.features && plan.features.length > 0 && (
        <ul className="grid gap-3 border-t pt-6 text-sm">
          {plan.features.map((feature, i) => {
            const item: PricingFeature =
              typeof feature === 'object' && feature !== null && 'label' in feature
                ? (feature as PricingFeature)
                : { label: feature as React.ReactNode }
            const included = item.included !== false
            return (
              <li
                key={i}
                className={cn('flex items-start gap-3', !included && 'text-muted-foreground')}
              >
                {included ? (
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                ) : (
                  <MinusIcon className="mt-0.5 size-4 shrink-0 opacity-50" />
                )}
                <span className={cn(!included && 'line-through decoration-muted-foreground/40')}>
                  {item.label}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * PricingTable — billing toggle + plan cards
 * -----------------------------------------------------------------------------------------------*/

export interface PricingTableProps extends React.ComponentProps<'div'> {
  plans: PricingPlan[]
  billing?: Billing
  defaultBilling?: Billing
  onBillingChange?: (billing: Billing) => void
  /** e.g. "Save 20%". */
  yearlyBadge?: React.ReactNode
  currency?: string
}

const planColumns: Record<number, string> = {
  1: 'max-w-md',
  2: 'md:grid-cols-2 max-w-4xl',
  3: 'lg:grid-cols-3',
  4: 'md:grid-cols-2 xl:grid-cols-4',
}

export function PricingTable({
  plans,
  billing: billingProp,
  defaultBilling = 'monthly',
  onBillingChange,
  yearlyBadge,
  currency,
  className,
  ...props
}: PricingTableProps) {
  const [billing, setBilling] = useControllableState<Billing>({
    value: billingProp,
    defaultValue: defaultBilling,
    onChange: onBillingChange,
  })
  const hasToggle = plans.some((p) => typeof p.price === 'object')

  return (
    <div
      data-slot="pricing-table"
      className={cn('flex flex-col items-center gap-10', className)}
      {...props}
    >
      {hasToggle && (
        <BillingToggle value={billing} onValueChange={setBilling} yearlyBadge={yearlyBadge} />
      )}
      <div
        className={cn(
          'mx-auto grid w-full items-stretch gap-6',
          planColumns[plans.length] ?? 'lg:grid-cols-3',
        )}
      >
        {plans.map((plan, i) => (
          <Reveal key={plan.id} delay={i * 80} className="grid">
            <PricingCard plan={plan} billing={billing} currency={currency} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * PricingComparison — feature matrix
 * -----------------------------------------------------------------------------------------------*/

export interface PricingComparisonSection {
  title: React.ReactNode
  rows: Array<{
    feature: React.ReactNode
    /** Per plan id: `true` ✓, `false` –, or any text/node. */
    values: Record<string, boolean | React.ReactNode>
  }>
}

export interface PricingComparisonProps extends React.ComponentProps<'div'> {
  plans: Array<Pick<PricingPlan, 'id' | 'name' | 'highlighted'>>
  sections: PricingComparisonSection[]
}

export function PricingComparison({
  plans,
  sections,
  className,
  ...props
}: PricingComparisonProps) {
  return (
    <div data-slot="pricing-comparison" className={className} {...props}>
      <Table hoverable={false} stickyHeader>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">
              <span className="sr-only">Feature</span>
            </TableHead>
            {plans.map((plan) => (
              <TableHead
                key={plan.id}
                align="center"
                className={cn('text-sm text-foreground', plan.highlighted && 'text-primary')}
              >
                {plan.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((section, s) => (
            <React.Fragment key={s}>
              <TableRow className="border-b-0">
                <TableCell
                  colSpan={plans.length + 1}
                  className="pt-8 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  {section.title}
                </TableCell>
              </TableRow>
              {section.rows.map((row, r) => (
                <TableRow key={r}>
                  <TableCell className="text-muted-foreground">{row.feature}</TableCell>
                  {plans.map((plan) => {
                    const value = row.values[plan.id]
                    return (
                      <TableCell key={plan.id} align="center">
                        {value === true ? (
                          <CheckIcon
                            aria-label="Included"
                            className="mx-auto size-4 text-primary"
                          />
                        ) : value === false || value === undefined ? (
                          <MinusIcon
                            aria-label="Not included"
                            className="mx-auto size-4 text-muted-foreground/50"
                          />
                        ) : (
                          value
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
