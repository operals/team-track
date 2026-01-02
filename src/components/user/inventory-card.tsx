'use client'

import type { Inventory } from '@/payload-types'
import { Card, CardContent, CardHeader } from '../ui/card'
import { InventoryTable } from '@/components/inventory/table'

interface InventoryCardProps {
  inventory?: Inventory[]
}

export function InventoryCard({ inventory = [] }: InventoryCardProps) {
  return (
   <Card>
    <CardHeader>
      <h2 className="text-lg font-semibold">Assigned Items</h2>
    </CardHeader>
    <CardContent>
      <div className="flex">
        <div className="w-full space-y-4">
          {inventory.length > 0 ? (
        <div className="w-full overflow-auto">
          <InventoryTable data={inventory} enablePagination={false} />
        </div>
          ) : (
        <p className="text-sm text-muted-foreground">No items are assigned.</p>
          )}
        </div>
      </div>
    </CardContent>
   </Card>
  )
}

