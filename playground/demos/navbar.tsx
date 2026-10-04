import { useState } from 'react'
import { AnnouncementBar, Button, Navbar } from '../../src'
import { Example } from '../components/demo'
import { Brand } from '../lib/landing-content'

const links = [
  { label: 'Product', href: '#/navbar', active: true },
  { label: 'Blocks', href: '#/hero' },
  { label: 'Pricing', href: '#/pricing' },
  { label: 'Docs', href: '#/overview' },
]

const actions = (
  <>
    <Button variant="ghost" size="sm">
      Sign in
    </Button>
    <Button size="sm">Get started</Button>
  </>
)

export default function NavbarDemo() {
  const [showBar, setShowBar] = useState(true)
  return (
    <div className="space-y-12">
      <Example
        title="Navbar"
        description="Links collapse into a menu below md — resize the window or open on mobile."
        layout="stack"
        className="gap-0 overflow-hidden p-0 sm:p-0"
      >
        <Navbar sticky={false} brand={<Brand />} links={links} actions={actions} />
        <div className="h-40 bg-dots" />
      </Example>

      <Example
        title="Variants"
        description="blur (default) · solid · transparent until scroll"
        layout="stack"
        className="gap-0 overflow-hidden p-0 sm:p-0"
      >
        <Navbar
          sticky={false}
          variant="solid"
          brand={<Brand />}
          links={links.slice(0, 3)}
          actions={actions}
        />
        <div className="relative h-16 bg-linear-to-r from-primary/15 to-transparent">
          <Navbar
            sticky={false}
            variant="transparent"
            brand={<Brand />}
            links={links.slice(0, 3)}
            actions={actions}
          />
        </div>
      </Example>

      <Example title="Announcement bar" layout="stack" className="gap-0 overflow-hidden p-0 sm:p-0">
        {showBar ? (
          <AnnouncementBar href="#/data-table" onDismiss={() => setShowBar(false)}>
            DataTable is here — virtualization, pinning and drag-to-reorder
          </AnnouncementBar>
        ) : (
          <div className="p-4">
            <Button size="sm" variant="outline" onClick={() => setShowBar(true)}>
              Show again
            </Button>
          </div>
        )}
        <AnnouncementBar variant="subtle">
          Scheduled maintenance on Sunday, 02:00 UTC.
        </AnnouncementBar>
      </Example>
    </div>
  )
}
