import { PricingComparison, PricingTable, SectionHeader } from '../../src'
import { Example } from '../components/demo'
import { plans } from '../lib/landing-content'

export default function PricingDemo() {
  return (
    <div className="space-y-12">
      <Example
        title="Pricing table"
        description="Billing toggle appears when plans have monthly/yearly prices."
        layout="stack"
        className="gap-12 py-12 sm:py-14"
      >
        <SectionHeader
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          description="Start free. Upgrade when your team grows."
        />
        <PricingTable plans={plans} yearlyBadge="−20%" />
      </Example>

      <Example title="Comparison matrix" layout="stack">
        <PricingComparison
          plans={plans}
          sections={[
            {
              title: 'Components',
              rows: [
                { feature: 'All components', values: { free: true, pro: true, team: true } },
                { feature: 'Landing blocks', values: { free: true, pro: true, team: true } },
                { feature: 'Premium templates', values: { free: false, pro: true, team: true } },
              ],
            },
            {
              title: 'Collaboration',
              rows: [
                { feature: 'Seats', values: { free: '1', pro: '5', team: 'Unlimited' } },
                {
                  feature: 'Private theme registry',
                  values: { free: false, pro: false, team: true },
                },
                {
                  feature: 'Support',
                  values: { free: 'Community', pro: 'Priority', team: 'Dedicated' },
                },
              ],
            },
          ]}
        />
      </Example>
    </div>
  )
}
