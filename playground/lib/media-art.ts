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

/** A shaded head-and-shoulders bust on a transparent background (for halftone and particle demos). */
function bust() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
<defs>
<radialGradient id="head" cx="42%" cy="36%" r="68%"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#b9b9b9"/><stop offset="0.85" stop-color="#4a4a4a"/><stop offset="1" stop-color="#1c1c1c"/></radialGradient>
<linearGradient id="neck" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a3a3a"/><stop offset="0.45" stop-color="#9a9a9a"/><stop offset="1" stop-color="#2a2a2a"/></linearGradient>
<radialGradient id="body" cx="45%" cy="10%" r="90%"><stop offset="0" stop-color="#c8c8c8"/><stop offset="0.5" stop-color="#6c6c6c"/><stop offset="1" stop-color="#1a1a1a"/></radialGradient>
<filter id="s"><feGaussianBlur stdDeviation="14"/></filter>
<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.72" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="m"><rect width="1000" height="1000" fill="url(#fade)"/></mask>
</defs>
<g mask="url(#m)">
<path d="M130 1000 C150 800 300 720 420 690 L580 690 C700 720 850 800 870 1000 Z" fill="url(#body)"/>
<path d="M415 560 L585 560 L600 720 C540 760 460 760 400 720 Z" fill="url(#neck)"/>
<ellipse cx="500" cy="395" rx="185" ry="235" fill="url(#head)"/>
<g filter="url(#s)">
<ellipse cx="430" cy="380" rx="48" ry="26" fill="#2a2a2a" opacity="0.75"/>
<ellipse cx="575" cy="380" rx="48" ry="26" fill="#1e1e1e" opacity="0.8"/>
<ellipse cx="505" cy="455" rx="26" ry="70" fill="#ffffff" opacity="0.9"/>
<ellipse cx="415" cy="470" rx="45" ry="38" fill="#ffffff" opacity="0.45"/>
<ellipse cx="505" cy="545" rx="58" ry="16" fill="#2a2a2a" opacity="0.6"/>
<ellipse cx="610" cy="470" rx="38" ry="60" fill="#111" opacity="0.35"/>
<ellipse cx="470" cy="250" rx="110" ry="55" fill="#ffffff" opacity="0.55"/>
</g>
</g>
</svg>`
  return toDataUri(svg)
}

/** A night landscape: stars, layered mountains, warm lights (for the pixel trail demo). */
function nightscape() {
  const rand = seeded(11)
  const stars = Array.from({ length: 220 }, () => {
    const r = rand() * 1.8 + 0.4
    return `<circle cx="${rand() * W}" cy="${rand() * H * 0.55}" r="${r}" fill="#e8f0ff" opacity="${0.3 + rand() * 0.7}"/>`
  }).join('')
  const lights = Array.from({ length: 40 }, () => {
    const x = 200 + rand() * 1200
    const y = 720 + rand() * 120
    return `<circle cx="${x}" cy="${y}" r="${2 + rand() * 3}" fill="#ffd27a" opacity="${0.5 + rand() * 0.5}"/>`
  }).join('')
  return frame(
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050b24"/><stop offset="0.55" stop-color="#173b8f"/><stop offset="0.8" stop-color="#3a5fc4"/><stop offset="1" stop-color="#0b1330"/></linearGradient><radialGradient id="glow" cx="50%" cy="78%" r="45%"><stop offset="0" stop-color="#ffb35c" stop-opacity="0.55"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>',
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>${stars}<rect width="${W}" height="${H}" fill="url(#glow)"/><path d="M0 640 L180 520 L330 600 L520 450 L700 580 L880 470 L1080 600 L1260 500 L1450 590 L1600 540 L1600 1000 L0 1000 Z" fill="#14244f"/><path d="M0 740 L220 640 L420 720 L640 620 L860 730 L1080 650 L1300 730 L1600 660 L1600 1000 L0 1000 Z" fill="#0b1636"/><g filter="url(#soft)">${lights}</g>${lights}<path d="M0 860 C300 820 500 880 800 850 C1100 820 1300 880 1600 850 L1600 1000 L0 1000 Z" fill="#050a1c"/><path d="M60 1000 L60 600 C70 520 120 470 150 420 M150 420 C190 380 230 360 280 350" stroke="#05081a" stroke-width="22" fill="none"/>`,
  )
}

export const artworks = {
  bust: bust(),
  nightscape: nightscape(),
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
