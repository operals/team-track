import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { Tabs, TabsContent } from '@/components/ui/tabs'
import { PayrollList } from '@/components/payroll/payroll-list'

export const metadata: Metadata = {
  title: 'Payroll Records',
  description: 'Manage payroll records and payments',
}

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  // Authenticate using the request cookies (same login as /admin)
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin')

  // Fetch payroll docs
  const { docs: payrollDocs } = await payload.find({
    collection: 'payroll',
    depth: 2,
    limit: 100,
    sort: '-updatedAt',
    user,
  })

  // Fetch additional payments
  const { docs: additionalPaymentDocs } = await payload.find({
    collection: 'additional-payments',
    depth: 2,
    limit: 100,
    sort: '-updatedAt',
    user,
  })

  // Transform additional payments to match payroll structure for table display
  const transformedAdditionalPayments = additionalPaymentDocs.map((payment) => ({
    id: `additional-${payment.id}`,
    employee: payment.employee,
    period: payment.period,
    payrollItems: [
      {
        description: payment.description,
        payrollType: payment.category,
        amount: payment.amount,
        paymentType: payment.paymentType,
      },
    ],
    adjustments: {
      bonusAmount: 0,
      deductionAmount: 0,
      adjustmentNote: null,
    },
    totalAmount: payment.amount,
    status: payment.status,
    paymentDetails: {
      paymentDate: payment.paymentDate,
      paymentReference: null,
      paymentNotes: payment.notes,
    },
    processedBy: payment.processedBy,
    processedAt: payment.processedAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    isAdditionalPayment: true, // Flag to identify additional payments
  }))

  // Merge both arrays
  const allPayments = [...payrollDocs, ...transformedAdditionalPayments] as any

  return (
    <Tabs defaultValue="outline">
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="space-y-4 p-4 lg:p-6">
          <PayrollList data={allPayments} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
