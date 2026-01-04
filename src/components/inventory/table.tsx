'use client'

import type { InferSelectModel } from 'drizzle-orm'
import { inventoryTable, usersTable } from '@/db/schema'

type Inventory = InferSelectModel<typeof inventoryTable> & {
  holder?: User | null
}
type User = InferSelectModel<typeof usersTable>
import { Badge } from '../ui/badge'
import { DataTable } from '../data-table'
import { InventoryItemCell } from './item-cell'
import { Button } from '../ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer'
import { InventoryDrawer } from './drawer'
import { useIsMobile } from '@/hooks/use-mobile'

interface InventoryTableProps {
  data: Inventory[]
  enablePagination?: boolean
}

export function InventoryTable({ data, enablePagination = true }: InventoryTableProps) {
  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      inUse: 'In Use',
      inStock: 'In Stock',
      needsRepair: 'Needs Repair',
      underRepair: 'Under Repair',
    }
    return labels[status] || status
  }

  const columns = [
    {
      key: 'itemType' as keyof Inventory,
      header: 'Item Type',
      render: (value: unknown, item: Inventory) => <InventoryItemCell item={item} />,
    },
    {
      key: 'model' as keyof Inventory,
      header: 'Model',
    },
    {
      key: 'holder' as keyof Inventory,
      header: 'Holder',
      render: (value: unknown, item: Inventory) => {
        const holder = item.holder
        return holder && typeof holder === 'object' && 'fullName' in holder ? holder.fullName : '-'
      },
    },
    {
      key: 'status' as keyof Inventory,
      header: 'Status',
      render: (value: unknown) => (
        <Badge variant="default" className="capitalize">
          {getStatusLabel(String(value))}
        </Badge>
      ),
    },
    {
      key: 'serialNumber' as keyof Inventory,
      header: 'Serial Number',
    },
    {
      key: 'purchaseDate' as keyof Inventory,
      header: 'Purchased at',
      render: (value: unknown) => {
        const date = value as string
        return date ? new Date(date).toLocaleDateString() : '-'
      },
    },
  ]

  const InventoryActionButton = ({ item }: { item: Inventory }) => {
    const isMobile = useIsMobile()

    return (
      <Drawer direction={isMobile ? 'bottom' : 'right'}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </DrawerTrigger>
        <DrawerContent className={isMobile ? '' : 'w-[400px] sm:w-[540px]'}>
          <DrawerHeader>
            <DrawerTitle className="text-2xl">Item Details</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
            <InventoryDrawer item={item} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  const actionColumn = (item: Inventory) => <InventoryActionButton item={item} />

  return (
    <div className="space-y-4">
      <DataTable<Inventory>
        data={data as Inventory[]}
        columns={columns}
        actionColumn={actionColumn}
        enablePagination={enablePagination}
      />
    </div>
  )
}
