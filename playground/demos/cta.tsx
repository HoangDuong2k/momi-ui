import { ArrowRight } from 'lucide-react'
import { Button, Cta, NewsletterForm, SectionHeader, toast } from '../../src'
import { Example } from '../components/demo'

const subscribe = (email: string) =>
  new Promise<void>((resolve, reject) =>
    setTimeout(() => {
      if (email.endsWith('@example.com')) reject(new Error('That domain is blocked in this demo.'))
      else {
        toast.success('Subscribed', { description: email })
        resolve()
      }
    }, 900),
  )

export default function CtaDemo() {
  return (
    <div className="space-y-12">
      <Example title="Card (default)" layout="stack">
        <Cta
          title="Ready to build something calm?"
          description="Install momi-ui and ship your next page today."
          actions={
            <>
              <Button size="lg" rightIcon={<ArrowRight />}>
                Get started
              </Button>
              <Button size="lg" variant="outline">
                Read the docs
              </Button>
            </>
          }
          footnote="Free forever for open-source projects."
        />
      </Example>

      <Example
        title="Primary"
        description="Tokens are swapped inside the panel, so normal buttons invert automatically — try another accent."
        layout="stack"
      >
        <Cta
          variant="primary"
          align="split"
          title="Start your 14-day trial"
          description="No credit card required. Cancel anytime."
          actions={
            <>
              <Button size="lg">Start trial</Button>
              <Button size="lg" variant="outline">
                Talk to sales
              </Button>
            </>
          }
        />
      </Example>

      <Example title="Simple" layout="stack">
        <Cta
          variant="simple"
          title="Join 12,000+ teams"
          actions={<Button size="lg">Create account</Button>}
        />
      </Example>

      <Example
        title="Newsletter form"
        description="Validation, loading, success and error states. Emails ending in @example.com fail in this demo."
        layout="stack"
        className="items-center gap-8 py-12 sm:py-14"
      >
        <SectionHeader
          title="Stay in the loop"
          description="Product updates once a month. No spam."
        />
        <NewsletterForm
          onSubscribe={subscribe}
          note="We care about your data."
          className="mx-auto"
        />
      </Example>
    </div>
  )
}
