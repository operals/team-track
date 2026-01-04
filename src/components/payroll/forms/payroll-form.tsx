'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectField } from '@/components/form/select-field'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save, X } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import type { InferSelectModel } from 'drizzle-orm'
import { payrollTable } from '@/db/schema'

type Payroll = InferSelectModel<typeof payrollTable>

const PayrollSchema = z.object({
  employee: z.string().min(1, 'Employee is required'),
  month: z.enum(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as const, {
    error: 'Month is required',
  }),
  year: z.coerce.number().min(2020).max(2030, 'Year must be between 2020 and 2030'),
  paymentType: z.enum(['bankTransfer', 'cash'] as const, {
    error: 'Payment type is required',
  }),
  bonusAmount: z.coerce.number().min(0, 'Bonus amount cannot be negative').optional(),
  deductionAmount: z.coerce.number().min(0, 'Deduction amount cannot be negative').optional(),
  adjustmentNote: z.string().optional(),
  status: z.enum(['generated', 'approved', 'paid', 'cancelled'] as const),
  paymentDate: z.string().optional(),
  paymentReference: z.string().optional(),
  paymentNotes: z.string().optional(),
})

export type PayrollFormValues = z.infer<typeof PayrollSchema>

interface Option {
  value: string
  label: string
}

interface PayrollFormProps {
  mode: 'create' | 'edit'
  onSubmit?: (data: PayrollFormValues) => Promise<any>
  formAction?: (formData: FormData) => Promise<void>
  employees: Option[]
  initialData?: Partial<Payroll>
}

export function PayrollForm({
  mode,
  onSubmit,
  formAction,
  employees,
  initialData,
}: PayrollFormProps) {
  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PayrollFormValues>({
    resolver: zodResolver(PayrollSchema) as any,
    defaultValues: {
      employee: initialData?.employeeId || '',
      month: (initialData?.month as any) || '01',
      year: initialData?.year || new Date().getFullYear(),
      paymentType: 'bankTransfer',
      bonusAmount: initialData?.bonusAmount ? Number(initialData.bonusAmount) : 0,
      deductionAmount: initialData?.deductionAmount ? Number(initialData.deductionAmount) : 0,
      adjustmentNote: initialData?.adjustmentNote || '',
      status: (initialData?.status as any) || 'generated',
      paymentDate: initialData?.paymentDate
        ? new Date(initialData.paymentDate).toISOString().split('T')[0]
        : '',
      paymentReference: initialData?.paymentReference || '',
      paymentNotes: initialData?.paymentNotes || '',
    },
  })

  const formRef = React.useRef<HTMLFormElement>(null)
  const [nativeSubmitting, setNativeSubmitting] = React.useState(false)

  // Watch status to show/hide payment fields
  const status = watch('status')

  const statusOptions: Option[] = [
    { label: 'Generated', value: 'generated' },
    { label: 'Approved', value: 'approved' },
    { label: 'Paid', value: 'paid' },
    { label: 'Cancelled', value: 'cancelled' },
  ]

  const paymentTypeOptions: Option[] = [
    { label: 'Bank Transfer', value: 'bankTransfer' },
    { label: 'Cash', value: 'cash' },
  ]

  const monthOptions: Option[] = [
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/payroll">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">
              {mode === 'create' ? 'Add Payroll Record' : 'Edit Payroll Record'}
            </h1>
          </div>
        </div>

        <form
          ref={formRef}
          action={formAction as any}
          onSubmit={!formAction ? handleSubmit(async (values) => onSubmit?.(values)) : undefined}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SelectField
                  control={control}
                  name={'employee'}
                  label="Employee *"
                  placeholder="Select employee"
                  options={employees}
                  error={errors.employee?.message as string | undefined}
                  searchable={true}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    control={control}
                    name={'month'}
                    label="Month *"
                    placeholder="Select month"
                    options={monthOptions}
                    error={errors.month?.message as string | undefined}
                  />

                  <div>
                    <label htmlFor="year" className="text-sm font-medium text-foreground">
                      Year *
                    </label>
                    <input
                      id="year"
                      type="number"
                      className="w-full rounded-md border bg-background p-2"
                      {...register('year', { valueAsNumber: true })}
                    />
                    {errors.year && (
                      <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
                    )}
                  </div>
                </div>

                <SelectField
                  control={control}
                  name={'status'}
                  label="Status *"
                  placeholder="Select status"
                  options={statusOptions}
                  error={errors.status?.message as string | undefined}
                />
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SelectField
                  control={control}
                  name={'paymentType'}
                  label="Payment Type *"
                  placeholder="Select payment type"
                  options={paymentTypeOptions}
                  error={errors.paymentType?.message as string | undefined}
                />
                <p className="text-sm text-muted-foreground">
                  Select how the payroll will be paid to the employee.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Adjustments */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bonusAmount" className="px-1 text-sm font-medium text-foreground">
                    One-time Bonus Amount
                  </label>
                  <input
                    id="bonusAmount"
                    type="number"
                    step="0.01"
                    className="mt-2 w-full rounded-md border bg-background p-2"
                    {...register('bonusAmount', { valueAsNumber: true })}
                  />
                  {errors.bonusAmount && (
                    <p className="text-red-500 text-sm mt-1">{errors.bonusAmount.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="deductionAmount"
                    className="px-1 text-sm font-medium text-foreground"
                  >
                    Additional Deduction
                  </label>
                  <input
                    id="deductionAmount"
                    type="number"
                    step="0.01"
                    className="mt-2 w-full rounded-md border bg-background p-2"
                    {...register('deductionAmount', { valueAsNumber: true })}
                  />
                  {errors.deductionAmount && (
                    <p className="text-red-500 text-sm mt-1">{errors.deductionAmount.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="adjustmentNote"
                  className="px-1 text-sm font-medium text-foreground"
                >
                  Adjustment Notes
                </label>
                <textarea
                  id="adjustmentNote"
                  className="mt-2 w-full rounded-md border bg-background p-2"
                  rows={3}
                  placeholder="Explain reason for bonus or deduction..."
                  {...register('adjustmentNote')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Tracking */}
          {status === 'paid' && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="paymentDate"
                      className="px-1 text-sm font-medium text-foreground"
                    >
                      Payment Date
                    </label>
                    <input
                      id="paymentDate"
                      type="date"
                      className="mt-2 w-full rounded-md border bg-background p-2"
                      {...register('paymentDate')}
                    />
                    {errors.paymentDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.paymentDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="paymentReference"
                      className="px-1 text-sm font-medium text-foreground"
                    >
                      Payment Reference
                    </label>
                    <input
                      id="paymentReference"
                      type="text"
                      placeholder="Transaction ID, cheque number, etc."
                      className="mt-2 w-full rounded-md border bg-background p-2"
                      {...register('paymentReference')}
                    />
                    {errors.paymentReference && (
                      <p className="text-red-500 text-sm mt-1">{errors.paymentReference.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="paymentNotes"
                    className="px-1 text-sm font-medium text-foreground"
                  >
                    Payment Notes
                  </label>
                  <textarea
                    id="paymentNotes"
                    className="mt-2 w-full rounded-md border bg-background p-2"
                    rows={3}
                    placeholder="Additional payment notes..."
                    {...register('paymentNotes')}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Link href="/payroll">
              <Button type="button" variant="outline" className="cursor-pointer">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button
              type={formAction ? 'button' : 'submit'}
              className="cursor-pointer disabled:cursor-not-allowed"
              disabled={isSubmitting || nativeSubmitting}
              onClick={async () => {
                if (!formAction) return
                const isValid = await trigger()
                if (isValid) {
                  setNativeSubmitting(true)
                  formRef.current?.requestSubmit()
                }
              }}
            >
              {isSubmitting || nativeSubmitting ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting || nativeSubmitting
                ? 'Saving...'
                : mode === 'create'
                  ? 'Create Payroll'
                  : 'Update Payroll'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
