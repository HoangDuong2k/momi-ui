/** Generated SVG artwork for media demos — no external or copyrighted images. */

const W = 1600
const H = 1000

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const toDataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

function frame(defs: string, body: string) {
  return toDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs}<filter id="blur"><feGaussianBlur stdDeviation="60"/></filter><filter id="soft"><feGaussianBlur stdDeviation="6"/></filter></defs>${body}</svg>`,
  )
}

function particles() {
  const rand = seeded(7)
  const dots = Array.from({ length: 160 }, () => {
    const r = rand() * 5 + 1
    return `<circle cx="${rand() * W}" cy="${rand() * H}" r="${r}" fill="#ffd9a0" opacity="${0.25 + rand() * 0.75}"/>`
  }).join('')
  return frame(
    '<radialGradient id="g" cx="50%" cy="60%" r="70%"><stop offset="0" stop-color="#2b1d44"/><stop offset="1" stop-color="#07060d"/></radialGradient>',
    `<rect width="${W}" height="${H}" fill="url(#g)"/><g filter="url(#soft)">${dots}</g>${dots}`,
  )
}

function lightLeaks() {
  return frame(
    '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a0f0a"/><stop offset="1" stop-color="#3b1606"/></linearGradient>',
    `<rect width="${W}" height="${H}" fill="url(#g)"/><g filter="url(#blur)"><ellipse cx="300" cy="200" rx="420" ry="300" fill="#ff8a3d" opacity="0.85"/><ellipse cx="1300" cy="820" rx="520" ry="280" fill="#ff3d7f" opacity="0.6"/><ellipse cx="900" cy="300" rx="260" ry="200" fill="#ffd36e" opacity="0.7"/></g>`,
  )
}

function vinyl() {
  const grooves = Array.from(
    { length: 26 },
    (_, i) =>
      `<circle cx="800" cy="500" r="${150 + i * 11}" fill="none" stroke="#ffffff" stroke-opacity="${i % 3 === 0 ? 0.09 : 0.04}" stroke-width="2"/>`,
  ).join('')
  return frame(
    '<radialGradient id="g" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#1d1b22"/><stop offset="1" stop-color="#0b0a0e"/></radialGradient><linearGradient id="label" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3a04a"/><stop offset="1" stop-color="#c2410c"/></linearGradient>',
    `<rect width="${W}" height="${H}" fill="url(#g)"/><circle cx="800" cy="500" r="440" fill="#050506"/>${grooves}<path d="M800 60 A440 440 0 0 1 1180 280" stroke="#ffffff" stroke-opacity="0.18" stroke-width="40" fill="none" filter="url(#soft)"/><circle cx="800" cy="500" r="130" fill="url(#label)"/><circle cx="800" cy="500" r="12" fill="#050506"/>`,
  )
}

function waveform() {
  const rand = seeded(21)
  const count = 64
  const bars = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    const h = (Math.sin(t * Math.PI) * 0.75 + 0.25) * (0.35 + rand() * 0.65) * 640
    const x = 160 + i * ((W - 320) / count)
    return `<rect x="${x}" y="${500 - h / 2}" width="12" height="${h}" rx="6" fill="url(#bar)"/>`
  }).join('')
  return frame(
    '<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1220"/><stop offset="1" stop-color="#05070c"/></linearGradient><linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#6366f1"/></linearGradient>',
    `<rect width="${W}" height="${H}" fill="url(#g)"/><g opacity="0.45" filter="url(#soft)">${bars}</g>${bars}`,
  )
}

function vhs() {
  const lines = Array.from(
    { length: 125 },
    (_, i) => `<rect y="${i * 8}" width="${W}" height="3" fill="#000" opacity="0.28"/>`,
  ).join('')
  return frame(
    '<linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#14532d"/><stop offset="0.5" stop-color="#0f766e"/><stop offset="1" stop-color="#1e1b4b"/></linearGradient>',
    `<rect width="${W}" height="${H}" fill="url(#g)"/><g font-family="monospace" font-size="150" font-weight="700"><text x="182" y="560" fill="#ff2d55" opacity="0.7">PLAY ▶</text><text x="170" y="552" fill="#22d3ee" opacity="0.7">PLAY ▶</text><text x="176" y="556" fill="#f8fafc">PLAY ▶</text></g><text x="176" y="700" font-family="monospace" font-size="56" fill="#f8fafc" opacity="0.8">SP 00:42:17</text>${lines}<rect y="760" width="${W}" height="26" fill="#ffffff" opacity="0.12"/>`,
  )
}

function bokeh() {
  const rand = seeded(3)
  const colors = ['#f472b6', '#facc15', '#60a5fa', '#34d399', '#fb923c']
  const circles = Array.from({ length: 34 }, (_, i) => {
    const r = 40 + rand() * 120
    return `<circle cx="${rand() * W}" cy="${rand() * H}" r="${r}" fill="${colors[i % colors.length]}" opacity="${0.15 + rand() * 0.35}"/>`
  }).join('')
  return frame(
    '<radialGradient id="g" cx="40%" cy="40%" r="80%"><stop offset="0" stop-color="#1f2937"/><stop offset="1" stop-color="#030712"/></radialGradient>',
    `<rect width="${W}" height="${H}" fill="url(#g)"/><g filter="url(#soft)">${circles}</g>`,
  )
}

export const artworks = {
  particles: particles(),
  lightLeaks: lightLeaks(),
  vinyl: vinyl(),
  waveform: waveform(),
  vhs: vhs(),
  bokeh: bokeh(),
}

/** CC0 sample clip from MDN's interactive examples. */
export const sampleVideo = [
  {
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    type: 'video/webm',
  },
  {
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    type: 'video/mp4',
  },
]
