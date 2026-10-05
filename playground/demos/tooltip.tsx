import { Bold, Copy, Italic, Link2, Plus, Redo2, Save, Underline } from 'lucide-react'
import { Button, IconButton, Kbd, Separator, Tooltip, TooltipProvider } from '../../src'
import { Example } from '../components/demo'

export default function TooltipDemo() {
  return (
    <div className="space-y-12">
      <Example title="Basic">
        <Tooltip content="Add to library">
          <IconButton aria-label="Add" variant="outline">
            <Plus />
          </IconButton>
        </Tooltip>
        <Tooltip content="Copied links expire in 7 days" showArrow>
          <Button variant="outline" leftIcon={<Copy />}>
            Copy link
          </Button>
        </Tooltip>
      </Example>

      <Example
        title="With a shortcut"
        description="shortcut takes the keys once and shows them the way this computer writes them: ⌘S on a Mac, Ctrl+S on Windows and Linux. Redo even uses different keys per platform."
      >
        <Tooltip content="Save project" shortcut={['mod', 'S']}>
          <IconButton aria-label="Save project" variant="outline">
            <Save />
          </IconButton>
        </Tooltip>
        <Tooltip content="Redo" shortcut={{ mac: 'mod+shift+z', default: 'mod+y' }}>
          <IconButton aria-label="Redo" variant="outline">
            <Redo2 />
          </IconButton>
        </Tooltip>
      </Example>

      <Example title="Sides">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Tooltip key={side} content={`Tooltip on ${side}`} side={side}>
            <Button variant="soft" className="capitalize">
              {side}
            </Button>
          </Tooltip>
        ))}
      </Example>

      <Example
        title="Toolbar with shared provider"
        description="Inside a TooltipProvider, moving between buttons shows the next tooltip instantly."
      >
        <TooltipProvider delayDuration={400}>
          <div className="flex items-center gap-1 rounded-lg border bg-card p-1 shadow-xs">
            <Tooltip
              content={
                <span className="flex items-center gap-2">
                  Bold{' '}
                  <Kbd className="h-4 border-background/20 bg-background/10 text-background">
                    ⌘B
                  </Kbd>
                </span>
              }
            >
              <IconButton aria-label="Bold" size="sm">
                <Bold />
              </IconButton>
            </Tooltip>
            <Tooltip content="Italic">
              <IconButton aria-label="Italic" size="sm">
                <Italic />
              </IconButton>
            </Tooltip>
            <Tooltip content="Underline">
              <IconButton aria-label="Underline" size="sm">
                <Underline />
              </IconButton>
            </Tooltip>
            <Separator orientation="vertical" className="mx-1 my-1.5" />
            <Tooltip content="Insert link">
              <IconButton aria-label="Insert link" size="sm">
                <Link2 />
              </IconButton>
            </Tooltip>
          </div>
        </TooltipProvider>
      </Example>
    </div>
  )
}
