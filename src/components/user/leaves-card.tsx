'use client'

import * as React from 'react'
import Link from 'next/link'
import type { LeaveDay } from '@/payload-types'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { DataTable } from '../data-table'
import { Plus } from 'lucide-react'

interface LeavesCardProps {
  leaves?: LeaveDay[]
  createHref?: string
}

export function LeavesCard({ leaves = [], createHref = '/leaves/new' }: LeavesCardProps) {
  const getStatusVariant = (
    status: string,
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'approved':
        return 'outline'
      case 'rejected':
        return 'outline'
      case 'cancelled':
        return 'outline'
      default:
        return 'default'
    }
  }

  const columns = [
    {
      key: 'type' as keyof LeaveDay,
      header: 'Type',
      render: (value: unknown) => (
        <Badge variant="secondary" className="capitalize">
          {String(value)}
        </Badge>
      ),
    },
    {
      key: 'startDate' as keyof LeaveDay,
      header: 'Start Date',
      render: (value: unknown) => {
        const date = value as string
        return date ? new Date(date).toLocaleDateString() : '-'
      },
    },
    {
      key: 'endDate' as keyof LeaveDay,
      header: 'End Date',
      render: (value: unknown) => {
        const date = value as string
        return date ? new Date(date).toLocaleDateString() : '-'
      },
    },
    {
      key: 'totalDays' as keyof LeaveDay,
      header: 'Days',
      render: (value: unknown) => String(value || '-'),
    },
    {
      key: 'status' as keyof LeaveDay,
      header: 'Status',
      render: (value: unknown) => {
        const status = String(value)
        const isFinalStatus = ['approved', 'rejected', 'cancelled'].includes(status)

        return (
          <Badge
            variant={getStatusVariant(status)}
            className={`capitalize ${isFinalStatus}`}
          >
            {status}
            {isFinalStatus && ' ✓'}
          </Badge>
        )
      },
    },
    {
      key: 'reason' as keyof LeaveDay,
      header: 'Reason',
      render: (value: unknown) => {
        const reason = String(value || '')
        return reason.length > 50 ? `${reason.substring(0, 50)}...` : reason
      },
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Leave History</h2>
          <Link href={createHref}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Leave Request
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex">
          <div className="w-full space-y-4">
            {leaves.length > 0 ? (
              <div className="w-full overflow-auto">
                <DataTable<LeaveDay>
                  data={leaves.map((item) => ({
                    ...item,
                    id: Number(item.id),
                  }))}
                  columns={columns}
                  enablePagination={false}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No leave records found.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
