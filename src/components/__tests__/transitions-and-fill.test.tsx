import { act, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { INSTANT_CLASS, suspendTransitions, withoutTransitions } from '../../theme/transitions'
import { Kanban } from '../kanban'

const nextFrame = () =>
  act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))
const root = () => document.documentElement

describe('suspendTransitions', () => {
  it('turns transitions off until restored, then back on after a frame', async () => {
    const restore = suspendTransitions()
    expect(root()).toHaveClass(INSTANT_CLASS)
    restore()
    // Still off for the frame in which the new colors are painted.
    expect(root()).toHaveClass(INSTANT_CLASS)
    await nextFrame()
    expect(root()).not.toHaveClass(INSTANT_CLASS)
  })

  it('handles overlapping calls', async () => {
    const first = suspendTransitions()
    const second = suspendTransitions()
    first()
    await nextFrame()
    expect(root()).toHaveClass(INSTANT_CLASS)
    second()
    second() // restoring twice is harmless
    await nextFrame()
    expect(root()).not.toHaveClass(INSTANT_CLASS)
  })

  it("leaves the app's own class on <html> alone", async () => {
    root().classList.add(INSTANT_CLASS)
    suspendTransitions()()
    await nextFrame()
    expect(root()).toHaveClass(INSTANT_CLASS)
    root().classList.remove(INSTANT_CLASS)
  })

  it('withoutTransitions runs the change with transitions off', async () => {
    let during = false
    withoutTransitions(() => {
      during = root().classList.contains(INSTANT_CLASS)
    })
    expect(during).toBe(true)
    await nextFrame()
    expect(root()).not.toHaveClass(INSTANT_CLASS)
  })
})

describe('Kanban columnWidth="fill"', () => {
  it('shares the width between columns down to minColumnWidth', () => {
    render(
      <Kanban
        columns={[
          { id: 'a', title: 'A' },
          { id: 'b', title: 'B' },
        ]}
        defaultValue={{ a: [], b: [] }}
        columnWidth="fill"
        minColumnWidth={240}
        renderCard={() => null}
      />,
    )
    const column = document.querySelector<HTMLElement>('[data-kanban-column="a"]')!
    expect(column).toHaveAttribute('data-fill')
    expect(column.style.flexGrow).toBe('1')
    expect(column.style.flexBasis).toBe('0px')
    expect(column.style.minWidth).toBe('240px')
    expect(column.style.width).toBe('')
  })

  it('keeps fixed widths by default', () => {
    render(
      <Kanban
        columns={[{ id: 'a', title: 'A' }]}
        defaultValue={{ a: [] }}
        renderCard={() => null}
      />,
    )
    expect(document.querySelector<HTMLElement>('[data-kanban-column="a"]')!.style.width).toBe(
      '288px',
    )
  })
})
