import { useState } from 'react'
import { FormField, Textarea } from '../../src'
import { Example } from '../components/demo'

const MAX = 160

export default function TextareaDemo() {
  const [bio, setBio] = useState('')

  return (
    <div className="space-y-12">
      <Example title="Default" layout="stack" className="max-w-md">
        <Textarea placeholder="Write a message…" aria-label="Message" />
      </Example>

      <Example
        title="Auto resize"
        description="Grows with its content."
        layout="stack"
        className="max-w-md"
      >
        <Textarea autoResize placeholder="Type several lines…" aria-label="Auto resize" />
      </Example>

      <Example title="With field & counter" layout="stack" className="max-w-md">
        <FormField
          label="Bio"
          description={`${bio.length}/${MAX} characters`}
          error={bio.length > MAX ? 'Bio is too long.' : undefined}
        >
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
          />
        </FormField>
      </Example>

      <Example title="Disabled" layout="stack" className="max-w-md">
        <Textarea disabled defaultValue="This textarea is disabled." aria-label="Disabled" />
      </Example>
    </div>
  )
}
