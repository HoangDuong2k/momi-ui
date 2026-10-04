import { LogoCloud, Marquee, TestimonialCard } from '../../src'
import { Example } from '../components/demo'
import { logos, testimonials } from '../lib/landing-content'

export default function LogoCloudDemo() {
  return (
    <div className="space-y-12">
      <Example title="Grid" layout="stack">
        <LogoCloud title="Trusted by fast-moving teams" logos={logos.slice(0, 6)} />
      </Example>

      <Example title="Marquee" description="Pauses on hover and for reduced motion." layout="stack">
        <LogoCloud title="Powering products at" logos={logos} variant="marquee" />
      </Example>

      <Example
        title="Marquee with any content"
        description="Two rows in opposite directions."
        layout="stack"
        className="px-0 sm:px-0"
      >
        <Marquee duration={50}>
          {testimonials.slice(0, 3).map((t) => (
            <TestimonialCard key={t.name} {...t} className="w-80" />
          ))}
        </Marquee>
        <Marquee duration={50} reverse>
          {testimonials.slice(3).map((t) => (
            <TestimonialCard key={t.name} {...t} className="w-80" />
          ))}
        </Marquee>
      </Example>
    </div>
  )
}
