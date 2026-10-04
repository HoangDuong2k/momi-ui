import { FeaturedTestimonial, SectionHeader, TestimonialCard, TestimonialGrid } from '../../src'
import { Example } from '../components/demo'
import { logos, testimonials } from '../lib/landing-content'

export default function TestimonialsDemo() {
  return (
    <div className="space-y-12">
      <Example title="Masonry grid" layout="stack" className="gap-12 py-12 sm:py-14">
        <SectionHeader eyebrow="Testimonials" title="Loved by product teams" />
        <TestimonialGrid items={testimonials} />
      </Example>

      <Example title="Featured quote" layout="stack" className="py-14 sm:py-16" pattern>
        <FeaturedTestimonial {...testimonials[0]} logo={logos[0].logo} />
      </Example>

      <Example title="Card variants" layout="stack">
        <div className="grid gap-4 md:grid-cols-2">
          <TestimonialCard {...testimonials[1]} />
          <TestimonialCard {...testimonials[2]} variant="plain" rating={undefined} />
        </div>
      </Example>
    </div>
  )
}
