import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormField,
  Input,
  Text,
  toast,
} from '../../src'
import { Example } from '../components/demo'

export default function DialogDemo() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-12">
      <Example title="Basic" pattern>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Edit profile</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <FormField label="Name">
                <Input defaultValue="Linh Tran" />
              </FormField>
              <FormField label="Username">
                <Input defaultValue="@linh" />
              </FormField>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={() => toast.success('Profile saved')}>Save changes</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Example>

      <Example title="Sizes" description="sm · md (default) · lg · xl · full">
        {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((size) => (
          <Dialog key={size}>
            <DialogTrigger asChild>
              <Button variant="soft">{size}</Button>
            </DialogTrigger>
            <DialogContent size={size}>
              <DialogHeader>
                <DialogTitle>size=&quot;{size}&quot;</DialogTitle>
                <DialogDescription>
                  Dialogs scale to their content up to the size limit.
                </DialogDescription>
              </DialogHeader>
              <Text size="sm" tone="muted">
                Press Esc or click outside to close.
              </Text>
            </DialogContent>
          </Dialog>
        ))}
      </Example>

      <Example title="Controlled & scrolling content">
        <Button onClick={() => setOpen(true)}>Open terms</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>Terms of service</DialogTitle>
              <DialogDescription>Last updated October 2026.</DialogDescription>
            </DialogHeader>
            <div className="max-h-72 space-y-4 overflow-y-auto pe-2 text-sm text-muted-foreground">
              {Array.from({ length: 8 }, (_, i) => (
                <p key={i}>
                  {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere
                  erat a ante venenatis dapibus posuere velit aliquet. Cras mattis consectetur purus
                  sit amet fermentum.
                </p>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Decline
              </Button>
              <Button onClick={() => setOpen(false)}>Accept</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Example>
    </div>
  )
}
