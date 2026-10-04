import { Mail, MessageCircle, Rss } from 'lucide-react'
import { SectionHeader, TeamGrid } from '../../src'
import { Example } from '../components/demo'

const links = (handle: string) => [
  { label: 'Email', href: `mailto:${handle}@momi.dev`, icon: <Mail /> },
  { label: 'Community', href: '#/team', icon: <MessageCircle /> },
  { label: 'Blog', href: '#/team', icon: <Rss /> },
]

const members = [
  {
    name: 'Linh Tran',
    role: 'Design Lead',
    bio: 'Obsessed with whitespace and type.',
    links: links('linh'),
  },
  { name: 'Minh Nguyen', role: 'Engineering', bio: 'Makes tables fast.', links: links('minh') },
  { name: 'An Pham', role: 'Accessibility', bio: 'Keyboard first, always.', links: links('an') },
  {
    name: 'Bao Le',
    role: 'Developer Relations',
    bio: 'Writes the docs you read.',
    links: links('bao'),
  },
]

export default function TeamDemo() {
  return (
    <div className="space-y-12">
      <Example title="Plain" layout="stack" className="gap-12 py-12 sm:py-14">
        <SectionHeader eyebrow="Team" title="The people behind momi" />
        <TeamGrid members={members} />
      </Example>
      <Example title="Cards · 3 columns" layout="stack">
        <TeamGrid members={members.slice(0, 3)} columns={3} variant="cards" />
      </Example>
    </div>
  )
}
