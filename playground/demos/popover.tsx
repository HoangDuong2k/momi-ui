import { Settings2 } from 'lucide-react'
import {
  Button,
  FormField,
  Input,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
  Switch,
  Text,
} from '../../src'
import { Example } from '../components/demo'

export default function PopoverDemo() {
  return (
    <div className="space-y-12">
      <Example title="Form in a popover" pattern>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" leftIcon={<Settings2 />}>
              Dimensions
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Dimensions</p>
                <Text size="sm" tone="muted">
                  Set the dimensions for the layer.
                </Text>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Width">
                  <Input size="sm" defaultValue="100%" />
                </FormField>
                <FormField label="Height">
                  <Input size="sm" defaultValue="25px" />
                </FormField>
              </div>
              <Switch label="Lock aspect ratio" size="sm" defaultChecked />
              <div className="flex justify-end gap-2">
                <PopoverClose asChild>
                  <Button size="sm" variant="ghost">
                    Cancel
                  </Button>
                </PopoverClose>
                <PopoverClose asChild>
                  <Button size="sm">Apply</Button>
                </PopoverClose>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </Example>

      <Example title="Placement & arrow" description="side · align · showArrow">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Popover key={side}>
            <PopoverTrigger asChild>
              <Button variant="soft" className="capitalize">
                {side}
              </Button>
            </PopoverTrigger>
            <PopoverContent side={side} showArrow className="w-auto px-3 py-2 text-sm">
              Opens on the {side}
            </PopoverContent>
          </Popover>
        ))}
      </Example>
    </div>
  )
}
