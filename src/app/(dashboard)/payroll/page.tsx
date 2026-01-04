import type { Metadata } from 'next'
import { db } from '@/db'
import { requireAuth } from '@/lib/auth-guards'

import { Tabs, TabsContent } from '@/components/ui/tabs'
import { PayrollList } from '@/components/payroll/payroll-list'

export const metadata: Metadata = {
  title: 'Payroll Records',
  description: 'Manage payroll records and payments',
}

export default async function Page() {
  await requireAuth()

  // Fetch payroll records with employee and processedBy relations
  const payrollDocs = await db.query.payrollTable.findMany({
    orderBy: (payroll, { desc }) => [desc(payroll.updatedAt)],
    limit: 100,
    with: {
      employee: true,
      processedBy: true,
    },
  })

  return (
    <Tabs defaultValue="outline">
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="space-y-4 p-4 lg:p-6">
          <PayrollList data={payrollDocs as any} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
