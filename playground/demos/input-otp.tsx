import { useState } from 'react'
import { Button, FormField, InputOTP, Text, toast } from '../../src'
import { Example } from '../components/demo'

export default function InputOTPDemo() {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | undefined>()

  return (
    <div className="space-y-12">
      <Example
        title="Verification code"
        description="Type, paste (try 123-456) or use SMS autofill — it's a single real input."
        layout="stack"
        className="items-center"
      >
        <FormField label="Enter the 6-digit code" error={error} className="justify-items-center">
          <InputOTP
            value={code}
            onValueChange={(v) => {
              setCode(v)
              setError(undefined)
            }}
            groups={[3, 3]}
            onComplete={(v) => {
              if (v === '000000') setError('That code has expired.')
              else toast.success('Verified', { description: `Code ${v}` })
            }}
          />
        </FormField>
        <Text size="sm" tone="muted">
          Enter 000000 to see the error state.
        </Text>
        <Button variant="ghost" size="sm" onClick={() => setCode('')}>
          Reset
        </Button>
      </Example>

      <Example title="Sizes" layout="stack" className="items-center">
        <InputOTP aria-label="Small" size="sm" length={4} />
        <InputOTP aria-label="Medium" size="md" length={4} />
        <InputOTP aria-label="Large" size="lg" length={4} />
      </Example>

      <Example title="PIN (masked) & alphanumeric" layout="stack" className="items-center">
        <InputOTP aria-label="PIN" length={4} mask />
        <InputOTP
          aria-label="Invite code"
          length={6}
          pattern={/^[a-zA-Z0-9]$/}
          groups={[2, 2, 2]}
        />
      </Example>
    </div>
  )
}
