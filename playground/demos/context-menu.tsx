import { useState } from 'react'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '../../src'
import { Example } from '../components/demo'

export default function ContextMenuDemo() {
  const [bookmarks, setBookmarks] = useState(true)
  const [person, setPerson] = useState('linh')

  return (
    <div className="space-y-12">
      <Example title="Right-click the area" layout="stack">
        <ContextMenu>
          <ContextMenuTrigger className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground select-none data-[state=open]:border-foreground/30">
            Right-click here (long-press on touch)
          </ContextMenuTrigger>
          <ContextMenuContent className="w-60">
            <ContextMenuItem inset>
              Back
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem inset disabled>
              Forward
              <ContextMenuShortcut>⌘]</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem inset>
              Reload
              <ContextMenuShortcut>⌘R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger inset>More tools</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-44">
                <ContextMenuItem>Save page as…</ContextMenuItem>
                <ContextMenuItem>Create shortcut…</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Developer tools</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
              Show bookmarks
            </ContextMenuCheckboxItem>
            <ContextMenuSeparator />
            <ContextMenuLabel inset>People</ContextMenuLabel>
            <ContextMenuRadioGroup value={person} onValueChange={setPerson}>
              <ContextMenuRadioItem value="linh">Linh Tran</ContextMenuRadioItem>
              <ContextMenuRadioItem value="minh">Minh Nguyen</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
            <ContextMenuSeparator />
            <ContextMenuItem inset variant="danger">
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Example>
    </div>
  )
}
