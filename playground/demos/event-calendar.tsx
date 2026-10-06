import { Plus } from 'lucide-react'
import { useState } from 'react'
import {
  Avatar,
  Button,
  EventCalendar,
  LocaleProvider,
  toast,
  vi,
  type CalendarEvent,
  type EventCalendarChange,
  type EventCalendarRange,
} from '../../src'
import { CodeBlock, Example } from '../components/demo'

/** Events around the current week, so the demo is never empty. */
function sampleEvents(): CalendarEvent[] {
  const now = new Date()
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - ((now.getDay() + 6) % 7),
  )
  const at = (day: number, hour = 0, minute = 0) =>
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + day, hour, minute)
  const standups = [0, 1, 2, 3, 4, 7, 8, 9, 10, 11].map((day): CalendarEvent => ({
    id: `standup-${day}`,
    title: 'Standup',
    start: at(day, 9, 30),
    end: at(day, 9, 45),
    tone: 'info',
  }))
  return [
    ...standups,
    { id: 'sprint', title: 'Sprint 42', start: at(-4), end: at(2), allDay: true, tone: 'info' },
    { id: 'review', title: 'Design review', start: at(1, 14), end: at(1, 15, 30) },
    {
      id: 'one-on-one',
      title: '1:1 with Linh',
      start: at(1, 14, 30),
      end: at(1, 15),
      tone: 'success',
    },
    { id: 'call', title: 'Customer call', start: at(2, 11), end: at(2, 11, 45), tone: 'warning' },
    {
      id: 'offsite',
      title: 'Product offsite',
      start: at(2),
      end: at(5),
      allDay: true,
      color: 'oklch(0.58 0.2 300)',
    },
    { id: 'launch', title: 'Launch prep', start: at(3, 13), end: at(3, 17), tone: 'danger' },
    { id: 'lunch', title: 'Team lunch', start: at(4, 12), end: at(4, 13), tone: 'success' },
    { id: 'code-review', title: 'Code review', start: at(4, 15), end: at(4, 16) },
    { id: 'retro', title: 'Retro', start: at(4, 16), end: at(4, 17), tone: 'info' },
    { id: 'deploy', title: 'Night deploy', start: at(4, 22), end: at(5, 1), tone: 'danger' },
    {
      id: 'holiday',
      title: 'Public holiday',
      start: at(7),
      allDay: true,
      tone: 'neutral',
      editable: false,
    },
    { id: 'dentist', title: 'Dentist', start: at(-3, 16), end: at(-3, 17), tone: 'warning' },
    { id: 'planning', title: 'Sprint planning', start: at(9, 10), end: at(9, 12) },
    { id: 'reminder', title: 'Send invoices', start: at(10, 17), tone: 'warning' },
  ]
}

let nextId = 1

function useEvents() {
  const [events, setEvents] = useState(sampleEvents)
  const change = ({ event, start, end, allDay }: EventCalendarChange) =>
    setEvents((list) => list.map((e) => (e.id === event.id ? { ...e, start, end, allDay } : e)))
  const create = ({ start, end, allDay }: EventCalendarRange) => {
    const event: CalendarEvent = { id: `new-${nextId++}`, title: 'New event', start, end, allDay }
    setEvents((list) => [...list, event])
  }
  return { events, change, create }
}

export default function EventCalendarDemo() {
  const main = useEvents()
  const week = useEvents()
  const agenda = useEvents()

  return (
    <div className="space-y-12">
      <Example
        title="Month, week, day and agenda"
        description="Drag events to move them, drag an edge to change their length, or focus one and press Space to move it with the arrow keys. Click or drag over empty time to add an event. Sundays are off-limits here (canChange), and the holiday is read-only."
        layout="full"
        className="p-3 sm:p-4"
      >
        <EventCalendar
          aria-label="Team calendar"
          events={main.events}
          onEventChange={main.change}
          canChange={({ start }) => start.getDay() !== 0}
          onSelectRange={main.create}
          onEventClick={(event) => toast(event.title)}
          className="h-[44rem]"
          toolbarActions={
            <Button
              size="sm"
              leftIcon={<Plus />}
              onClick={() => {
                const start = new Date()
                start.setMinutes(0, 0, 0)
                start.setHours(start.getHours() + 1)
                main.create({ start, end: new Date(start.getTime() + 3_600_000), allDay: false })
              }}
            >
              New event
            </Button>
          }
        />
      </Example>

      <Example
        title="Vietnamese, working hours"
        description="LocaleProvider sets the text, dates and 24-hour times; dayStartHour / dayEndHour trim the grid."
        layout="full"
        className="p-3 sm:p-4"
      >
        <LocaleProvider locale="vi-VN" messages={vi}>
          <EventCalendar
            events={week.events}
            onEventChange={week.change}
            onSelectRange={week.create}
            defaultView="week"
            views={['week', 'day']}
            dayStartHour={7}
            dayEndHour={21}
            hourHeight={44}
            className="h-[36rem]"
          />
        </LocaleProvider>
      </Example>

      <Example
        title="Custom event content"
        description="renderEvent draws the inside of each event; the colored surface, focus ring and dragging stay. The event color is available as the --event-color CSS variable."
        layout="full"
        className="p-3 sm:p-4"
      >
        <EventCalendar
          events={agenda.events}
          defaultView="agenda"
          views={['agenda', 'month']}
          agendaDays={14}
          className="h-[28rem]"
          renderEvent={(event, { variant, timeLabel }) =>
            variant === 'agenda' ? (
              <>
                <span className="basis-full text-xs text-muted-foreground tabular-nums @md/agenda:w-40 @md/agenda:shrink-0 @md/agenda:basis-auto @md/agenda:text-sm">
                  {timeLabel}
                </span>
                <span aria-hidden className="size-2 shrink-0 rounded-full bg-(--event-color)" />
                <span className="min-w-0 flex-1 truncate font-medium">{event.title}</span>
                <Avatar size="xs" name="Linh Tran" className="ms-auto" />
              </>
            ) : (
              <span className="truncate">{event.title}</span>
            )
          }
        />
      </Example>

      <Example title="Usage" layout="stack">
        <CodeBlock
          code={`const [events, setEvents] = useState<CalendarEvent[]>([...])

<EventCalendar
  events={events}
  onEventChange={({ event, start, end, allDay }) =>
    setEvents((list) => list.map((e) => (e.id === event.id ? { ...e, start, end, allDay } : e)))
  }
  onSelectRange={({ start, end, allDay }) => openNewEventDialog({ start, end, allDay })}
  onEventClick={(event) => openEvent(event.id)}
  onRangeChange={({ start, end }) => loadEvents(start, end)}
/>`}
        />
      </Example>
    </div>
  )
}
