import { Calculator, Calendar, CreditCard, Moon, Settings, Smile, Sun, User } from 'lucide-react'
import { useState } from 'react'
import {
  Button,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Kbd,
  toast,
  useCommandShortcut,
  useTheme,
} from '../../src'
import { Example } from '../components/demo'

export default function CommandDemo() {
  const [open, setOpen] = useState(false)
  const { setTheme } = useTheme()
  useCommandShortcut(() => setOpen((o) => !o), 'j')

  const run = (label: string) => () => {
    setOpen(false)
    toast(label)
  }

  return (
    <div className="space-y-12">
      <Example
        title="Inline"
        description="Arrow keys to move, Enter to run. Search ignores accents (try “cai dat”)."
        pattern
      >
        <Command className="w-full max-w-md border shadow-md" label="Commands">
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <CommandEmpty />
            <CommandGroup heading="Suggestions">
              <CommandItem onSelect={() => toast('Calendar')}>
                <Calendar />
                Calendar
              </CommandItem>
              <CommandItem onSelect={() => toast('Emoji')} keywords={['smile', 'icon']}>
                <Smile />
                Search emoji
              </CommandItem>
              <CommandItem disabled>
                <Calculator />
                Calculator
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem onSelect={() => toast('Profile')}>
                <User />
                Profile
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => toast('Billing')}>
                <CreditCard />
                Billing
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => toast('Cài đặt')} keywords={['settings', 'preferences']}>
                <Settings />
                Cài đặt
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </Example>

      <Example
        title="Dialog"
        description={
          <>
            Press <Kbd>⌘</Kbd> <Kbd>J</Kbd> (or <Kbd>Ctrl</Kbd> <Kbd>J</Kbd>). The playground header
            uses the same component on <Kbd>⌘</Kbd> <Kbd>K</Kbd>.
          </>
        }
      >
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open command palette
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="What do you need?" />
          <CommandList>
            <CommandEmpty>No commands found.</CommandEmpty>
            <CommandGroup heading="Theme">
              <CommandItem
                onSelect={() => {
                  setTheme('light')
                  setOpen(false)
                }}
              >
                <Sun />
                Light mode
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setTheme('dark')
                  setOpen(false)
                }}
              >
                <Moon />
                Dark mode
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Account">
              <CommandItem onSelect={run('Opened profile')}>
                <User />
                Profile
              </CommandItem>
              <CommandItem onSelect={run('Opened billing')}>
                <CreditCard />
                Billing
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </Example>
    </div>
  )
}
