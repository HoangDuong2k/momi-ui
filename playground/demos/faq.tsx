import { Faq } from '../../src'
import { Example } from '../components/demo'
import { faqs } from '../lib/landing-content'

export default function FaqDemo() {
  return (
    <div className="space-y-12">
      <Example title="Stacked" layout="stack" className="py-12 sm:py-14">
        <Faq
          eyebrow="FAQ"
          title="Questions & answers"
          description="Can't find what you're looking for? Reach out to our team."
          items={faqs}
          defaultOpen={0}
        />
      </Example>

      <Example title="Split · bordered" layout="stack" className="py-12 sm:py-14">
        <Faq
          layout="split"
          variant="bordered"
          title="Frequently asked"
          description="Everything you need to know about momi-ui."
          items={faqs}
        />
      </Example>
    </div>
  )
}
