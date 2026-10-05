import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../dialog'
import { Kanban, type KanbanColumn } from '../kanban'
import { NumberField } from '../number-field'
import { Slider } from '../slider'
import { SortableList } from '../sortable-list'
import { Toolbar, ToolbarButton, ToolbarGroup } from '../toolbar'
import { Kbd } from '../typography'
import { LocaleProvider } from '../../i18n/locale-provider'
import { vi as viPack } from '../../i18n/vi'

interface Task {
  id: string
  title: string
}

const columns: KanbanColumn[] = [
  { id: 'a', title: 'A' },
  { id: 'b', title: 'B' },
  { id: 'c', title: 'C' },
]

const card = (title: string) => screen.getByText(title).closest('li')!

describe('review fixes', () => {
  it('Kanban: keyboard moves skip collapsed columns and keep focus', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Kanban
        columns={columns}
        defaultValue={{ a: [{ id: '1', title: 'One' }], b: [], c: [] }}
        collapsible
        defaultCollapsed={['b']}
        onValueChange={onValueChange}
        renderCard={(t: Task) => <span>{t.title}</span>}
      />,
    )
    card('One').focus()
    await user.keyboard(' {ArrowRight}')
    expect(document.activeElement).toBe(card('One'))
    await user.keyboard(' ')
    expect(onValueChange.mock.calls[0][0].c.map((t: Task) => t.id)).toEqual(['1'])
  })

  it('Kanban: clicking a button inside a card does not open the card', async () => {
    const user = userEvent.setup()
    const onCardClick = vi.fn()
    const onMenu = vi.fn()
    render(
      <Kanban
        columns={columns.slice(0, 1)}
        defaultValue={{ a: [{ id: '1', title: 'One' }] }}
        onCardClick={onCardClick}
        renderCard={(t: Task) => (
          <span>
            {t.title}
            <button type="button" onClick={onMenu}>
              More
            </button>
          </span>
        )}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'More' }))
    expect(onMenu).toHaveBeenCalled()
    expect(onCardClick).not.toHaveBeenCalled()
    await user.click(screen.getByText('One'))
    expect(onCardClick).toHaveBeenCalledTimes(1)
  })

  it('SortableList: a consumer ref does not break dragging', async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    const ref = React.createRef<HTMLUListElement>()
    const items = [
      { id: 'x', title: 'Xa' },
      { id: 'y', title: 'Yo' },
    ]
    render(
      <SortableList
        ref={ref}
        value={items}
        onValueChange={onReorder}
        renderItem={(i) => i.title}
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLUListElement)
    screen.getByText('Xa').closest('li')!.focus()
    await user.keyboard(' {ArrowDown} ')
    expect(onReorder).toHaveBeenCalledWith([items[1], items[0]])
    expect(document.activeElement).toBe(screen.getByText('Xa').closest('li'))
  })

  it('NumberField: Escape restores a draft without closing the dialog around it', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Size</DialogTitle>
          <DialogDescription>Width</DialogDescription>
          <NumberField aria-label="Width" defaultValue={10} />
        </DialogContent>
      </Dialog>,
    )
    const input = screen.getByRole('spinbutton', { name: 'Width' })
    await user.click(input)
    await user.clear(input)
    await user.type(input, '42')
    await user.keyboard('{Escape}')
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('10')
    // With no draft, Escape closes the dialog as usual.
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('Slider: a disabled slider ignores double-click reset', () => {
    const onValueChange = vi.fn()
    render(
      <Slider
        disabled
        defaultValue={[30]}
        resetValue={50}
        onValueChange={onValueChange}
        thumbLabels={['Gain']}
      />,
    )
    fireEvent.doubleClick(screen.getByRole('slider', { name: 'Gain' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('Toolbar groups only follow the toolbar orientation', () => {
    render(
      <div data-orientation="vertical">
        <Toolbar aria-label="Edit">
          <ToolbarGroup data-testid="group">
            <ToolbarButton>Cut</ToolbarButton>
          </ToolbarGroup>
        </Toolbar>
      </div>,
    )
    expect(screen.getByTestId('group').className).toContain(
      'group-data-[orientation=vertical]/toolbar:flex-col',
    )
    expect(screen.getByTestId('group').className).not.toContain('in-data-')
  })

  it('speaks shortcut keys in the app language', () => {
    render(
      <LocaleProvider messages={viPack}>
        <Kbd keys="mod+up" />
      </LocaleProvider>,
    )
    // jsdom reports Linux.
    expect(screen.getByText('Ctrl+↑')).toHaveAttribute('aria-label', 'Ctrl+Mũi tên lên')
  })
})
