'use client'

import * as React from 'react'
import Link from 'next/link'
import type { InferSelectModel } from 'drizzle-orm'
import { payrollSettingsTable, usersTable } from '@/db/schema'

type PayrollSetting = InferSelectModel<typeof payrollSettingsTable> & {
  employee?: User | null
}
type User = InferSelectModel<typeof usersTable>
import { Badge } from '../../ui/badge'
import { DataTable } from '../../data-table'
import { Button } from '../../ui/button'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface PayrollSettingsTableProps {
  data: PayrollSetting[]
  enablePagination?: boolean
}

export function PayrollSettingsTable({ data, enablePagination = true }: PayrollSettingsTableProps) {
  const [deletingSetting, setDeletingSetting] = React.useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [settingToDelete, setSettingToDelete] = React.useState<PayrollSetting | null>(null)

  const handleDeleteClick = (setting: PayrollSetting) => {
    setSettingToDelete(setting)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!settingToDelete) return

    const idToDelete = settingToDelete.id
    setDeletingSetting(idToDelete)

    try {
      const response = await fetch(`/api/payroll-settings/${idToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete payroll setting')
      }

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error deleting payroll setting:', error)
      alert('Failed to delete payroll setting. Please try again.')
    } finally {
      setDeletingSetting(null)
      setShowDeleteDialog(false)
      setSettingToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
    setSettingToDelete(null)
  }

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (!amount && amount !== 0) return '-'
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format payment type
  const formatPaymentType = (type: string | undefined) => {
    switch (type) {
      case 'bankTransfer':
        return 'Bank Transfer'
      case 'cash':
        return 'Cash'
      case 'cheque':
        return 'Cheque'
      default:
        return type || '-'
    }
  }

  // // Get type variant
  // const getTypeVariant = (
  //   type: string | undefined,
  // ): 'default' | 'secondary' | 'destructive' | 'outline' => {
  //   switch (type) {
  //     case 'primary':
  //       return 'secondary'
  //     case 'bonus':
  //       return 'outline'
  //     case 'overtime':
  //       return 'outline'
  //     default:
  //       return 'secondary'
  //   }
  // }

  const columns = [
    {
      key: 'employee' as keyof PayrollSetting,
      header: 'Employee',
      render: (value: unknown) => {
        const user = value as User
        return typeof user === 'object' && user !== null && 'fullName' in user
          ? user.fullName || '-'
          : String(value) || '-'
      },
    },
    {
      key: 'payrollType' as keyof PayrollSetting,
      header: 'Type',
      render: (value: unknown) => (
        <Badge variant="outline" className="capitalize">
          {String(value)}
        </Badge>
      ),
    },
    {
      key: 'amount' as keyof PayrollSetting,
      header: 'Amount',
      render: (value: unknown, item?: PayrollSetting) => {
        const amount = item?.amount ? Number(item.amount) : undefined
        return <>{formatCurrency(amount)}</>
      },
    },
    {
      key: 'paymentType' as keyof PayrollSetting,
      header: 'Payment Method',
      render: (value: unknown, item: PayrollSetting) => {
        return <Badge variant="secondary">{formatPaymentType(item.paymentType)}</Badge>
      },
    },
    {
      key: 'description' as keyof PayrollSetting,
      header: 'Description',
      render: (value: unknown) => {
        const desc = String(value || '')
        return desc.length > 40 ? `${desc.substring(0, 40)}...` : desc || '-'
      },
    },
    {
      key: 'isActive' as keyof PayrollSetting,
      header: 'Status',
      render: (value: unknown) => {
        const isActive = Boolean(value)
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
    },
  ]

  const actionColumn = (item: PayrollSetting) => {
    const isDeleting = deletingSetting === item.id

    return (
      <div className="flex gap-2">
        <Link href={`/payroll/settings/${item.id}/edit`} className="flex-1">
          <Button variant="outline" className="w-full" disabled={isDeleting}>
            Edit Setting
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteClick(item)}
          disabled={isDeleting}
          title="Delete payroll setting"
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DataTable<PayrollSetting>
        data={data}
        columns={columns}
        actionColumn={actionColumn}
        enablePagination={enablePagination}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payroll Setting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payroll setting? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
