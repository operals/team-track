'use client'

import * as React from 'react'
import type { InferSelectModel } from 'drizzle-orm'
import { leavesTable, usersTable } from '@/db/schema'

type LeaveDay = InferSelectModel<typeof leavesTable>
type User = InferSelectModel<typeof usersTable>
import { Badge } from '../ui/badge'
import { DataTable } from '../data-table'
import { Button } from '../ui/button'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

interface LeaveDayTableProps {
  data: LeaveDay[]
  enablePagination?: boolean
}

type LeaveStatus = 'requested' | 'approved' | 'rejected' | 'cancelled'

const statusOptions: { value: LeaveStatus; label: string }[] = [
  { value: 'requested', label: 'Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function LeaveDayTable({ data, enablePagination = true }: LeaveDayTableProps) {
  const [updatingStatus, setUpdatingStatus] = React.useState<number | null>(null)

  const updateLeaveStatus = async (leaveId: number, newStatus: LeaveStatus) => {
    setUpdatingStatus(leaveId)
    try {
      const response = await fetch(`/api/leaves/${leaveId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error updating leave status:', error)
      alert('Failed to update status. Please try again.')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusVariant = (
    status: string,
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      case 'cancelled':
        return 'secondary'
      default:
        return 'outline'
    }
  }
  const columns = [
    {
      key: 'user' as keyof LeaveDay,
      header: 'Applicant',
      render: (value: unknown, item: LeaveDay) => {
        const user = item.userId
        return typeof user === 'object' && user !== null && 'fullName' in user
          ? (user as User).fullName
          : user || '-'
      },
    },
    {
      key: 'type' as keyof LeaveDay,
      header: 'Type',
      render: (value: unknown) => (
        <Badge variant="outline" className="capitalize">
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
      render: (value: unknown, item: LeaveDay) => {
        const currentStatus = String(value) as LeaveStatus
        const isUpdating = updatingStatus === Number(item.id)

        // Final statuses that cannot be changed
        const isFinalStatus = ['approved', 'rejected', 'cancelled'].includes(currentStatus)

        // If it's a final status, just show the badge without dropdown
        if (isFinalStatus) {
          return (
            <Badge variant={getStatusVariant(currentStatus)} className="capitalize">
              {currentStatus}
            </Badge>
          )
        }

        // Only show dropdown for "requested" status
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                disabled={isUpdating}
              >
                <Badge
                  variant={getStatusVariant(currentStatus)}
                  className="capitalize cursor-pointer hover:opacity-80 flex items-center gap-1"
                >
                  {currentStatus}
                  <ChevronDown className="h-3 w-3" />
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => updateLeaveStatus(Number(item.id), option.value)}
                  className={`cursor-pointer capitalize ${option.value === currentStatus ? 'bg-accent' : ''}`}
                  disabled={option.value === currentStatus || isUpdating}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const actionColumn = (item: LeaveDay) => (
    <Link href={`/leaves/${item.id}/edit`} className="flex-1">
      <Button variant="outline" className="w-full">
        Edit Leave
      </Button>
    </Link>
  )

  return (
    <div className="space-y-4">
      <DataTable<LeaveDay>
        data={data as LeaveDay[]}
        columns={columns}
        actionColumn={actionColumn}
        enablePagination={enablePagination}
      />
    </div>
  )
}
