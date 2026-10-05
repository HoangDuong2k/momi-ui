import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/locale-provider'
import { vi as viMessages } from '../../i18n/vi'
import { SortableHandle, SortableList } from '../sortable-list'

interface Song {
  id: string
  title: string
}

const songs: Song[] = [
  { id: 'a', title: 'Intro' },
  { id: 'b', title: 'Blue' },
  { id: 'c', title: 'Coda' },
]

const row = (title: string) =>
  [...document.querySelectorAll<HTMLElement>('[data-sortable-item]')].find((li) =>
    li.textContent?.startsWith(title),
  )!
const order = () =>
  [...document.querySelectorAll<HTMLElement>('[data-sortable-item]')].map((li) => li.textContent)

/** Rows 40px tall, stacked from the top. */
function mockRowRects() {
  const original = HTMLElement.prototype.getBoundingClientRect
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.dataset.sortableItem !== undefined) {
      const rows = [...(this.parentElement?.children ?? [])]
      const top = rows.indexOf(this) * 40
      return {
        top,
        bottom: top + 40,
        height: 40,
        left: 0,
        right: 300,
        width: 300,
        x: 0,
        y: top,
        toJSON() {},
      } as DOMRect
    }
    return original.call(this)
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('SortableList', () => {
  it('reorders with the keyboard and keeps focus on the moved row', async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    const onValueChange = vi.fn()
    render(
      <SortableList
        aria-label="Playlist"
        value={songs}
        onValueChange={onValueChange}
        onReorder={onReorder}
        getItemLabel={(s) => s.title}
        renderItem={(s) => s.title}
      />,
    )
    row('Intro').focus()
    await user.keyboard(' ')
    expect(row('Intro')).toHaveAttribute('data-lifted')
    expect(screen.getByText('Picked up Intro. Position 1 of 3.')).toBeInTheDocument()

    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(order()).toEqual(['Blue', 'Coda', 'Intro'])
    expect(document.activeElement).toBe(row('Intro'))
    expect(onReorder).not.toHaveBeenCalled()

    await user.keyboard(' ')
    expect(onValueChange).toHaveBeenCalledWith([songs[1], songs[2], songs[0]])
    expect(onReorder).toHaveBeenCalledWith(
      expect.objectContaining({
        item: songs[0],
        from: 0,
        to: 2,
      }),
    )
    expect(screen.getByText('Dropped Intro at position 3 of 3.')).toBeInTheDocument()
  })

  it('cancels with Escape and jumps with Home / End', async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    const onValueChange = vi.fn()
    render(
      <SortableList
        value={songs}
        onValueChange={onValueChange}
        onReorder={onReorder}
        renderItem={(s) => s.title}
      />,
    )
    row('Coda').focus()
    await user.keyboard(' {Home}')
    expect(order()).toEqual(['Coda', 'Intro', 'Blue'])
    await user.keyboard('{End}{Escape}')
    expect(order()).toEqual(['Intro', 'Blue', 'Coda'])
    expect(onReorder).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(row('Coda'))
  })

  it('moves focus between rows with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<SortableList value={songs} renderItem={(s) => s.title} />)
    row('Intro').focus()
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(row('Blue'))
    await user.keyboard('{ArrowUp}')
    expect(document.activeElement).toBe(row('Intro'))
  })

  it('drags a row with the pointer and draws a drop line', () => {
    mockRowRects()
    const onReorder = vi.fn()
    const onValueChange = vi.fn()
    render(
      <SortableList
        value={songs}
        onValueChange={onValueChange}
        onReorder={onReorder}
        renderItem={(s) => s.title}
      />,
    )
    fireEvent.pointerDown(row('Intro'), { button: 0, clientX: 50, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 50, clientY: 110, pointerId: 1 })

    expect(document.querySelector('[data-slot="sortable-overlay"]')).toHaveTextContent('Intro')
    expect(row('Intro')).toHaveAttribute('data-dragging')
    expect(row('Coda').querySelector('[data-slot="sortable-indicator"]')).toBeInTheDocument()

    fireEvent.pointerUp(window, { clientX: 50, clientY: 110, pointerId: 1 })
    expect(onValueChange).toHaveBeenCalledWith([songs[1], songs[2], songs[0]])
    expect(onReorder).toHaveBeenCalledWith(
      expect.objectContaining({
        item: songs[0],
        from: 0,
        to: 2,
      }),
    )
    expect(document.querySelector('[data-slot="sortable-overlay"]')).not.toBeInTheDocument()
  })

  it('leaves buttons inside rows alone and ignores the click after a drag', () => {
    mockRowRects()
    const onReorder = vi.fn()
    const onValueChange = vi.fn()
    const onPlay = vi.fn()
    render(
      <SortableList
        value={songs}
        onValueChange={onValueChange}
        onReorder={onReorder}
        renderItem={(s) => (
          <>
            {s.title}
            <button type="button" onClick={onPlay}>
              Play {s.title}
            </button>
          </>
        )}
      />,
    )
    const play = screen.getByRole('button', { name: 'Play Blue' })
    fireEvent.pointerDown(play, { button: 0, clientX: 50, clientY: 60, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 50, clientY: 110, pointerId: 1 })
    expect(document.querySelector('[data-slot="sortable-overlay"]')).not.toBeInTheDocument()
    fireEvent.pointerUp(window, { clientX: 50, clientY: 110, pointerId: 1 })
    fireEvent.click(play)
    expect(onPlay).toHaveBeenCalledTimes(1)

    // A real drag from the row: the click that follows must not reach the button.
    fireEvent.pointerDown(row('Blue'), { button: 0, clientX: 10, clientY: 60, pointerId: 2 })
    fireEvent.pointerMove(window, { clientX: 10, clientY: 5, pointerId: 2 })
    fireEvent.pointerUp(window, { clientX: 10, clientY: 5, pointerId: 2 })
    fireEvent.click(play)
    expect(onPlay).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith([songs[1], songs[0], songs[2]])
    expect(onReorder).toHaveBeenCalledWith(expect.objectContaining({ from: 1, to: 0 }))
  })

  it('drags only by the handle in handle mode', async () => {
    mockRowRects()
    const user = userEvent.setup()
    const onReorder = vi.fn()
    const onValueChange = vi.fn()
    render(
      <SortableList
        value={songs}
        handle
        onValueChange={onValueChange}
        onReorder={onReorder}
        getItemLabel={(s) => s.title}
        renderItem={(s) => (
          <>
            <SortableHandle />
            {s.title}
          </>
        )}
      />,
    )
    expect(row('Intro')).not.toHaveAttribute('tabindex')
    fireEvent.pointerDown(row('Intro'), { button: 0, clientX: 50, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 50, clientY: 110, pointerId: 1 })
    expect(document.querySelector('[data-slot="sortable-overlay"]')).not.toBeInTheDocument()
    fireEvent.pointerUp(window, { clientX: 50, clientY: 110, pointerId: 1 })

    // Touch on a handle drags right away (no press-and-hold).
    const handle = screen.getByRole('button', { name: 'Reorder Coda' })
    fireEvent.pointerDown(handle, {
      button: 0,
      clientX: 10,
      clientY: 100,
      pointerId: 3,
      pointerType: 'touch',
    })
    fireEvent.pointerMove(window, { clientX: 10, clientY: 5, pointerId: 3, pointerType: 'touch' })
    expect(document.querySelector('[data-slot="sortable-overlay"]')).toHaveTextContent('Coda')
    fireEvent.pointerUp(window, { clientX: 10, clientY: 5, pointerId: 3, pointerType: 'touch' })
    expect(onValueChange).toHaveBeenLastCalledWith([songs[2], songs[0], songs[1]])
    expect(onReorder).toHaveBeenLastCalledWith(expect.objectContaining({ from: 2, to: 0 }))

    screen.getByRole('button', { name: 'Reorder Intro' }).focus()
    await user.keyboard(' {ArrowDown} ')
    expect(onValueChange).toHaveBeenLastCalledWith([songs[1], songs[0], songs[2]])
    expect(onReorder).toHaveBeenLastCalledWith(expect.objectContaining({ from: 0, to: 1 }))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Reorder Intro' }))
  })

  it('uses left / right in a horizontal list', async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    const onValueChange = vi.fn()
    render(
      <SortableList
        value={songs}
        orientation="horizontal"
        onValueChange={onValueChange}
        onReorder={onReorder}
        renderItem={(s) => s.title}
      />,
    )
    row('Intro').focus()
    await user.keyboard(' {ArrowRight} ')
    expect(onValueChange).toHaveBeenCalledWith([songs[1], songs[0], songs[2]])
    expect(onReorder).toHaveBeenCalledWith(expect.objectContaining({ from: 0, to: 1 }))
  })

  it('does nothing when disabled', async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    const onValueChange = vi.fn()
    render(
      <SortableList
        value={songs}
        disabled
        onValueChange={onValueChange}
        onReorder={onReorder}
        renderItem={(s) => s.title}
      />,
    )
    expect(row('Blue')).not.toHaveAttribute('tabindex')
    fireEvent.pointerDown(row('Blue'), { button: 0, clientX: 0, clientY: 0, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 0, clientY: 200, pointerId: 1 })
    expect(document.querySelector('[data-slot="sortable-overlay"]')).not.toBeInTheDocument()
    row('Blue').focus()
    await user.keyboard(' ')
    expect(row('Blue')).not.toHaveAttribute('data-lifted')
  })

  it('translates its labels', () => {
    render(
      <LocaleProvider messages={viMessages}>
        <SortableList
          value={songs}
          handle
          getItemLabel={(s) => s.title}
          renderItem={(s) => (
            <>
              <SortableHandle />
              {s.title}
            </>
          )}
        />
      </LocaleProvider>,
    )
    expect(screen.getByRole('button', { name: 'Di chuyển Intro' })).toBeInTheDocument()
  })
})

describe('SortableList state', () => {
  it('keeps its own order when uncontrolled', async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    render(<SortableList defaultValue={songs} onReorder={onReorder} renderItem={(s) => s.title} />)
    row('Intro').focus()
    await user.keyboard(' {ArrowDown} ')
    expect(order()).toEqual(['Blue', 'Intro', 'Coda'])
    expect(onReorder).toHaveBeenCalledWith({ item: songs[0], itemId: songs[0].id, from: 0, to: 1 })
  })
})
