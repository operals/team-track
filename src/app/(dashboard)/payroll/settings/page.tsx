import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { PayrollSetting } from '@/payload-types'

import { Tabs, TabsContent } from '@/components/ui/tabs'
import { PayrollSettingsList } from '@/components/payroll/settings/payroll-settings-list'

export const metadata: Metadata = {
  title: 'Payroll Settings',
  description: 'Manage employee payroll configurations',
}

export default async function PayrollSettingsPage() {
  const payload = await getPayload({ config: configPromise })

  // Authenticate using the request cookies
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/login')

  // Fetch payroll settings, include related employee
  const { docs } = await payload.find({
    collection: 'payroll-settings',
    depth: 2, // to resolve employee -> User
    limit: 1000, // settings are typically fewer than payroll records
    sort: '-createdAt',
    user, // ensure access rules apply to this user
  })

  return (
    <Tabs defaultValue="outline">
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="space-y-4 p-4 lg:p-6">
          <PayrollSettingsList data={docs as PayrollSetting[]} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
