'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import type { InferSelectModel } from 'drizzle-orm'
import { inventoryTable, usersTable } from '@/db/schema'

type Inventory = InferSelectModel<typeof inventoryTable> & {
  holder?: User | null
}
type User = InferSelectModel<typeof usersTable>
import Link from 'next/link'
import { updateInventoryInline } from '@/lib/actions/inventory'

interface InventoryDrawerProps {
  item: Inventory
}

export function InventoryDrawer({ item }: InventoryDrawerProps) {
  const [status, setStatus] = React.useState(item.status)
  const [holderId, setHolderId] = React.useState<string>(
    item.holder && typeof item.holder === 'object' ? String(item.holder.id) : item.holderId || '',
  )
  const [holders, setHolders] = React.useState<Array<{ value: string; label: string }>>([])
  const [holderQuery, setHolderQuery] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  // Get current holder name for display
  const currentHolderName = React.useMemo(() => {
    if (item.holder && typeof item.holder === 'object' && 'fullName' in item.holder) {
      return item.holder.fullName
    }
    // If holderId exists but holder is just an ID, find it in the holders list
    if (holderId && holders.length > 0) {
      const holderOption = holders.find((h) => h.value === holderId)
      return holderOption ? holderOption.label : 'Unknown User'
    }
    return 'Unassigned'
  }, [item.holder, holderId, holders])

  React.useEffect(() => {
    // Fetch user options for holder select
    const fetchHolders = async () => {
      try {
        const res = await fetch('/api/users/options')
        if (res.ok) {
          const data = await res.json()
          setHolders(data.options)
        }
      } catch {}
    }
    fetchHolders()
  }, [])

  const handleSaveInline = async () => {
    try {
      setSaving(true)
      await updateInventoryInline(String(item.id), { status, holder: holderId || null })
    } finally {
      setSaving(false)
    }
  }

  React.useEffect(() => {
    // Auto-clear holder when not in use
    if (status !== 'inUse') {
      setHolderId('')
    }
  }, [status])

  // Filter holders based on search query
  const filteredHolders = React.useMemo(() => {
    if (!holderQuery) return holders

    const query = holderQuery.toLowerCase()
    return holders.filter(
      (h) => h.label.toLowerCase().includes(query) || h.value.toLowerCase().includes(query),
    )
  }, [holders, holderQuery])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Item Type</h4>
          <p className="text-base">{item.itemType}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Model</h4>
          <p className="text-base">{item.model || 'N/A'}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Serial Number</h4>
          <p className="font-mono text-sm py-1 rounded">{item.serialNumber || 'N/A'}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger>
              <SelectValue className="capitalize" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inUse">In Use</SelectItem>
              <SelectItem value="inStock">In Stock</SelectItem>
              <SelectItem value="needsRepair">Needs Repair</SelectItem>
              <SelectItem value="underRepair">Under Repair</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Current Holder</h4>
          <Select value={holderId} onValueChange={(v) => setHolderId(v === '__none__' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder={currentHolderName} />
            </SelectTrigger>
            <SelectContent>
              <div className="flex items-center border-b px-3 pb-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="Search..."
                  value={holderQuery}
                  onChange={(e) => setHolderQuery(e.target.value)}
                  className="h-8 w-full border-0 bg-transparent p-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0"
                  onKeyDown={(e) => {
                    // Prevent select from closing when typing
                    e.stopPropagation()
                  }}
                />
              </div>
              <div className="max-h-[200px] overflow-auto">
                {filteredHolders.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No results found.
                  </div>
                ) : (
                  <>
                    {status !== 'inUse' && <SelectItem value="__none__">Unassigned</SelectItem>}
                    {filteredHolders.map((h) => (
                      <SelectItem key={h.value} value={h.value}>
                        {h.label}
                      </SelectItem>
                    ))}
                  </>
                )}
              </div>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Purchase Date</h4>
          <p className="text-base">
            {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'Not specified'}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Warranty Expiry</h4>
          <p className="text-base">
            {item.warrantyExpiry
              ? new Date(item.warrantyExpiry).toLocaleDateString()
              : 'Not specified'}
          </p>
        </div>

        {item.notes && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
            <p className="text-base whitespace-pre-wrap">{item.notes}</p>
          </div>
        )}

        {Array.isArray(item.images) && item.images.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Images</h4>
            <div className="grid grid-cols-3 gap-2">
              {item.images.map((img: any, idx: number) => {
                const url = typeof img === 'object' && img && 'url' in img ? img.url : undefined
                return url ? (
                  <img
                    key={idx}
                    src={url as string}
                    alt="Inventory image"
                    className="h-24 w-full object-cover rounded"
                  />
                ) : null
              })}
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex gap-2">
        <Link href={`/inventory/${item.id}/edit`} className="flex-1">
          <Button variant="outline" className="w-full">
            Edit Item
          </Button>
        </Link>
        <Button
          onClick={handleSaveInline}
          disabled={saving || (status === 'inUse' && !holderId)}
          className="flex-1"
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
