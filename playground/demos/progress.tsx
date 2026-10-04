import { useEffect, useState } from 'react'
import { Progress, type Tone } from '../../src'
import { Example } from '../components/demo'

export default function ProgressDemo() {
  const [value, setValue] = useState(12)

  useEffect(() => {
    const timer = window.setInterval(() => setValue((v) => (v >= 100 ? 8 : v + 8)), 900)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="space-y-12">
      <Example title="Animated value" layout="stack" className="max-w-md">
        <Progress value={value} label="Uploading assets" showValue />
      </Example>

      <Example title="Sizes" layout="stack" className="max-w-md">
        {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
          <Progress key={size} size={size} value={60} aria-label={`Size ${size}`} />
        ))}
      </Example>

      <Example title="Tones" layout="stack" className="max-w-md">
        {(['primary', 'success', 'warning', 'danger', 'info'] as Tone[]).map((tone, i) => (
          <Progress key={tone} tone={tone} value={30 + i * 15} aria-label={tone} />
        ))}
      </Example>

      <Example title="Indeterminate" layout="stack" className="max-w-md">
        <Progress aria-label="Loading" size="sm" />
      </Example>
    </div>
  )
}
