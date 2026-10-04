import { ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger, IconButton } from '../../src'
import { Example } from '../components/demo'

const repos = ['momi-ui/core', 'momi-ui/blocks', 'momi-ui/icons', 'momi-ui/docs']

export default function CollapsibleDemo() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-12">
      <Example title="Show more" layout="stack" className="items-center">
        <Collapsible open={open} onOpenChange={setOpen} className="grid w-full max-w-sm gap-2">
          <div className="flex items-center justify-between gap-4 px-1">
            <span className="text-sm font-medium">@linh starred 4 repositories</span>
            <CollapsibleTrigger asChild>
              <IconButton aria-label="Toggle repositories" size="sm">
                <ChevronsUpDown />
              </IconButton>
            </CollapsibleTrigger>
          </div>
          <div className="rounded-md border px-4 py-2.5 font-mono text-sm">{repos[0]}</div>
          <CollapsibleContent className="grid gap-2">
            {repos.slice(1).map((r) => (
              <div key={r} className="rounded-md border px-4 py-2.5 font-mono text-sm">
                {r}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </Example>
    </div>
  )
}
