import type * as React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/locale-provider'
import { vi as viMessages } from '../../i18n/vi'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../resizable'

/*
 * jsdom has no layout. react-resizable-panels measures panels with offsetWidth/offsetLeft and
 * learns about size changes from ResizeObserver, so both are simulated from the panels' flex-grow.
 */
const GROUP_WIDTH = 1000
const observers = new Set<FakeResizeObserver>()

class FakeResizeObserver {
  targets = new Set<Element>()
  constructor(private callback: ResizeObserverCallback) {
    observers.add(this)
  }
  observe(target: Element) {
    this.targets.add(target)
    queueMicrotask(() => this.notify([target]))
  }
  unobserve(target: Element) {
    this.targets.delete(target)
  }
  disconnect() {
    this.targets.clear()
    observers.delete(this)
  }
  notify(targets: Iterable<Element>) {
    const entries = [...targets].map((target) => {
      const width = (target as HTMLElement).offsetWidth
      return {
        target,
        borderBoxSize: [{ inlineSize: width, blockSize: 400 }],
        contentBoxSize: [{ inlineSize: width, blockSize: 400 }],
        contentRect: { width, height: 400 },
      } as unknown as ResizeObserverEntry
    })
    this.callback(entries, this as unknown as ResizeObserver)
  }
}

/** Let observers report the current sizes, like a browser would after a layout change. */
const flushResize = () =>
  act(async () => {
    for (const observer of observers) observer.notify(observer.targets)
  })

const panelWidth = (el: HTMLElement) => (parseFloat(el.style.flex) / 100) * GROUP_WIDTH

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.dataset.group !== undefined) return GROUP_WIDTH
    if (this.dataset.panel !== undefined) return panelWidth(this) || GROUP_WIDTH / 2
    return 0
  })
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => 400)
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    // Document order is enough for the library to pair handles with their panels.
    const siblings = [...(this.parentElement?.children ?? [])]
    return siblings.indexOf(this) * 10
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  observers.clear()
})

async function renderGroup(props: Partial<React.ComponentProps<typeof ResizablePanelGroup>> = {}) {
  const onCollapse = vi.fn()
  const onExpand = vi.fn()
  const onLayout = vi.fn()
  const utils = render(
    <ResizablePanelGroup onLayout={onLayout} {...props}>
      <ResizablePanel
        id="library"
        defaultSize="30%"
        minSize={220}
        collapsible
        collapsedSize={34}
        onCollapse={onCollapse}
        onExpand={onExpand}
      >
        {({ collapsed }) => (collapsed ? 'strip' : 'Library')}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel id="editor">Editor</ResizablePanel>
    </ResizablePanelGroup>,
  )
  await flushResize()
  return { ...utils, onCollapse, onExpand, onLayout, handle: screen.getByRole('separator') }
}

describe('Resizable', () => {
  it('labels the handle and applies pixel and percent sizes', async () => {
    const { handle } = await renderGroup()
    expect(handle).toHaveAccessibleName('Resize panels')
    expect(handle).toHaveAttribute('aria-orientation', 'vertical')
    expect(handle).toHaveAttribute('aria-valuenow', '30')
    expect(handle.querySelector('svg')).toBeInTheDocument()
  })

  it('resizes with the arrow keys and reports the layout', async () => {
    const { handle, onLayout } = await renderGroup()
    handle.focus()
    fireEvent.keyDown(handle, { key: 'ArrowRight' })
    expect(handle).toHaveAttribute('aria-valuenow', '35')
    expect(onLayout).toHaveBeenLastCalledWith({ library: 35, editor: 65 })
  })

  it('collapses to a strip and expands back to the previous size', async () => {
    const { handle, onCollapse, onExpand } = await renderGroup()
    handle.focus()
    fireEvent.keyDown(handle, { key: 'ArrowRight' })
    fireEvent.keyDown(handle, { key: 'Home' })
    await flushResize()
    expect(handle).toHaveAttribute('aria-valuenow', '3.4')
    expect(onCollapse).toHaveBeenCalledTimes(1)
    expect(screen.getByText('strip')).toBeInTheDocument()
    expect(document.getElementById('library')).toHaveAttribute('data-collapsed')

    fireEvent.keyDown(handle, { key: 'Enter' })
    await flushResize()
    expect(handle).toHaveAttribute('aria-valuenow', '35')
    expect(onExpand).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Library')).toBeInTheDocument()
  })

  it('resets to the default sizes on double-click', async () => {
    const { handle } = await renderGroup()
    handle.focus()
    fireEvent.keyDown(handle, { key: 'ArrowRight' })
    fireEvent.keyDown(handle, { key: 'ArrowRight' })
    expect(handle).toHaveAttribute('aria-valuenow', '40')
    fireEvent.doubleClick(handle)
    expect(handle).toHaveAttribute('aria-valuenow', '30')
  })

  it('remembers the layout with autoSaveId', async () => {
    window.localStorage.clear()
    const first = await renderGroup({ autoSaveId: 'editor-layout' })
    first.handle.focus()
    fireEvent.keyDown(first.handle, { key: 'ArrowRight' })
    first.unmount()

    const second = await renderGroup({ autoSaveId: 'editor-layout' })
    expect(second.handle).toHaveAttribute('aria-valuenow', '35')
  })

  it('stacks vertically and translates the handle label', async () => {
    render(
      <LocaleProvider messages={viMessages}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel id="layers">Layers</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel id="properties">Properties</ResizablePanel>
        </ResizablePanelGroup>
      </LocaleProvider>,
    )
    await flushResize()
    const handle = screen.getByRole('separator', { name: 'Đổi kích thước khung' })
    expect(handle).toHaveAttribute('aria-orientation', 'horizontal')
  })
})
