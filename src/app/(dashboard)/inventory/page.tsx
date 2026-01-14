import type { Metadata } from 'next'
import { db } from '@/db'
import { requireAuth } from '@/lib/auth-guards'
import { desc, eq } from 'drizzle-orm'
import { usersTable, inventoryTable } from '@/db/schema'

import { Tabs, TabsContent } from '@/components/ui/tabs'
import { InventoryList } from '@/components/inventory/inventory-list'

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Manage company assets and equipment',
}

export default async function Page() {
  await requireAuth()

  // Fetch inventory items
  const inventory = await db.query.inventoryTable.findMany({
    orderBy: (inventory, { desc }) => [desc(inventory.updatedAt)],
    limit: 50,
  })

  // Fetch all users for holder mapping
  const users = await db.select().from(usersTable)

  // Map inventory with holder information
  const inventoryWithHolders = inventory.map((item) => {
    const holder = item.holderId ? users.find((u) => u.id === item.holderId) : null
    return {
      ...item,
      holder,
    }
  })

  return (
    <Tabs defaultValue="outline">
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="space-y-4 p-4 lg:p-6">
          <InventoryList data={inventoryWithHolders as any} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
