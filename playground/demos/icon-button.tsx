import { Bell, Copy, Ellipsis, Heart, Pencil, Plus, Settings, Share, Trash2 } from 'lucide-react'
import { IconButton, Separator } from '../../src'
import { Example, Row } from '../components/demo'

export default function IconButtonDemo() {
  return (
    <div className="space-y-12">
      <Example title="Variants" description="Defaults to ghost. aria-label is required.">
        <IconButton aria-label="Add" variant="solid">
          <Plus />
        </IconButton>
        <IconButton aria-label="Like" variant="soft">
          <Heart />
        </IconButton>
        <IconButton aria-label="Settings" variant="outline">
          <Settings />
        </IconButton>
        <IconButton aria-label="Notifications">
          <Bell />
        </IconButton>
        <IconButton aria-label="Delete" tone="danger">
          <Trash2 />
        </IconButton>
      </Example>

      <Example title="Sizes & shapes" layout="stack">
        <Row label="square">
          <IconButton aria-label="Small" size="sm" variant="outline">
            <Plus />
          </IconButton>
          <IconButton aria-label="Medium" size="md" variant="outline">
            <Plus />
          </IconButton>
          <IconButton aria-label="Large" size="lg" variant="outline">
            <Plus />
          </IconButton>
        </Row>
        <Row label="circle">
          <IconButton aria-label="Small" size="sm" shape="circle" variant="solid">
            <Plus />
          </IconButton>
          <IconButton aria-label="Medium" size="md" shape="circle" variant="solid">
            <Plus />
          </IconButton>
          <IconButton aria-label="Large" size="lg" shape="circle" variant="solid">
            <Plus />
          </IconButton>
        </Row>
      </Example>

      <Example title="Toolbar">
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1 shadow-xs">
          <IconButton aria-label="Edit" size="sm">
            <Pencil />
          </IconButton>
          <IconButton aria-label="Copy" size="sm">
            <Copy />
          </IconButton>
          <IconButton aria-label="Share" size="sm">
            <Share />
          </IconButton>
          <Separator orientation="vertical" className="mx-1 my-1.5" />
          <IconButton aria-label="More" size="sm">
            <Ellipsis />
          </IconButton>
        </div>
      </Example>
    </div>
  )
}
