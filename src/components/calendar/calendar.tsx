'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { Card, CardContent } from '@/components/ui/card'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  userId?: string
  avatar?: string
  birthDate?: Date
  age?: number
  type?: 'birthday' | 'event' | 'holiday'
}

interface EventCalendarProps {
  events: CalendarEvent[]
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const fullCalendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: true,
    backgroundColor: event.type === 'birthday' ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
    borderColor: event.type === 'birthday' ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
    textColor:
      event.type === 'birthday'
        ? 'hsl(var(--primary-foreground))'
        : 'hsl(var(--accent-foreground))',
    extendedProps: {
      userId: event.userId,
      avatar: event.avatar,
      birthDate: event.birthDate,
      age: event.age,
      type: event.type,
    },
  }))

  return (
    <Card>
      <CardContent>
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listMonth',
          }}
          events={fullCalendarEvents}
          height="70vh"
          editable={false}
          selectable={false}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          eventDisplay="block"
          displayEventTime={false}
        />
      </CardContent>
    </Card>
  )
}
