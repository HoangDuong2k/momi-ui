import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/locale-provider'
import { vi as viPack } from '../../i18n/vi'
import { Dialog, DialogContent, DialogTitle } from '../dialog'
import {
  EventCalendar,
  type CalendarEvent,
  type EventCalendarChange,
  type EventCalendarProps,
} from '../event-calendar'

afterEach(() => {
  vi.restoreAllMocks()
})

// Wednesday, October 7, 2026; weeks start on Monday (Oct 5).
const at = (day: number, hour = 0, minute = 0) => new Date(2026, 9, day, hour, minute)

interface Task extends CalendarEvent {
  owner: string
}

const sample: Task[] = [
  { id: 'review', title: 'Design review', start: at(6, 14), end: at(6, 15, 30), owner: 'An' },
  { id: 'call', title: 'Customer call', start: at(7, 11), end: at(7, 11, 45), owner: 'Bo' },
  { id: 'offsite', title: 'Offsite', start: at(7), end: at(10), allDay: true, owner: 'Cy' },
  { id: 'holiday', title: 'Holiday', start: at(12), allDay: true, editable: false, owner: 'Di' },
]

function Calendar(props: Partial<EventCalendarProps<Task>>) {
  return <EventCalendar<Task> locale="en-US" events={sample} defaultDate={at(7)} {...props} />
}

/** The month or all-day cell for a day of October 2026. */
const cell = (day: number) =>
  document.querySelector<HTMLElement>(`[data-ec-day="2026-10-${String(day).padStart(2, '0')}"]`)!
const primary = (id: string) =>
  document.querySelector<HTMLElement>(`[data-ec-event="${id}"][data-ec-primary]`)!

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

/**
 * Lay out the grid for jsdom: month/all-day cells 100×100 in a 7-column grid; time columns 100px
 * wide from y = 200, inside a scroller covering y 200–1400.
 */
function mockLayout() {
  const original = HTMLElement.prototype.getBoundingClientRect
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.dataset.ecDay) {
      const cells = [...document.querySelectorAll('[data-ec-day]')]
      const index = cells.indexOf(this)
      return rect((index % 7) * 100, Math.floor(index / 7) * 100, 100, 100)
    }
    if (this.dataset.ecCol) {
      const columns = [...document.querySelectorAll('[data-ec-col]')]
      return rect(columns.indexOf(this) * 100, 200, 100, 1152)
    }
    if (this.dataset.slot === 'event-calendar-scroller') return rect(0, 200, 700, 1200)
    return original.call(this)
  })
}

const pointerEvents = {
  pointerdown: fireEvent.pointerDown,
  pointermove: fireEvent.pointerMove,
  pointerup: fireEvent.pointerUp,
} as const

const pointer = (
  type: keyof typeof pointerEvents,
  x: number,
  y: number,
  target: Element | Window = window,
) => {
  pointerEvents[type](target, {
    clientX: x,
    clientY: y,
    pointerId: 1,
    button: 0,
    pointerType: 'mouse',
  })
}

describe('EventCalendar month view', () => {
  it('shows the month with events on their days', () => {
    render(<Calendar />)
    expect(screen.getByRole('heading', { name: 'October 2026' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ])
    // Sep 28 – Nov 1: five weeks.
    expect(screen.getAllByRole('row')).toHaveLength(6)
    expect(within(cell(6)).getByText('Design review')).toBeInTheDocument()
    expect(within(cell(6)).getByText('2:00 PM')).toBeInTheDocument()
    // A multi-day bar is drawn once, in its first cell, spanning three days.
    expect(primary('offsite').closest('[data-ec-day]')).toBe(cell(7))
    expect(primary('offsite').style.width).toBe('calc(300% - 2px)')
    expect(primary('review')).toHaveAccessibleName(
      'Design review, Tuesday, October 6, 2:00 PM – 3:30 PM',
    )
  })

  it('collapses what does not fit into "+N more" with the full list in a popover', async () => {
    const user = userEvent.setup()
    render(<Calendar maxEventsPerDay={1} />)
    const more = within(cell(7)).getByRole('button', { name: '+1 more' })
    await user.click(more)
    const list = screen.getByRole('dialog', { name: 'Wednesday, October 7, 2026' })
    expect(within(list).getByText('Offsite')).toBeInTheDocument()
    expect(within(list).getByText('Customer call')).toBeInTheDocument()
  })

  it('navigates and reports the range on screen', async () => {
    const user = userEvent.setup()
    const onRangeChange = vi.fn()
    const onDateChange = vi.fn()
    render(<Calendar onRangeChange={onRangeChange} onDateChange={onDateChange} />)
    expect(onRangeChange).toHaveBeenLastCalledWith({
      start: new Date(2026, 8, 28),
      end: new Date(2026, 10, 2),
      view: 'month',
    })
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('heading', { name: 'November 2026' })).toBeInTheDocument()
    expect(onDateChange).toHaveBeenLastCalledWith(new Date(2026, 10, 7))
    expect(onRangeChange).toHaveBeenLastCalledWith({
      start: new Date(2026, 9, 26),
      end: new Date(2026, 11, 7),
      view: 'month',
    })
    await user.click(screen.getByRole('radio', { name: 'Week' }))
    expect(screen.getByRole('heading', { name: /^Nov 2\s*–\s*8, 2026$/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(screen.getByRole('heading', { name: /^Oct 26\s*–\s*Nov 1, 2026$/ })).toBeInTheDocument()
  })

  it('opens events by click or Enter with the app’s own object', async () => {
    const user = userEvent.setup()
    const onEventClick = vi.fn()
    render(<Calendar onEventClick={onEventClick} />)
    await user.click(screen.getByText('Customer call'))
    expect(onEventClick).toHaveBeenLastCalledWith(sample[1])
    primary('review').focus()
    await user.keyboard('{Enter}')
    expect(onEventClick).toHaveBeenLastCalledWith(sample[0])
  })

  it('selects days by click, drag and keyboard', async () => {
    const user = userEvent.setup()
    const onSelectRange = vi.fn()
    render(<Calendar onSelectRange={onSelectRange} />)
    mockLayout()
    // Oct 13 is the 16th cell (row 2, column 1): x 150, y 250.
    pointer('pointerdown', 150, 250, cell(13))
    pointer('pointerup', 150, 250)
    expect(onSelectRange).toHaveBeenLastCalledWith({ start: at(13), end: at(14), allDay: true })
    // Drag from Oct 13 to Oct 15.
    pointer('pointerdown', 150, 250, cell(13))
    pointer('pointermove', 250, 250)
    pointer('pointermove', 350, 250)
    expect(cell(14)).toHaveAttribute('aria-selected', 'true')
    pointer('pointerup', 350, 250)
    expect(onSelectRange).toHaveBeenLastCalledWith({ start: at(13), end: at(16), allDay: true })
    // Keyboard: the focused day moves with the arrows, Enter selects it.
    cell(7).focus()
    await user.keyboard('{ArrowRight}{ArrowDown}{Enter}')
    expect(cell(15)).toHaveFocus()
    expect(onSelectRange).toHaveBeenLastCalledWith({ start: at(15), end: at(16), allDay: true })
  })

  it('moves an event by dragging it to another day', () => {
    const onEventChange = vi.fn()
    render(<Calendar onEventChange={onEventChange} />)
    mockLayout()
    // Design review is on Tue Oct 6 (cell 9: x 100–200, y 100–200); drop it on Thu Oct 8.
    pointer('pointerdown', 150, 150, primary('review'))
    pointer('pointermove', 160, 150)
    pointer('pointermove', 350, 150)
    expect(primary('review')).toHaveAttribute('data-dragging')
    pointer('pointerup', 350, 150)
    expect(onEventChange).toHaveBeenCalledWith({
      event: sample[0],
      start: at(8, 14),
      end: at(8, 15, 30),
      allDay: false,
    })
  })

  it('keeps read-only events in place', async () => {
    const user = userEvent.setup()
    const onEventChange = vi.fn()
    render(<Calendar onEventChange={onEventChange} />)
    const holiday = primary('holiday')
    expect(holiday).not.toHaveAttribute('aria-roledescription')
    expect(primary('review')).toHaveAttribute('aria-roledescription', 'movable event')
    holiday.focus()
    await user.keyboard(' {ArrowRight} ')
    expect(onEventChange).not.toHaveBeenCalled()
  })
})

describe('EventCalendar week and day views', () => {
  it('lays out timed events in the grid and bars in the all-day lane', () => {
    render(<Calendar defaultView="week" hourHeight={48} />)
    expect(screen.getByRole('heading', { name: /^Oct 5\s*–\s*11, 2026$/ })).toBeInTheDocument()
    const review = primary('review')
    expect(review.closest('[data-ec-col]')).toHaveAttribute('data-ec-col', '2026-10-06')
    // 14:00 at 48px an hour, 90 minutes tall (minus a 1px gap).
    expect(review.style.top).toBe('672px')
    expect(review.style.height).toBe('71px')
    expect(primary('offsite').closest('[data-ec-day]')).toHaveAttribute('data-ec-lane', 'allDay')
  })

  it('moves and resizes with the keyboard, snapping to the step', async () => {
    const user = userEvent.setup()
    const onEventChange = vi.fn()
    render(<Calendar defaultView="week" onEventChange={onEventChange} />)
    primary('review').focus()
    await user.keyboard(' ')
    expect(screen.getByText(/Picked up Design review/)).toBeInTheDocument()
    await user.keyboard('{ArrowDown}{ArrowRight}{Shift>}{ArrowDown}{/Shift}')
    expect(primary('review')).toHaveFocus()
    expect(primary('review').closest('[data-ec-col]')).toHaveAttribute('data-ec-col', '2026-10-07')
    await user.keyboard(' ')
    expect(onEventChange).toHaveBeenCalledWith({
      event: sample[0],
      start: at(7, 14, 15),
      end: at(7, 16),
      allDay: false,
    })
  })

  it('cancels with Escape and refuses changes canChange forbids', async () => {
    const user = userEvent.setup()
    const onEventChange = vi.fn()
    render(
      <Calendar
        defaultView="week"
        onEventChange={onEventChange}
        canChange={({ start }) => start.getHours() < 15}
      />,
    )
    primary('review').focus()
    await user.keyboard(' {ArrowDown}{Escape}')
    expect(screen.getByText(/Move cancelled/)).toBeInTheDocument()
    expect(onEventChange).not.toHaveBeenCalled()
    await user.keyboard(' {ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}')
    expect(primary('review')).toHaveAttribute('data-blocked')
    expect(screen.getByText(/Not allowed here/)).toBeInTheDocument()
    await user.keyboard(' ')
    expect(onEventChange).not.toHaveBeenCalled()
  })

  it('drags in the time grid, resizes from the bottom edge and selects empty time', () => {
    const onEventChange = vi.fn<(change: EventCalendarChange<Task>) => void>()
    const onSelectRange = vi.fn()
    render(
      <Calendar defaultView="week" onEventChange={onEventChange} onSelectRange={onSelectRange} />,
    )
    mockLayout()
    const minuteY = (minutes: number) => 200 + (minutes / 60) * 48
    // Grab Design review (Tue, column 1) 20 minutes in, drop on Wed one hour later.
    pointer('pointerdown', 150, minuteY(14 * 60 + 20), primary('review'))
    pointer('pointermove', 150, minuteY(14 * 60 + 30))
    pointer('pointermove', 250, minuteY(15 * 60 + 20))
    pointer('pointerup', 250, minuteY(15 * 60 + 20))
    expect(onEventChange).toHaveBeenLastCalledWith({
      event: sample[0],
      start: at(7, 15),
      end: at(7, 16, 30),
      allDay: false,
    })
    // Resize: drag the bottom edge 30 minutes down.
    const handle = primary('review').querySelector('[data-ec-resize]')!
    pointer('pointerdown', 150, minuteY(15 * 60 + 28), handle)
    pointer('pointermove', 150, minuteY(15 * 60 + 40))
    pointer('pointermove', 150, minuteY(15 * 60 + 58))
    pointer('pointerup', 150, minuteY(15 * 60 + 58))
    expect(onEventChange).toHaveBeenLastCalledWith({
      event: sample[0],
      start: at(6, 14),
      end: at(6, 16),
      allDay: false,
    })
    // Select Friday 10:00–11:30 (column 4).
    const friday = document.querySelector('[data-ec-col="2026-10-09"]')!
    pointer('pointerdown', 450, minuteY(10 * 60 + 5), friday)
    pointer('pointermove', 450, minuteY(10 * 60 + 40))
    pointer('pointermove', 450, minuteY(11 * 60 + 20))
    expect(document.querySelector('[data-slot="event-calendar-selection"]')).toBeInTheDocument()
    pointer('pointerup', 450, minuteY(11 * 60 + 20))
    expect(onSelectRange).toHaveBeenLastCalledWith({
      start: at(9, 10),
      end: at(9, 11, 30),
      allDay: false,
    })
    // A click makes an event of the default length.
    pointer('pointerdown', 450, minuteY(13 * 60 + 10), friday)
    pointer('pointerup', 450, minuteY(13 * 60 + 10))
    expect(onSelectRange).toHaveBeenLastCalledWith({
      start: at(9, 13),
      end: at(9, 14),
      allDay: false,
    })
  })

  it('turns a timed event into an all-day one when dropped on the all-day lane', () => {
    const onEventChange = vi.fn()
    render(<Calendar defaultView="week" onEventChange={onEventChange} />)
    mockLayout()
    // The all-day cells come first in document order: Fri is the 5th (x 400–500, y 0–100).
    pointer('pointerdown', 150, 200 + 14.2 * 48, primary('review'))
    pointer('pointermove', 160, 200 + 14.2 * 48)
    pointer('pointermove', 450, 50)
    pointer('pointerup', 450, 50)
    expect(onEventChange).toHaveBeenLastCalledWith({
      event: sample[0],
      start: at(9),
      end: at(10),
      allDay: true,
    })
  })

  it('opens the day view from a day header', async () => {
    const user = userEvent.setup()
    render(<Calendar defaultView="week" />)
    await user.click(screen.getByRole('button', { name: 'Thursday, October 8, 2026' }))
    expect(screen.getByRole('heading', { name: 'Thursday, October 8, 2026' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'true')
  })
})

describe('EventCalendar agenda and locales', () => {
  it('lists events by day with their times', () => {
    render(<Calendar defaultView="agenda" agendaDays={7} />)
    const days = screen.getAllByRole('region').filter((r) => r.tagName === 'SECTION')
    expect(days.map((d) => d.getAttribute('aria-label'))).toEqual([
      'Wednesday, October 7, 2026',
      'Thursday, October 8, 2026',
      'Friday, October 9, 2026',
      'Monday, October 12, 2026',
    ])
    expect(within(days[0]).getByText('11:00 AM – 11:45 AM')).toBeInTheDocument()
    expect(within(days[0]).getAllByText('All day')).toHaveLength(1)
  })

  it('shows an empty state', () => {
    render(<Calendar defaultView="agenda" events={[]} />)
    expect(screen.getByText('No events')).toBeInTheDocument()
  })

  it('follows LocaleProvider for text, dates and 24-hour times', () => {
    render(
      <LocaleProvider locale="vi-VN" messages={viPack}>
        <EventCalendar events={sample} defaultDate={at(7)} defaultView="week" />
      </LocaleProvider>,
    )
    expect(screen.getByRole('button', { name: 'Hôm nay' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Tuần' })).toBeInTheDocument()
    expect(screen.getByText('Cả ngày')).toBeInTheDocument()
    expect(within(primary('review')).getByText('14:00 – 15:30')).toBeInTheDocument()
  })

  it('takes per-instance labels and a custom toolbar', () => {
    render(
      <Calendar
        labels={{ agenda: 'Schedule' }}
        renderToolbar={(api) => (
          <div>
            <span data-testid="title">{api.title}</span>
            <span>{api.labels.agenda}</span>
          </div>
        )}
      />,
    )
    expect(screen.getByTestId('title')).toHaveTextContent('October 2026')
    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument()
  })

  it('renders custom event content with its context', () => {
    const renderEvent = vi.fn((event: Task) => <span>{event.owner}</span>)
    render(<Calendar renderEvent={renderEvent} />)
    expect(within(primary('review')).getByText('An')).toBeInTheDocument()
    expect(renderEvent).toHaveBeenCalledWith(
      sample[0],
      expect.objectContaining({ view: 'month', variant: 'dot', timeLabel: '2:00 PM' }),
    )
  })
})

describe('EventCalendar edge cases', () => {
  const tick = () => new Promise((resolve) => setTimeout(resolve))

  it('never resizes a timed multi-day event to end before it starts', () => {
    const onEventChange = vi.fn()
    const late: Task = { id: 'late', title: 'Late', start: at(5, 22), end: at(6, 2), owner: 'An' }
    render(<Calendar events={[late]} onEventChange={onEventChange} />)
    mockLayout()
    // The bar starts on Mon Oct 5 (cell 8: x 0–100, y 100–200); pull its end back onto Oct 5.
    const handle = primary('late').querySelector('[data-ec-resize]')!
    pointer('pointerdown', 195, 150, handle)
    pointer('pointermove', 150, 150)
    pointer('pointermove', 50, 150)
    pointer('pointerup', 50, 150)
    const change = onEventChange.mock.lastCall![0]
    expect(change.end > change.start).toBe(true)
  })

  it('lets the next click through after a drag that produced no click', async () => {
    const user = userEvent.setup()
    const onEventClick = vi.fn()
    render(<Calendar onEventChange={() => {}} onEventClick={onEventClick} />)
    mockLayout()
    pointer('pointerdown', 150, 150, primary('review'))
    pointer('pointermove', 160, 150)
    pointer('pointermove', 350, 150)
    pointer('pointerup', 350, 150)
    await tick()
    await user.click(screen.getByText('Customer call'))
    expect(onEventClick).toHaveBeenCalledTimes(1)
  })

  it('keeps working with a ref and ignores a second pointer mid-drag', () => {
    const ref = React.createRef<HTMLDivElement>()
    const onEventChange = vi.fn()
    render(<Calendar ref={ref} onEventChange={onEventChange} />)
    expect(ref.current).toHaveAttribute('data-slot', 'event-calendar')
    mockLayout()
    pointer('pointerdown', 150, 150, primary('review'))
    pointer('pointermove', 160, 150)
    pointer('pointermove', 350, 150)
    // Another press while dragging does not start a second session.
    pointer('pointerdown', 250, 250, cell(14))
    pointer('pointerup', 350, 150)
    expect(onEventChange).toHaveBeenCalledTimes(1)
  })

  it('restores the page when unmounted mid-drag', () => {
    const { unmount } = render(<Calendar onEventChange={() => {}} />)
    mockLayout()
    pointer('pointerdown', 150, 150, primary('review'))
    pointer('pointermove', 160, 150)
    expect(document.body.style.userSelect).toBe('none')
    unmount()
    expect(document.body.style.userSelect).toBe('')
    expect(document.body.style.cursor).toBe('')
  })

  it('does not follow an event that began earlier into the previous month', async () => {
    const user = userEvent.setup()
    const trip: Task = {
      id: 'trip',
      title: 'Trip',
      start: at(-4),
      end: at(4),
      allDay: true,
      owner: 'An',
    }
    render(<Calendar events={[trip]} onEventChange={() => {}} />)
    primary('trip').focus()
    await user.keyboard(' {ArrowRight}')
    expect(screen.getByRole('heading', { name: 'October 2026' })).toBeInTheDocument()
  })

  it('keeps focus after a keyboard move is cancelled or refused', async () => {
    const user = userEvent.setup()
    render(<Calendar defaultView="week" onEventChange={() => {}} canChange={() => false} />)
    primary('review').focus()
    await user.keyboard(' {ArrowRight}{Escape}')
    expect(primary('review')).toHaveFocus()
    await user.keyboard(' {ArrowRight} ')
    expect(primary('review')).toHaveFocus()
  })

  it('keeps the moving event visible and focused in a full day', async () => {
    const user = userEvent.setup()
    render(<Calendar maxEventsPerDay={1} onEventChange={() => {}} />)
    primary('review').focus()
    // Wednesday already shows the offsite; the review still gets drawn there while it moves.
    await user.keyboard(' {ArrowRight}')
    expect(primary('review').closest('[data-ec-day]')).toBe(cell(7))
    expect(primary('review')).toHaveFocus()
  })

  it('does not close a surrounding dialog when Escape cancels a move', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent aria-describedby={undefined} size="xl">
          <DialogTitle>Plan</DialogTitle>
          <Calendar onEventChange={() => {}} />
        </DialogContent>
      </Dialog>,
    )
    primary('review').focus()
    await user.keyboard(' {ArrowRight}{Escape}')
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByText(/Move cancelled/)).toBeInTheDocument()
  })

  it('ignores the all-day lane when resizing a time-grid block', () => {
    const onEventChange = vi.fn()
    render(<Calendar defaultView="week" onEventChange={onEventChange} />)
    mockLayout()
    const handle = primary('review').querySelector('[data-ec-resize]')!
    pointer('pointerdown', 150, 200 + 15.4 * 48, handle)
    pointer('pointermove', 150, 200 + 15.6 * 48)
    // Over Friday's all-day cell.
    pointer('pointermove', 450, 50)
    pointer('pointerup', 450, 50)
    for (const [change] of onEventChange.mock.calls) expect(change.end.getDate()).toBe(6)
  })

  // Only meaningful where clocks jump on Mar 8, 2026 (e.g. TZ=America/New_York).
  const dstDay =
    new Date(2026, 2, 8, 1).getTimezoneOffset() !== new Date(2026, 2, 8, 4).getTimezoneOffset()
  it.runIf(dstDay)('drags by wall-clock time on a daylight-saving day', () => {
    const onEventChange = vi.fn()
    const night: Task = {
      id: 'night',
      title: 'Night',
      start: new Date(2026, 2, 8, 1),
      end: new Date(2026, 2, 8, 4),
      owner: 'An',
    }
    render(
      <Calendar
        events={[night]}
        defaultDate={night.start}
        defaultView="day"
        onEventChange={onEventChange}
      />,
    )
    mockLayout()
    // Grab at 03:00 (wall clock), wiggle, and come back: nothing changes.
    const y = 200 + 3 * 48
    pointer('pointerdown', 50, y, primary('night'))
    pointer('pointermove', 50, y + 30)
    pointer('pointermove', 50, y)
    pointer('pointerup', 50, y)
    expect(onEventChange).not.toHaveBeenCalled()
  })

  it('starts on the first offered view', () => {
    render(<Calendar views={['week', 'day']} />)
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.queryByRole('columnheader')).not.toBeInTheDocument()
  })
})
