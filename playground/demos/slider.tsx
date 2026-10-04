import { Volume1, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { FormField, Slider, Text } from '../../src'
import { Example } from '../components/demo'

const usd = (n: number) => `$${n.toLocaleString()}`

export default function SliderDemo() {
  const [volume, setVolume] = useState([60])
  const [price, setPrice] = useState([200, 800])

  return (
    <div className="space-y-12">
      <Example title="Single value" layout="stack" className="max-w-md">
        <div className="flex items-center gap-3">
          <Volume1 className="size-4 text-muted-foreground" />
          <Slider value={volume} onValueChange={setVolume} thumbLabels={['Volume']} />
          <Volume2 className="size-4 text-muted-foreground" />
        </div>
        <Text size="sm" tone="muted">
          Volume: {volume[0]}%
        </Text>
      </Example>

      <Example title="Range with value labels" layout="stack" className="max-w-md pt-12">
        <FormField label="Price range" description={`${usd(price[0])} – ${usd(price[1])}`}>
          <Slider
            value={price}
            onValueChange={setPrice}
            min={0}
            max={1000}
            step={10}
            minStepsBetweenThumbs={5}
            showValue
            formatValue={usd}
            thumbLabels={['Minimum price', 'Maximum price']}
          />
        </FormField>
      </Example>

      <Example title="Marks, sizes & disabled" layout="stack" className="max-w-md gap-8">
        <Slider
          defaultValue={[50]}
          step={25}
          marks={[
            { value: 0, label: '0' },
            { value: 25, label: '25' },
            { value: 50, label: '50' },
            { value: 75, label: '75' },
            { value: 100, label: '100' },
          ]}
          thumbLabels={['Level']}
        />
        <Slider size="sm" defaultValue={[30]} thumbLabels={['Small']} />
        <Slider defaultValue={[40]} disabled thumbLabels={['Disabled']} />
      </Example>

      <Example title="Vertical">
        <div className="flex h-44 gap-8">
          <Slider orientation="vertical" defaultValue={[70]} thumbLabels={['Bass']} />
          <Slider orientation="vertical" defaultValue={[40]} thumbLabels={['Mid']} />
          <Slider orientation="vertical" defaultValue={[55]} thumbLabels={['Treble']} />
        </div>
      </Example>
    </div>
  )
}
