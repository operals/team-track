import { Metadata } from 'next'
import EventCalendar from '@/components/calendar/calendar'
import { transformBirthdaysToEvents } from '@/lib/calendar-utils'
import { db } from '@/db'
import { requireAuth } from '@/lib/auth-guards'
import { usersTable } from '@/db/schema'
import { isNotNull } from 'drizzle-orm'
import { Tabs, TabsContent } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Calendar',
}

export default async function CalendarPage() {
  await requireAuth()

  // Fetch all users with birthdate
  const users = await db.query.usersTable.findMany({
    where: isNotNull(usersTable.birthDate),
    limit: 1000,
  })

  // Transform users to calendar events
  const events = transformBirthdaysToEvents(users as any)

  return (
    <Tabs defaultValue="outline">
      <TabsContent value="outline" className="relative flex flex-col overflow-auto px-4 lg:px-6">
        <div className="p-4 lg:p-6">
          <h1 className="text-xl font-semibold">Calendar</h1>
          <p className="text-sm text-muted-foreground">View upcoming events</p>
        </div>
        <div className="w-full m-auto">
          <EventCalendar events={events} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
