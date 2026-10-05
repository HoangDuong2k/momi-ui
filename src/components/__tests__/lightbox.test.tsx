import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/locale-provider'
import { vi as viMessages } from '../../i18n/vi'
import { Lightbox, type LightboxItem } from '../lightbox'

const photos: LightboxItem[] = [
  { src: '/a.jpg', alt: 'Aurora', caption: 'Northern lights' },
  { src: '/b.jpg', alt: 'Bloom', caption: 'Spring' },
  { src: '/c.jpg', alt: 'Canyon' },
]

function Gallery({
  items = photos,
  loop,
  onIndexChange,
}: {
  items?: LightboxItem[]
  loop?: boolean
  onIndexChange?: (index: number | null) => void
}) {
  const [index, setIndex] = useState<number | null>(null)
  return (
    <>
      {items.map((item, i) => (
        <button key={item.src} type="button" onClick={() => setIndex(i)}>
          Open {item.alt}
        </button>
      ))}
      <Lightbox
        items={items}
        index={index}
        loop={loop}
        onIndexChange={(next) => {
          setIndex(next)
          onIndexChange?.(next)
        }}
      />
    </>
  )
}

const counter = () => document.querySelector('[data-slot="lightbox-counter"]')?.textContent

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Lightbox', () => {
  it('opens at an item and moves with the arrow keys and buttons', async () => {
    const user = userEvent.setup()
    const onIndexChange = vi.fn()
    render(<Gallery onIndexChange={onIndexChange} />)
    await user.click(screen.getByRole('button', { name: 'Open Bloom' }))

    const dialog = screen.getByRole('dialog', { name: 'Media viewer' })
    expect(dialog).toHaveAccessibleDescription('Item 2 of 3. Spring')
    expect(screen.getByRole('img', { name: 'Bloom' })).toBeInTheDocument()
    expect(counter()).toBe('2 / 3')

    await user.keyboard('{ArrowRight}')
    expect(counter()).toBe('3 / 3')
    const next = screen.getByRole('button', { name: 'Next' })
    expect(next).toHaveAttribute('aria-disabled', 'true')
    // The last item keeps focus on the (inert) button, so the arrow keys keep working.
    next.focus()
    await user.click(next)
    expect(counter()).toBe('3 / 3')
    await user.keyboard('{ArrowLeft}')
    expect(counter()).toBe('2 / 3')
    await user.keyboard('{ArrowRight}')

    await user.click(screen.getByRole('button', { name: 'Previous' }))
    await user.keyboard('{Home}')
    expect(screen.getByRole('img', { name: 'Aurora' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(onIndexChange).toHaveBeenLastCalledWith(null)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('wraps around with loop', async () => {
    const user = userEvent.setup()
    render(<Gallery loop />)
    await user.click(screen.getByRole('button', { name: 'Open Canyon' }))
    await user.keyboard('{ArrowRight}')
    expect(counter()).toBe('1 / 3')
    await user.keyboard('{ArrowLeft}')
    expect(counter()).toBe('3 / 3')
  })

  it('changes item with a horizontal swipe', async () => {
    const user = userEvent.setup()
    render(<Gallery />)
    await user.click(screen.getByRole('button', { name: 'Open Aurora' }))
    const stage = document.querySelector('[data-slot="lightbox-stage"]')!
    fireEvent.pointerDown(stage, { button: 0, pointerId: 1, clientX: 300, clientY: 200 })
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 180, clientY: 205 })
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 180, clientY: 205 })
    expect(counter()).toBe('2 / 3')
  })

  it('pauses a video when switching items or closing', async () => {
    const user = userEvent.setup()
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    render(
      <Gallery
        items={[
          { type: 'video', src: '/clip.mp4', alt: 'Clip' },
          { src: '/d.jpg', alt: 'Dunes' },
        ]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open Clip' }))
    expect(document.querySelector('video source')).toHaveAttribute('src', '/clip.mp4')
    pause.mockClear()
    await user.keyboard('{ArrowRight}')
    expect(pause).toHaveBeenCalled()
    expect(screen.getByRole('img', { name: 'Dunes' })).toBeInTheDocument()
  })

  it('translates its labels', async () => {
    const user = userEvent.setup()
    render(
      <LocaleProvider messages={viMessages}>
        <Gallery />
      </LocaleProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Open Aurora' }))
    expect(screen.getByRole('dialog', { name: 'Xem ảnh và video' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sau' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument()
  })
})
