import {
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  FormField,
  Input,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Text,
} from '../../src'
import { Example } from '../components/demo'

const sides = ['right', 'left', 'top', 'bottom'] as const

export default function DrawerDemo() {
  return (
    <div className="space-y-12">
      <Example title="Sides">
        {sides.map((side) => (
          <Drawer key={side}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="capitalize">
                {side}
              </Button>
            </DrawerTrigger>
            <DrawerContent side={side}>
              <DrawerHeader>
                <DrawerTitle className="capitalize">{side} drawer</DrawerTitle>
                <DrawerDescription>Slides in from the {side} edge.</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <Text size="sm" tone="muted">
                  Drawers keep context visible while showing secondary tasks: filters, carts,
                  settings, details.
                </Text>
              </DrawerBody>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button>Done</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ))}
      </Example>

      <Example title="Filters panel" description='size="sm" · scrollable body · sticky footer'>
        <Drawer>
          <DrawerTrigger asChild>
            <Button>Show filters</Button>
          </DrawerTrigger>
          <DrawerContent size="sm">
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerDescription>Narrow down 1,284 results.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody className="grid content-start gap-6">
              <FormField label="Keyword">
                <Input placeholder="Search…" />
              </FormField>
              <Separator />
              <FormField label="Status">
                <div className="grid gap-3">
                  <Checkbox label="Active" defaultChecked />
                  <Checkbox label="Paused" />
                  <Checkbox label="Archived" />
                </div>
              </FormField>
              <Separator />
              <FormField label="Sort by">
                <RadioGroup defaultValue="recent">
                  <RadioGroupItem value="recent" label="Most recent" />
                  <RadioGroupItem value="popular" label="Most popular" />
                  <RadioGroupItem value="name" label="Name A–Z" />
                </RadioGroup>
              </FormField>
            </DrawerBody>
            <DrawerFooter className="border-t">
              <DrawerClose asChild>
                <Button variant="ghost">Reset</Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button>Apply filters</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Example>
    </div>
  )
}
