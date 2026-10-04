import { Calendar } from 'lucide-react'
import { Avatar, HoverCard, HoverCardContent, HoverCardTrigger, Link, Text } from '../../src'
import { Example } from '../components/demo'

export default function HoverCardDemo() {
  return (
    <div className="space-y-12">
      <Example title="Profile preview" pattern>
        <Text>
          Designed by{' '}
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link href="#/hover-card">@linhtran</Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex gap-4">
                <Avatar name="Linh Tran" size="lg" />
                <div className="grid gap-1">
                  <p className="text-sm font-semibold">Linh Tran</p>
                  <Text size="sm" tone="muted">
                    Design engineer. Building calm interfaces with momi-ui.
                  </Text>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    Joined March 2024
                  </span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>{' '}
          — hover the handle.
        </Text>
      </Example>
    </div>
  )
}
