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

const AdditionalPaymentSchema = z.object({
  employee: z.string().min(1, 'Employee is required'),
  category: z.enum(['bonus', 'deduction', 'advance', 'commission', 'allowance', 'other'], {
    message: 'Payment category is required',
  }),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  amount: z.coerce.number().positive('Amount must be positive'),
  paymentType: z.enum(['bankTransfer', 'cash', 'cheque'], {
    message: 'Payment type is required',
  }),
  month: z.enum(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'], {
    message: 'Month is required',
  }),
  year: z.coerce.number().min(2020).max(2030, 'Year must be between 2020 and 2030'),
  status: z.enum(['generated', 'approved', 'paid', 'cancelled']),
  notes: z.string().optional(),
  paymentDate: z.string().optional(),
})

export type AdditionalPaymentFormValues = z.infer<typeof AdditionalPaymentSchema>

interface Option {
  value: string
  label: string
}

interface AdditionalPaymentFormProps {
  formAction: (formData: FormData) => Promise<void>
  employees: Option[]
  defaultValues?: Partial<AdditionalPaymentFormValues>
  isEdit?: boolean
}

export function AdditionalPaymentForm({
  formAction,
  employees,
  defaultValues,
  isEdit = false,
}: AdditionalPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<AdditionalPaymentFormValues>({
    resolver: zodResolver(AdditionalPaymentSchema) as any,
    defaultValues: defaultValues || {
      employee: '',
      category: 'bonus',
      description: '',
      amount: 0,
      paymentType: 'bankTransfer',
      month: new Date().toISOString().slice(5, 7) as any,
      year: new Date().getFullYear(),
      status: 'generated',
      notes: '',
      paymentDate: '',
    },
  })

  const categoryOptions: Option[] = [
    { value: 'bonus', label: 'Bonus' },
    { value: 'deduction', label: 'Deduction' },
    { value: 'advance', label: 'Advance Payment' },
    { value: 'commission', label: 'Commission' },
    { value: 'allowance', label: 'Allowance' },
    { value: 'other', label: 'Other' },
  ]

  const paymentTypeOptions: Option[] = [
    { value: 'bankTransfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'cheque', label: 'Cheque' },
  ]

  const monthOptions: Option[] = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]

  const statusOptions: Option[] = [
    { value: 'generated', label: 'Generated' },
    { value: 'approved', label: 'Approved' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const selectedStatus = form.watch('status')
  const showPaymentDate = selectedStatus === 'paid'

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
              {isEdit ? 'Edit Additional Payment' : 'Add Additional Payment'}
            </h1>
          </div>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SelectField
                  control={form.control as any}
                  name="employee"
                  label="Employee *"
                  placeholder="Select employee"
                  options={employees}
                  searchable={true}
                />

                <SelectField
                  control={form.control as any}
                  name="category"
                  label="Payment Category *"
                  placeholder="Select category"
                  options={categoryOptions}
                />

                <div>
                  <label htmlFor="description" className="px-1 text-sm font-medium text-foreground">
                    Description *
                  </label>
                  <input
                    id="description"
                    type="text"
                    required
                    placeholder="e.g., Performance bonus Q4"
                    className="mt-2 w-full rounded-md border bg-background p-2"
                    {...form.register('description')}
                  />
                </div>

                <div>
                  <label htmlFor="amount" className="px-1 text-sm font-medium text-foreground">
                    Amount *
                  </label>
                  <input
                    id="amount"
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="mt-2 w-full rounded-md border bg-background p-2"
                    {...form.register('amount')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SelectField
                  control={form.control as any}
                  name="paymentType"
                  label="Payment Method *"
                  placeholder="Select payment method"
                  options={paymentTypeOptions}
                />

                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    control={form.control as any}
                    name="month"
                    label="Month *"
                    placeholder="Select month"
                    options={monthOptions}
                  />

                  <div>
                    <label htmlFor="year" className="px-1 text-sm font-medium text-foreground">
                      Year *
                    </label>
                    <input
                      id="year"
                      type="number"
                      required
                      min="2020"
                      max="2030"
                      className="mt-2 w-full rounded-md border bg-background p-2"
                      {...form.register('year', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <SelectField
                  control={form.control as any}
                  name="status"
                  label="Status *"
                  placeholder="Select status"
                  options={statusOptions}
                />
              </CardContent>
            </Card>
          </div>

          {/* Payment Tracking */}
          {showPaymentDate && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="paymentDate" className="px-1 text-sm font-medium text-foreground">
                    Payment Date
                  </label>
                  <input
                    id="paymentDate"
                    type="date"
                    className="mt-2 w-full rounded-md border bg-background p-2"
                    {...form.register('paymentDate')}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label htmlFor="notes" className="px-1 text-sm font-medium text-foreground">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Additional notes or comments..."
                  className="mt-2 w-full rounded-md border bg-background p-2"
                  {...form.register('notes')}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 pt-4">
            <Link href="/payroll">
              <Button type="button" variant="outline" className="cursor-pointer">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="cursor-pointer disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Update Payment' : 'Create Payment'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdditionalPaymentForm
