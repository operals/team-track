import type { Metadata } from 'next'
import { db } from '@/db'
import { requireAuth } from '@/lib/auth-guards'
import { desc } from 'drizzle-orm'

import { Tabs, TabsContent } from '@/components/ui/tabs'
import { InventoryList } from '@/components/inventory/inventory-list'

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Manage company assets and equipment',
}

export default async function Page() {
  await requireAuth()

  // Fetch inventory with holder relation
  const inventory = await db.query.inventoryTable.findMany({
    orderBy: (inventory, { desc }) => [desc(inventory.updatedAt)],
    limit: 50,
    with: {
      holder: true,
    },
  })

  return (
    <Tabs defaultValue="outline">
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="space-y-4 p-4 lg:p-6">
          <InventoryList data={inventory as any} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
