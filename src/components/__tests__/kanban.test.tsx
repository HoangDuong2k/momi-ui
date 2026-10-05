import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Kanban, moveKanbanItem, type KanbanColumn, type KanbanValue } from '../kanban'

interface Task {
  id: string
  title: string
}

const columns: KanbanColumn[] = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'Doing', limit: 1 },
  { id: 'done', title: 'Done' },
]

const board: KanbanValue<Task> = {
  todo: [
    { id: 'a', title: 'Write spec' },
    { id: 'b', title: 'Design' },
  ],
  doing: [{ id: 'c', title: 'Build' }],
  done: [],
}

const renderCard = (task: Task) => <span>{task.title}</span>

const card = (title: string) => screen.getByText(title).closest('li')!
const cardTitles = (columnTitle: string) =>
  within(screen.getByRole('region', { name: columnTitle }).closest('section')!)
    .queryAllByRole('listitem')
    .filter((li) => li.dataset.kanbanCard !== undefined)
    .map((li) => li.textContent)

afterEach(() => {
  vi.restoreAllMocks()
})

describe('moveKanbanItem', () => {
  it('moves within and across columns without mutating the input', () => {
    const within = moveKanbanItem(
      board,
      { columnId: 'todo', index: 0 },
      { columnId: 'todo', index: 1 },
    )
    expect(within.todo.map((t) => t.id)).toEqual(['b', 'a'])
    const across = moveKanbanItem(
      board,
      { columnId: 'todo', index: 1 },
      { columnId: 'done', index: 0 },
    )
    expect(across.todo.map((t) => t.id)).toEqual(['a'])
    expect(across.done.map((t) => t.id)).toEqual(['b'])
    expect(board.todo).toHaveLength(2)
  })
})

describe('Kanban', () => {
  it('renders columns with counts, WIP limits and empty states', () => {
    render(
      <Kanban
        columns={[...columns.slice(0, 2), { id: 'done', title: 'Done' }]}
        defaultValue={{ ...board, doing: [...board.doing, { id: 'd', title: 'Ship' }] }}
        renderCard={renderCard}
      />,
    )
    const sections = document.querySelectorAll('[data-slot="kanban-column"]')
    expect(sections).toHaveLength(3)
    expect(within(sections[0] as HTMLElement).getByText('2 cards')).toBeInTheDocument()
    const doingCount = sections[1].querySelector('[data-slot="kanban-count"]')!
    expect(doingCount).toHaveAttribute('data-over-limit')
    expect(doingCount).toHaveTextContent('2/1')
    expect(within(sections[2] as HTMLElement).getByText('No cards')).toBeInTheDocument()
  })

  it('moves a card with the keyboard: Space, arrows, Space', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onCardMove = vi.fn()
    render(
      <Kanban
        columns={columns}
        defaultValue={board}
        onValueChange={onValueChange}
        onCardMove={onCardMove}
        renderCard={renderCard}
        getItemLabel={(t) => t.title}
      />,
    )
    card('Design').focus()
    await user.keyboard(' ')
    expect(card('Design')).toHaveAttribute('data-lifted')
    expect(screen.getByText(/Picked up Design/)).toBeInTheDocument()

    await user.keyboard('{ArrowRight}')
    // Previewed in the new column, focus follows the card.
    expect(cardTitles('Doing')).toEqual(['Build', 'Design'])
    expect(document.activeElement).toBe(card('Design'))
    await user.keyboard('{ArrowUp}')
    expect(cardTitles('Doing')).toEqual(['Design', 'Build'])
    expect(onValueChange).not.toHaveBeenCalled()

    await user.keyboard(' ')
    expect(onCardMove).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 'b',
        from: { columnId: 'todo', index: 1 },
        to: { columnId: 'doing', index: 0 },
      }),
    )
    expect(onValueChange.mock.calls[0][0].doing.map((t: Task) => t.id)).toEqual(['b', 'c'])
    expect(screen.getByText('Dropped Design in Doing, position 1 of 2.')).toBeInTheDocument()
    expect(document.activeElement).toBe(card('Design'))
  })

  it('cancels a keyboard move with Escape', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Kanban
        columns={columns}
        defaultValue={board}
        onValueChange={onValueChange}
        renderCard={renderCard}
      />,
    )
    card('Write spec').focus()
    await user.keyboard(' {ArrowRight}{ArrowRight}{Escape}')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(cardTitles('To do')).toEqual(['Write spec', 'Design'])
    expect(document.activeElement).toBe(card('Write spec'))
    expect(screen.getByText(/Move cancelled/)).toBeInTheDocument()
  })

  it('skips columns that canMove refuses', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Kanban
        columns={columns}
        defaultValue={board}
        onValueChange={onValueChange}
        canMove={({ to }) => to.columnId !== 'doing'}
        renderCard={renderCard}
      />,
    )
    card('Design').focus()
    await user.keyboard(' {ArrowRight} ')
    expect(onValueChange.mock.calls[0][0].done.map((t: Task) => t.id)).toEqual(['b'])
  })

  it('moves focus between cards with the arrow keys and opens cards with Enter', async () => {
    const user = userEvent.setup()
    const onCardClick = vi.fn()
    render(
      <Kanban
        columns={columns}
        defaultValue={board}
        renderCard={renderCard}
        onCardClick={onCardClick}
      />,
    )
    card('Write spec').focus()
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(card('Design'))
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(card('Build'))
    await user.keyboard('{Enter}')
    expect(onCardClick).toHaveBeenCalledWith(board.doing[0])
  })

  it('drags a card with the pointer into another column', () => {
    // Columns 300px apart; cards 60px apart, starting 50px from the top.
    const original = HTMLElement.prototype.getBoundingClientRect
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const rect = (left: number, top: number, width: number, height: number) =>
        ({
          left,
          top,
          width,
          height,
          right: left + width,
          bottom: top + height,
          x: left,
          y: top,
          toJSON() {},
        }) as DOMRect
      const column = this.closest<HTMLElement>('[data-kanban-column]')
      const columnIndex = column
        ? columns.findIndex((c) => c.id === column.dataset.kanbanColumn)
        : -1
      if (this.dataset.kanbanColumn) return rect(columnIndex * 300, 0, 288, 600)
      if (this.dataset.kanbanCard && column) {
        const cards = [...column.querySelectorAll('[data-kanban-card]')]
        return rect(columnIndex * 300 + 8, 50 + cards.indexOf(this) * 60, 272, 50)
      }
      return original.call(this)
    })

    const onValueChange = vi.fn()
    const onCardClick = vi.fn()
    render(
      <Kanban
        columns={columns}
        defaultValue={board}
        onValueChange={onValueChange}
        onCardClick={onCardClick}
        renderCard={renderCard}
      />,
    )
    const source = card('Write spec')
    fireEvent.pointerDown(source, { button: 0, clientX: 100, clientY: 70, pointerId: 1 })
    // Over "Doing", above its first card.
    fireEvent.pointerMove(window, { clientX: 400, clientY: 60, pointerId: 1 })
    expect(document.querySelector('[data-slot="kanban-overlay"]')).toHaveTextContent('Write spec')
    const doing = document.querySelector('[data-kanban-column="doing"]')!
    expect(doing.querySelector('[data-slot="kanban-placeholder"]')).toBeInTheDocument()
    expect(doing.querySelector('[data-slot="kanban-count"]')).toHaveTextContent('2/1')

    fireEvent.pointerUp(window, { clientX: 400, clientY: 60, pointerId: 1 })
    fireEvent.click(source)
    expect(onCardClick).not.toHaveBeenCalled()
    expect(document.querySelector('[data-slot="kanban-overlay"]')).not.toBeInTheDocument()
    const next = onValueChange.mock.calls[0][0] as KanbanValue<Task>
    expect(next.todo.map((t) => t.id)).toEqual(['b'])
    expect(next.doing.map((t) => t.id)).toEqual(['a', 'c'])
  })

  it('treats a press without movement as a click', () => {
    const onCardClick = vi.fn()
    const onValueChange = vi.fn()
    render(
      <Kanban
        columns={columns}
        defaultValue={board}
        onCardClick={onCardClick}
        onValueChange={onValueChange}
        renderCard={renderCard}
      />,
    )
    const target = card('Build')
    fireEvent.pointerDown(target, { button: 0, clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 12, clientY: 11, pointerId: 1 })
    fireEvent.pointerUp(window, { clientX: 12, clientY: 11, pointerId: 1 })
    fireEvent.click(target)
    expect(onCardClick).toHaveBeenCalledTimes(1)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('collapses columns and adds cards', async () => {
    const user = userEvent.setup()
    const onAddCard = vi.fn()
    const onCollapsedChange = vi.fn()
    render(
      <Kanban
        columns={columns}
        defaultValue={board}
        renderCard={renderCard}
        collapsible
        onCollapsedChange={onCollapsedChange}
        onAddCard={onAddCard}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Collapse Done' }))
    expect(onCollapsedChange).toHaveBeenLastCalledWith(['done'])
    expect(document.querySelector('[data-kanban-column="done"]')).toHaveAttribute('data-collapsed')
    await user.click(screen.getByRole('button', { name: 'Expand Done' }))
    expect(onCollapsedChange).toHaveBeenLastCalledWith([])

    await user.click(screen.getAllByRole('button', { name: 'Add card' })[1])
    expect(onAddCard).toHaveBeenCalledWith('doing')
  })

  it('does not drag when disabled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Kanban
        columns={columns}
        defaultValue={board}
        renderCard={renderCard}
        onValueChange={onValueChange}
        disabled
      />,
    )
    expect(card('Build')).not.toHaveAttribute('tabindex')
    fireEvent.pointerDown(card('Build'), { button: 0, clientX: 0, clientY: 0, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 300, clientY: 0, pointerId: 1 })
    expect(document.querySelector('[data-slot="kanban-overlay"]')).not.toBeInTheDocument()
    card('Build').focus()
    await user.keyboard(' ')
    expect(card('Build')).not.toHaveAttribute('data-lifted')
  })
})
