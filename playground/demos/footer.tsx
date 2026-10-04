import { Footer, NewsletterForm } from '../../src'
import { Example } from '../components/demo'
import { Brand, footerColumns, social } from '../lib/landing-content'

export default function FooterDemo() {
  return (
    <div className="space-y-12">
      <Example title="Full footer" layout="stack" className="overflow-hidden p-0 sm:p-0">
        <Footer
          className="border-t-0"
          brand={<Brand />}
          description="Modern Minimal components and landing blocks for React."
          aside={
            <NewsletterForm
              onSubscribe={() => new Promise((r) => setTimeout(r, 800))}
              size="md"
              className="mt-2"
            />
          }
          columns={footerColumns}
          copyright="© 2026 momi-ui. MIT licensed."
          legal={[
            { label: 'Privacy', href: '#/footer' },
            { label: 'Terms', href: '#/footer' },
          ]}
          social={social}
        />
      </Example>

      <Example title="Minimal" layout="stack" className="overflow-hidden p-0 sm:p-0">
        <Footer className="border-t-0" copyright="© 2026 momi-ui" social={social} />
      </Example>
    </div>
  )
}
