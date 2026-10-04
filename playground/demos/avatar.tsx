import { Avatar, AvatarGroup, type AvatarSize } from '../../src'
import { Example, Row } from '../components/demo'

/** Inline SVG "photos" so the playground works offline. */
function photo(from: string, to: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="26" r="11" fill="white" fill-opacity=".85"/><path d="M12 60c2-12 10-18 20-18s18 6 20 18" fill="white" fill-opacity=".85"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const people = [
  { name: 'Linh Tran', src: photo('#f0abfc', '#6366f1') },
  { name: 'Minh Nguyen', src: photo('#fde68a', '#f97316') },
  { name: 'An Pham', src: photo('#a7f3d0', '#0ea5e9') },
  { name: 'Bao Le' },
  { name: 'Chi Vo', src: photo('#fecdd3', '#e11d48') },
  { name: 'Duy Ho' },
  { name: 'Ha Do' },
]

const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl']

export default function AvatarDemo() {
  return (
    <div className="space-y-12">
      <Example title="Image, initials, icon" layout="stack">
        <Row label="sizes">
          {sizes.map((size) => (
            <Avatar key={size} size={size} name="Linh Tran" src={people[0].src} />
          ))}
        </Row>
        <Row label="initials">
          {sizes.map((size) => (
            <Avatar key={size} size={size} name="Minh Nguyen" />
          ))}
        </Row>
        <Row label="fallback">
          <Avatar />
          <Avatar name="Broken Image" src="/does-not-exist.png" />
        </Row>
      </Example>

      <Example title="Shape & status" layout="stack">
        <Row label="square">
          {sizes.map((size) => (
            <Avatar key={size} size={size} shape="square" name="An Pham" src={people[2].src} />
          ))}
        </Row>
        <Row label="status">
          <Avatar name="Linh Tran" src={people[0].src} status="online" />
          <Avatar name="Minh Nguyen" src={people[1].src} status="away" />
          <Avatar name="Chi Vo" src={people[4].src} status="busy" />
          <Avatar name="Bao Le" status="offline" />
        </Row>
      </Example>

      <Example title="Group" description="max collapses the rest into +N." layout="stack">
        <AvatarGroup size="sm">
          {people.slice(0, 4).map((p) => (
            <Avatar key={p.name} {...p} />
          ))}
        </AvatarGroup>
        <AvatarGroup max={4}>
          {people.map((p) => (
            <Avatar key={p.name} {...p} />
          ))}
        </AvatarGroup>
        <AvatarGroup size="lg" max={3}>
          {people.map((p) => (
            <Avatar key={p.name} {...p} />
          ))}
        </AvatarGroup>
      </Example>
    </div>
  )
}
