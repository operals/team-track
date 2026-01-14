'use client'

import * as React from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Plus } from 'lucide-react'
import type { InferSelectModel } from 'drizzle-orm'
import { leavesTable, usersTable } from '@/db/schema'

type LeaveDay = InferSelectModel<typeof leavesTable> & {
  user?: User | null
}
type User = InferSelectModel<typeof usersTable>
import { LeaveDayTable } from '@/components/leaves/table'

interface LeaveDayProps {
  data: LeaveDay[]
}

export function LeaveDayList({ data }: LeaveDayProps) {
  const [query, setQuery] = React.useState('')
  // Single-select filter: 'all' or one specific status
  const [statusFilter, setStatusFilter] = React.useState<
    'all' | 'requested' | 'approved' | 'rejected' | 'cancelled'
  >('all')

  // Single-select type filter: 'all' or one specific type
  const [typeFilter, setTypeFilter] = React.useState<
    'all' | 'annual' | 'sick' | 'unpaid' | 'other'
  >('all')

  // React.useEffect(() => {
  //   const t = setTimeout()
  //   return () => clearTimeout(t)
  // }, [query])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.filter((item) => {
      const user =
        item.user && typeof item.user === 'object' && 'fullName' in item.user
          ? (item.user.fullName || '').toLowerCase()
          : ''

      const itemStatus = String((item as any).status || '').toLowerCase()
      const itemType = String((item as any).type || '').toLowerCase()

      // Apply single-select status filter (skip items that don't match when a specific status is selected)
      if (statusFilter !== 'all' && itemStatus !== statusFilter) return false

      // Apply single-select type filter (skip items that don't match when a specific type is selected)
      if (typeFilter !== 'all' && itemType !== typeFilter) return false

      if (!q) return true

      return itemStatus.includes(q) || itemType.includes(q) || user.includes(q)
    })
  }, [data, query, statusFilter, typeFilter])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex gap-4 sm:items-center justify-between">
        <h1 className="text-xl font-semibold">Leaves</h1>
        <Link href="/leaves/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Leave
          </Button>
        </Link>
      </div>

      {/* Filters & Search - Responsive Grid Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] xl:grid-cols-[auto_auto]">
        {/* Left: Filters (Type + Status) */}
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Type Filter */}
          <ButtonGroup className="overflow-x-none">
            <Button
              type="button"
              size="sm"
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('all')}
              className="flex-shrink-0"
            >
              All
            </Button>
            {(
              [
                { label: 'Annual', value: 'annual' },
                { label: 'Sick', value: 'sick' },
                { label: 'Unpaid', value: 'unpaid' },
                { label: 'Other', value: 'other' },
              ] as const
            ).map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={typeFilter === value ? 'default' : 'outline'}
                onClick={() => setTypeFilter(value)}
                className="capitalize flex-shrink-0"
              >
                {label}
              </Button>
            ))}
          </ButtonGroup>

          {/* Status Filter */}
          <ButtonGroup className="overflow-x-none">
            <Button
              type="button"
              size="sm"
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              className="flex-shrink-0"
            >
              All
            </Button>
            {(
              [
                { label: 'Requested', value: 'requested' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
                { label: 'Cancelled', value: 'cancelled' },
              ] as const
            ).map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={statusFilter === value ? 'default' : 'outline'}
                onClick={() => setStatusFilter(value)}
                className="capitalize flex-shrink-0"
              >
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {/* Right: Search Input */}
        <div className="flex items-center">
          <Input
            placeholder="Search ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full lg:w-64 xl:w-80"
          />
        </div>
      </div>

      <LeaveDayTable data={filtered} />
    </div>
  )
}
