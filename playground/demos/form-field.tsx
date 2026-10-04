import { useState, type FormEvent } from 'react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  FormField,
  Grid,
  Input,
  InputAddon,
  InputGroup,
  NativeSelect,
  Textarea,
} from '../../src'
import { Example } from '../components/demo'

type Errors = Partial<Record<'name' | 'email' | 'role' | 'terms', string>>

export default function FormFieldDemo() {
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const next: Errors = {}
    if (!String(data.get('name') ?? '').trim()) next.name = 'Name is required.'
    const email = String(data.get('email') ?? '')
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.'
    if (!data.get('role')) next.role = 'Pick a role.'
    if (!data.get('terms')) next.terms = 'Please accept the terms.'
    setErrors(next)
    setSubmitted(Object.keys(next).length === 0)
  }

  return (
    <div className="space-y-12">
      <Example
        title="Anatomy"
        description="Label, control, description and error — ids and ARIA are wired automatically."
        layout="stack"
        className="max-w-md"
      >
        <FormField label="Display name" description="Shown on your public profile.">
          <Input placeholder="Linh Tran" />
        </FormField>
        <FormField label="Email" required error="This email is already taken.">
          <Input type="email" defaultValue="hello@momi.dev" />
        </FormField>
        <FormField label="Username" disabled description="Usernames can't be changed.">
          <InputGroup>
            <InputAddon>momi.dev/</InputAddon>
            <Input defaultValue="linh" />
          </InputGroup>
        </FormField>
      </Example>

      <Example title="Validation" description="Submit empty to see errors." layout="stack" pattern>
        <Card className="w-full max-w-xl" variant="elevated">
          <form noValidate onSubmit={onSubmit} className="contents">
            <CardHeader>
              <CardTitle>Create profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <Grid columns={{ base: 1, sm: 2 }} gap={5}>
                <FormField label="Full name" required error={errors.name}>
                  <Input name="name" autoComplete="name" />
                </FormField>
                <FormField label="Email" required error={errors.email}>
                  <Input name="email" type="email" autoComplete="email" />
                </FormField>
              </Grid>
              <FormField label="Role" required error={errors.role}>
                <NativeSelect name="role" placeholder="Select your role">
                  <option value="design">Designer</option>
                  <option value="eng">Engineer</option>
                  <option value="pm">Product manager</option>
                </NativeSelect>
              </FormField>
              <FormField label="About" description="Optional.">
                <Textarea name="about" autoResize placeholder="A few words about you" />
              </FormField>
              <FormField error={errors.terms}>
                <Checkbox name="terms" value="yes" label="I agree to the terms of service" />
              </FormField>
            </CardContent>
            <CardFooter className="justify-between border-t">
              {submitted ? (
                <Badge tone="success" dot>
                  Looks good!
                </Badge>
              ) : (
                <span />
              )}
              <Button type="submit">Save profile</Button>
            </CardFooter>
          </form>
        </Card>
      </Example>
    </div>
  )
}
