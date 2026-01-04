import type { Metadata } from 'next'
import { db } from '@/db'
import { requireAuth } from '@/lib/auth-guards'
import { desc } from 'drizzle-orm'

import { Tabs, TabsContent } from '@/components/ui/tabs'
import { LeaveDayList } from '@/components/leaves/leave-list'

export const metadata: Metadata = {
  title: 'Leaves',
  description: 'Manage employee leave requests',
}

export default async function Page() {
  await requireAuth()

  // Fetch leave days with user relation
  const leaves = await db.query.leavesTable.findMany({
    orderBy: (leaves, { desc }) => [desc(leaves.updatedAt)],
    limit: 50,
    with: {
      user: true,
    },
  })

  return (
    <Tabs defaultValue="outline">
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="space-y-4 p-4 lg:p-6">
          <LeaveDayList data={leaves as any} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
