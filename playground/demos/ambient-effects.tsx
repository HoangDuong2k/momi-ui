import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, DustMotes, LightBeams, Switch, Text } from '../../src'
import { CodeBlock, Example } from '../components/demo'

export default function AmbientEffectsDemo() {
  const [lampOn, setLampOn] = useState(true)
  return (
    <div className="space-y-12">
      <Example
        title="Dust in a lamp beam"
        description="DustMotes: dust drifts through a beam of light that turns slowly towards the pointer; moving the pointer stirs it. Here as a desk lamp in a dark room, with a cool accent for the dust outside the light."
        layout="full"
        className="p-0 sm:p-0"
      >
        <section className="dark relative isolate flex h-[32rem] items-center overflow-hidden rounded-xl bg-[#08090a] px-8 text-[#dde5e3] sm:px-14">
          <DustMotes
            color="#ffcf8f"
            beamColor="#ffbf73"
            ambientColor="#4fe0d4"
            beam={lampOn}
            source={{ x: 0.08, y: -0.06 }}
          />
          <div className="max-w-lg space-y-5">
            <Badge variant="outline" className="border-[#3fc2b8]/40 text-[#4fe0d4]">
              ● Desk ready
            </Badge>
            <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Your tasks, on a desk that waits for you.
            </h2>
            <Text className="text-[#9e9b95]">
              The world outside can wait. Turn on the lamp, and the day comes into focus.
            </Text>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                className="bg-[#3fc2b8] text-[#021311] hover:bg-[#4fe0d4]"
                rightIcon={<ArrowRight />}
              >
                Download
              </Button>
              <Switch label="Lamp" checked={lampOn} onCheckedChange={setLampOn} />
            </div>
          </div>
        </section>
      </Example>

      <Example
        title="Light beams"
        description="LightBeams: soft beams drifting slowly, like stage light through haze. No pointer interaction; drawn at half resolution."
        layout="stack"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="dark relative isolate flex h-72 items-end overflow-hidden rounded-xl bg-[#05081f] p-6 text-foreground">
            <LightBeams />
            <Text weight="medium">Dark: light adds up</Text>
          </div>
          <div className="relative isolate flex h-72 items-end overflow-hidden rounded-xl border bg-background p-6">
            <LightBeams colors={['#f97316', '#ec4899', '#eab308']} angle={-30} count={4} />
            <Text weight="medium">Light background, warm colors</Text>
          </div>
        </div>
      </Example>

      <Example title="Usage" layout="stack">
        <CodeBlock
          code={`import { DustMotes, LightBeams } from 'momi-ui'

<section className="relative isolate overflow-hidden">
  <LightBeams colors={['var(--primary)', 'var(--info)']} />
  <DustMotes color="#ffcf8f" ambientColor="var(--primary)" source={{ x: 0.1, y: -0.1 }} />
  …
</section>`}
        />
      </Example>
    </div>
  )
}
