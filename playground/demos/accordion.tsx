import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../src'
import { Example } from '../components/demo'

const faqs = [
  {
    q: 'Is momi-ui free to use?',
    a: 'Yes. It is open source under the MIT license — use it in personal and commercial projects.',
  },
  {
    q: 'Do I need Tailwind CSS?',
    a: 'No. Tailwind v4 projects import momi-ui/tailwind.css; other projects import the precompiled momi-ui/styles.css.',
  },
  {
    q: 'Can I change the colors?',
    a: 'Every color is a CSS variable. Override --primary, --radius and friends on :root and .dark.',
  },
  {
    q: 'Is it accessible?',
    a: 'Interactive components are built on Radix primitives with full keyboard and screen reader support.',
  },
]

export default function AccordionDemo() {
  return (
    <div className="space-y-12">
      <Example title="Default" description='type="single" collapsible' layout="stack">
        <Accordion type="single" collapsible defaultValue="item-0">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Example>

      <Example title="Bordered · multiple" layout="stack">
        <Accordion type="multiple" variant="bordered">
          {faqs.slice(0, 3).map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Example>

      <Example
        title="Separated · plus indicator"
        description="A common FAQ style for landing pages."
        layout="stack"
        pattern
      >
        <Accordion type="single" collapsible variant="separated" indicator="plus">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-[15px]">{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Example>
    </div>
  )
}
