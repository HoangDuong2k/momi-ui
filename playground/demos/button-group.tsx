import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronLeft,
  ChevronRight,
  Italic,
  Underline,
} from 'lucide-react'
import { useState } from 'react'
import { Button, ButtonGroup, IconButton } from '../../src'
import { Example } from '../components/demo'

const ranges = ['Day', 'Week', 'Month', 'Year'] as const

export default function ButtonGroupDemo() {
  const [range, setRange] = useState<(typeof ranges)[number]>('Week')

  return (
    <div className="space-y-12">
      <Example title="Attached">
        <ButtonGroup aria-label="Text style">
          <IconButton variant="outline" aria-label="Bold">
            <Bold />
          </IconButton>
          <IconButton variant="outline" aria-label="Italic">
            <Italic />
          </IconButton>
          <IconButton variant="outline" aria-label="Underline">
            <Underline />
          </IconButton>
        </ButtonGroup>
        <ButtonGroup aria-label="Alignment">
          <Button variant="outline" leftIcon={<AlignLeft />}>
            Left
          </Button>
          <Button variant="outline" leftIcon={<AlignCenter />}>
            Center
          </Button>
          <Button variant="outline" leftIcon={<AlignRight />}>
            Right
          </Button>
        </ButtonGroup>
      </Example>

      <Example title="Segmented control" description="Toggle the selected item's variant.">
        <ButtonGroup aria-label="Range">
          {ranges.map((r) => (
            <Button
              key={r}
              size="sm"
              variant={range === r ? 'solid' : 'outline'}
              tone={range === r ? 'neutral' : undefined}
              aria-pressed={range === r}
              onClick={() => setRange(r)}
            >
              {r}
            </Button>
          ))}
        </ButtonGroup>
        <ButtonGroup aria-label="Pagination">
          <IconButton variant="outline" size="sm" aria-label="Previous">
            <ChevronLeft />
          </IconButton>
          <Button variant="outline" size="sm">
            Today
          </Button>
          <IconButton variant="outline" size="sm" aria-label="Next">
            <ChevronRight />
          </IconButton>
        </ButtonGroup>
      </Example>

      <Example title="Vertical & spaced">
        <ButtonGroup orientation="vertical" aria-label="Vertical">
          <Button variant="outline">Top</Button>
          <Button variant="outline">Middle</Button>
          <Button variant="outline">Bottom</Button>
        </ButtonGroup>
        <ButtonGroup attached={false} aria-label="Actions">
          <Button variant="ghost">Cancel</Button>
          <Button>Save changes</Button>
        </ButtonGroup>
      </Example>
    </div>
  )
}
