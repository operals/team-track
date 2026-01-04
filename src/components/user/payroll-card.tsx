'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table'
import type { InferSelectModel } from 'drizzle-orm'
import { payrollTable, payrollSettingsTable } from '@/db/schema'

type Payroll = InferSelectModel<typeof payrollTable>
type PayrollSetting = InferSelectModel<typeof payrollSettingsTable>
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PayrollCardProps {
  payrollHistory?: Payroll[]
  payrollSettings?: PayrollSetting[]
}

export function PayrollCard({ payrollHistory = [], payrollSettings = [] }: PayrollCardProps) {
  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (!amount && amount !== 0) return 'Not set'
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Get status variant
  const getStatusVariant = (
    status: string,
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'paid':
        return 'default'
      case 'approved':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Payment history table columns
  const historyColumns = [
    {
      key: 'month' as keyof Payroll,
      header: 'Period',
      render: (value: unknown, item: Payroll) => {
        const month = item.month
        const year = item.year
        if (!month || !year) return '-'
        const monthNames = {
          '01': 'Jan',
          '02': 'Feb',
          '03': 'Mar',
          '04': 'Apr',
          '05': 'May',
          '06': 'Jun',
          '07': 'Jul',
          '08': 'Aug',
          '09': 'Sep',
          '10': 'Oct',
          '11': 'Nov',
          '12': 'Dec',
        }
        return `${monthNames[month as keyof typeof monthNames]} ${year}`
      },
    },
    {
      key: 'payrollItems' as keyof Payroll,
      header: 'Payment Method',
      render: (value: unknown, item: Payroll) => {
        const items = item.payrollItems
        const isAdditionalPayment = (item as any).isAdditionalPayment

        if (!items || !Array.isArray(items) || items.length === 0) return '-'

        // Get all unique payment types
        const paymentTypes = items
          .map((payrollItem) => (payrollItem as any).paymentType)
          .filter((type, index, self) => type && self.indexOf(type) === index)

        if (paymentTypes.length === 0) return '-'

        const paymentLabels = {
          bankTransfer: 'Bank Transfer',
          cash: 'Cash',
          cheque: 'Cheque',
        }

        return (
          <div className="flex flex-wrap gap-1">
            {paymentTypes.map((type, idx) => {
              const label = paymentLabels[type as keyof typeof paymentLabels] || type
              // Show "Additional" badge if it's from additional-payments collection
              // OR if it's a secondary item in payrollItems array
              const showAdditional = isAdditionalPayment || (items.length > 1 && idx > 0)
              return (
                <div key={idx} className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {label}
                  </Badge>
                  {showAdditional && (
                    <Badge variant="secondary" className="text-xs">
                      Additional
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        )
      },
    },
    {
      key: 'totalAmount' as keyof Payroll,
      header: 'Amount',
      render: (value: unknown, item: Payroll) => {
        const items = item.payrollItems
        if (!items || !Array.isArray(items) || items.length === 0) return formatCurrency(0)

        // Calculate base amount from all payroll items
        const baseAmount = items.reduce((sum, payrollItem) => {
          return sum + ((payrollItem as any).amount || 0)
        }, 0)

        const bonus = Number(item.bonusAmount || 0)
        const deduction = Number(item.deductionAmount || 0)

        // If no adjustments, just show the amount
        if (bonus === 0 && deduction === 0) {
          return formatCurrency(baseAmount)
        }

        // Show amount with adjustments breakdown
        const parts = [formatCurrency(baseAmount)]
        if (bonus > 0) parts.push(`+ ${formatCurrency(bonus)}`)
        if (deduction > 0) parts.push(`- ${formatCurrency(deduction)}`)

        return (
          <div className="flex flex-col">
            <span className="text-sm">{parts.join(' ')}</span>
          </div>
        )
      },
    },
    {
      key: 'status' as keyof Payroll,
      header: 'Net Total',
      render: (value: unknown, item: Payroll) => {
        return <span className="font-medium">{formatCurrency(Number(item.totalAmount) || 0)}</span>
      },
    },
    {
      key: 'status' as keyof Payroll,
      header: 'Status',
      render: (value: unknown) => (
        <Badge variant={getStatusVariant(String(value))} className="capitalize">
          {String(value)}
        </Badge>
      ),
    },
  ]

  // Payroll settings table columns
  const settingsColumns = [
    {
      key: 'payrollType' as keyof PayrollSetting,
      header: 'Type',
      render: (value: unknown) => {
        const typeLabels = {
          primary: 'Primary Salary',
          bonus: 'Bonus Payment',
          overtime: 'Overtime Pay',
          commission: 'Commission',
          allowance: 'Allowance',
          other: 'Other',
        }
        return typeLabels[value as keyof typeof typeLabels] || String(value)
      },
    },
    {
      key: 'description' as keyof PayrollSetting,
      header: 'Description',
      render: (value: unknown) => String(value) || '-',
    },
    {
      key: 'amount' as keyof PayrollSetting,
      header: 'Amount',
      render: (value: unknown, item: PayrollSetting) => {
        return formatCurrency(Number(item.amount))
      },
    },
    {
      key: 'paymentType' as keyof PayrollSetting,
      header: 'Payment Method',
      render: (value: unknown, item: PayrollSetting) => {
        const paymentType = item.paymentType
        const paymentLabels = {
          bankTransfer: 'Bank Transfer',
          cash: 'Cash',
          cheque: 'Cheque',
        }
        return paymentLabels[paymentType as keyof typeof paymentLabels] || paymentType || '-'
      },
    },
    {
      key: 'paymentFrequency' as keyof PayrollSetting,
      header: 'Frequency',
      render: (value: unknown, item: PayrollSetting) => {
        const freq = item.paymentFrequency
        const freqLabels = {
          monthly: 'Monthly',
          quarterly: 'Quarterly',
          annual: 'Annual',
          oneTime: 'One Time',
        }
        return freqLabels[freq as keyof typeof freqLabels] || freq || '-'
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">Payroll Information</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Payroll Settings</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Active payroll configurations for this employee
            </p>
            {payrollSettings.length > 0 ? (
              <div className="w-full overflow-auto">
                <DataTable<PayrollSetting>
                  data={payrollSettings}
                  columns={settingsColumns}
                  enablePagination={false}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payroll settings configured.</p>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Historical payroll records and payment status
            </p>
            {payrollHistory.length > 0 ? (
              <div className="w-full overflow-auto">
                <DataTable<Payroll>
                  data={payrollHistory}
                  columns={historyColumns}
                  enablePagination={false}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payment records found.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
