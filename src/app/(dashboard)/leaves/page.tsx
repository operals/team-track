import type { Metadata } from 'next'
import { db } from '@/db'
import { requireAuth } from '@/lib/auth-guards'
import { desc } from 'drizzle-orm'
import { usersTable, leavesTable } from '@/db/schema'

import { Tabs, TabsContent } from '@/components/ui/tabs'
import { LeaveDayList } from '@/components/leaves/leave-list'

export const metadata: Metadata = {
  title: 'Leaves',
  description: 'Manage employee leave requests',
}

export default async function Page() {
  await requireAuth()

  // Fetch leave days
  const leaves = await db.query.leavesTable.findMany({
    orderBy: (leaves, { desc }) => [desc(leaves.updatedAt)],
    limit: 50,
  })

  // Fetch all users for user mapping
  const users = await db.select().from(usersTable)

  // Map leaves with user information
  const leavesWithUsers = leaves.map((leave) => {
    const user = users.find((u) => u.id === leave.userId)
    return {
      ...leave,
      user,
    }
  })

  return (
    <Tabs defaultValue="outline">
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="space-y-4 p-4 lg:p-6">
          <LeaveDayList data={leavesWithUsers as any} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
