import type { Metadata } from 'next'
import { db } from '@/db'
import { requireAuth } from '@/lib/auth-guards'

import { Tabs, TabsContent } from '@/components/ui/tabs'
import { PayrollSettingsList } from '@/components/payroll/settings/payroll-settings-list'

export const metadata: Metadata = {
  title: 'Payroll Settings',
  description: 'Manage employee payroll configurations',
}

export default async function PayrollSettingsPage() {
  await requireAuth()

  // Fetch payroll settings with employee relation
  const payrollSettings = await db.query.payrollSettingsTable.findMany({
    orderBy: (settings, { desc }) => [desc(settings.createdAt)],
    limit: 1000,
    with: {
      employee: true,
    },
  })

  return (
    <Tabs defaultValue="outline">
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="space-y-4 p-4 lg:p-6">
          <PayrollSettingsList data={payrollSettings as any} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
