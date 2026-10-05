import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/locale-provider'
import { vi as viMessages } from '../../i18n/vi'
import { AppWindowFrame } from '../app-window-frame'
import { Changelog, type ChangelogRelease } from '../changelog'
import { VideoPlayer } from '../video-player'

/* IntersectionObserver stub that tests can trigger. */
class ObserverStub {
  static instances: ObserverStub[] = []
  constructor(
    public callback: IntersectionObserverCallback,
    public options: IntersectionObserverInit = {},
  ) {
    ObserverStub.instances.push(this)
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
  trigger(isIntersecting: boolean) {
    act(() =>
      this.callback(
        [{ isIntersecting } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      ),
    )
  }
}

const loadObserver = () => ObserverStub.instances.find((o) => o.options.rootMargin)!
const viewObserver = () => ObserverStub.instances.find((o) => !o.options.rootMargin)!

function mockReducedMotion(reduce: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: reduce && query.includes('reduce'),
      addEventListener() {},
      removeEventListener() {},
    }),
  })
}

const sources = [{ src: '/demo.webm' }, { src: '/demo.mp4' }]

describe('VideoPlayer', () => {
  let play: ReturnType<typeof vi.spyOn>
  let pause: ReturnType<typeof vi.spyOn>
  let load: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    ObserverStub.instances = []
    vi.stubGlobal('IntersectionObserver', ObserverStub)
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    load = vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    Reflect.deleteProperty(window, 'matchMedia')
  })

  it('loads only near the viewport, plays in view and pauses when scrolled away', () => {
    render(<VideoPlayer sources={sources} poster="/poster.jpg" aria-label="Demo" />)
    const video = screen.getByLabelText('Demo') as HTMLVideoElement
    expect(video.querySelectorAll('source')).toHaveLength(0)
    expect(video).toHaveAttribute('preload', 'none')

    loadObserver().trigger(true)
    const types = [...video.querySelectorAll('source')].map((s) => s.getAttribute('type'))
    expect(types).toEqual(['video/webm', 'video/mp4'])
    expect(load).toHaveBeenCalled()

    viewObserver().trigger(true)
    expect(play).toHaveBeenCalledTimes(1)
    viewObserver().trigger(false)
    expect(pause).toHaveBeenCalled()
  })

  it('keeps the user’s pause and toggles its button label', async () => {
    const user = userEvent.setup()
    render(<VideoPlayer sources={sources} aria-label="Demo" />)
    const video = screen.getByLabelText('Demo')
    loadObserver().trigger(true)
    viewObserver().trigger(true)
    fireEvent.play(video)
    Object.defineProperty(video, 'paused', { configurable: true, value: false })
    await user.click(screen.getByRole('button', { name: 'Pause video' }))
    expect(pause).toHaveBeenCalled()
    fireEvent.pause(video)
    expect(screen.getByRole('button', { name: 'Play video' })).toBeInTheDocument()

    play.mockClear()
    viewObserver().trigger(false)
    viewObserver().trigger(true)
    expect(play).not.toHaveBeenCalled()
  })

  it('does not autoplay with reduced motion', async () => {
    mockReducedMotion(true)
    const user = userEvent.setup()
    render(<VideoPlayer sources={sources} aria-label="Demo" />)
    loadObserver().trigger(true)
    viewObserver().trigger(true)
    expect(play).not.toHaveBeenCalled()
    const button = screen.getByRole('button', { name: 'Play video' })
    expect(button).toHaveClass('size-16')
    await user.click(button)
    expect(play).toHaveBeenCalledTimes(1)
  })

  it('hides the floating button with native controls and translates labels', () => {
    const { rerender } = render(
      <LocaleProvider messages={viMessages}>
        <VideoPlayer sources={sources} aria-label="Demo" />
      </LocaleProvider>,
    )
    expect(screen.getByRole('button', { name: 'Phát video' })).toBeInTheDocument()
    rerender(<VideoPlayer sources={sources} aria-label="Demo" controls />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Demo')).toHaveAttribute('controls')
  })
})

describe('AppWindowFrame', () => {
  it('renders each chrome with its title', () => {
    const { rerender } = render(
      <AppWindowFrame title="Playlist Video Maker" glow>
        <img alt="Screenshot" />
      </AppWindowFrame>,
    )
    const frame = document.querySelector('[data-slot="app-window-frame"]')!
    expect(frame).toHaveAttribute('data-variant', 'macos')
    expect(screen.getByText('Playlist Video Maker')).toBeInTheDocument()
    expect(screen.getByAltText('Screenshot')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="app-window-glow"]')).toBeInTheDocument()

    rerender(<AppWindowFrame variant="windows" title="Settings" />)
    expect(frame).toHaveAttribute('data-variant', 'windows')
    expect(screen.getByText('Settings')).toBeInTheDocument()

    rerender(<AppWindowFrame variant="minimal" />)
    expect(document.querySelector('[data-slot="app-window-titlebar"]')).not.toBeInTheDocument()
  })
})

describe('Changelog', () => {
  const releases: ChangelogRelease[] = [
    {
      version: 'v0.2.0',
      date: '2026-10-05',
      title: 'Kanban and Vietnamese',
      changes: [
        { type: 'new', content: 'Kanban board' },
        { type: 'fixed', content: 'Calendar focus in RTL' },
      ],
    },
    { version: '0.1.0', date: '2026-10-04', changes: [{ type: 'improved', content: 'Docs' }] },
  ]

  afterEach(() => {
    window.history.replaceState(null, '', '/')
    vi.restoreAllMocks()
  })

  it('renders versions with anchors, local dates and change labels', () => {
    render(
      <LocaleProvider locale="vi-VN" messages={viMessages}>
        <Changelog releases={releases} />
      </LocaleProvider>,
    )
    expect(document.getElementById('v0.2.0')).toBeInTheDocument()
    expect(document.getElementById('v0.1.0')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Liên kết tới phiên bản v0.2.0' })).toHaveAttribute(
      'href',
      '#v0.2.0',
    )
    const time = document.querySelector('time')!
    expect(time).toHaveAttribute('dateTime', '2026-10-05')
    expect(time).toHaveTextContent(
      new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(2026, 9, 5)),
    )
    expect(screen.getByText('Mới')).toBeInTheDocument()
    expect(screen.getByText('Sửa lỗi')).toBeInTheDocument()
    expect(screen.getByText('Cải thiện')).toBeInTheDocument()
  })

  it('scrolls to the release in the URL hash on mount', () => {
    window.history.replaceState(null, '', '/#v0.1.0')
    const scroll = vi.spyOn(Element.prototype, 'scrollIntoView')
    render(<Changelog releases={releases} />)
    expect(scroll).toHaveBeenCalledTimes(1)
    expect(scroll.mock.contexts[0]).toBe(document.getElementById('v0.1.0'))
  })
})
