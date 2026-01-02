import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { Tabs, TabsContent } from '@/components/ui/tabs'
import { InventoryList } from '@/components/inventory/inventory-list'

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Manage company assets and equipment',
}

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  // Authenticate using the request cookies (same login as /admin)
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin')

  // Fetch inventory docs, include related holder
  const { docs } = await payload.find({
    collection: 'inventory',
    depth: 2, // to resolve holder -> User
    limit: 50, // adjust or wire to pagination
    sort: '-updatedAt',
    user, // ensure access rules apply to this user
  })

  return (
    <Tabs defaultValue="outline">
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="space-y-4 p-4 lg:p-6">
          <InventoryList data={docs as any} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
