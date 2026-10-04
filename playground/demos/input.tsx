import { AtSign, Copy, Eye, EyeOff, Globe, Search } from 'lucide-react'
import { useState } from 'react'
import { Button, IconButton, Input, InputAddon, InputGroup, Kbd } from '../../src'
import { Example } from '../components/demo'

export default function InputDemo() {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-12">
      <Example title="Sizes" layout="stack" className="max-w-sm">
        <Input size="sm" placeholder="Small" aria-label="Small" />
        <Input size="md" placeholder="Medium (default)" aria-label="Medium" />
        <Input size="lg" placeholder="Large" aria-label="Large" />
      </Example>

      <Example
        title="Sections"
        description="Icons or controls inside the input."
        layout="stack"
        className="max-w-sm"
      >
        <Input
          placeholder="Search components…"
          aria-label="Search"
          leftSection={<Search />}
          rightSection={<Kbd>/</Kbd>}
        />
        <Input placeholder="username" aria-label="Username" leftSection={<AtSign />} />
        <Input
          type={visible ? 'text' : 'password'}
          defaultValue="momi-secret"
          aria-label="Password"
          rightSection={
            <IconButton
              size="sm"
              className="size-7"
              aria-label={visible ? 'Hide password' : 'Show password'}
              onClick={() => setVisible((v) => !v)}
            >
              {visible ? <EyeOff /> : <Eye />}
            </IconButton>
          }
        />
      </Example>

      <Example title="States" layout="stack" className="max-w-sm">
        <Input placeholder="Disabled" aria-label="Disabled" disabled />
        <Input defaultValue="Read only value" aria-label="Read only" readOnly />
        <Input defaultValue="not-an-email" aria-label="Invalid" aria-invalid />
        <Input type="file" aria-label="File" />
      </Example>

      <Example
        title="Input group"
        description="Attach addons and buttons."
        layout="stack"
        className="max-w-md"
      >
        <InputGroup>
          <InputAddon>https://</InputAddon>
          <Input placeholder="momi.dev" aria-label="Website" />
        </InputGroup>
        <InputGroup>
          <InputAddon>
            <Globe />
          </InputAddon>
          <Input placeholder="your-site" aria-label="Subdomain" />
          <InputAddon>.momi.app</InputAddon>
        </InputGroup>
        <InputGroup>
          <Input
            readOnly
            defaultValue="npm install momi-ui"
            aria-label="Install command"
            className="font-mono"
          />
          <Button variant="outline" leftIcon={<Copy />}>
            Copy
          </Button>
        </InputGroup>
        <InputGroup>
          <Input type="email" placeholder="you@company.com" aria-label="Email" />
          <Button>Subscribe</Button>
        </InputGroup>
      </Example>
    </div>
  )
}
