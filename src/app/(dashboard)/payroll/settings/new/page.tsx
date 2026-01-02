import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SettingsForm } from '@/components/payroll/forms/settings-form'

export const metadata: Metadata = {
  title: 'New Payroll Setting',
  description: 'Create a new payroll setting',
}

export default async function NewPayrollSettingPage() {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/login')

  // Fetch user options for employee select
  const userResult = await payload.find({
    collection: 'users',
    limit: 100,
    sort: 'fullName',
    where: {
      isSuperAdmin: {
        not_equals: true,
      },
    },
    user,
  })

  const handleCreateSetting = async (formData: FormData) => {
    'use server'

    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })
    if (!user) throw new Error('Unauthorized')

    const employeeId = String(formData.get('employee') || '')
    const payrollType = String(formData.get('payrollType') || 'primary')
    const description = String(formData.get('description') || '')
    const amount = Number(formData.get('amount') || 0)
    const paymentType = String(formData.get('paymentType') || 'bankTransfer')
    const paymentFrequency = String(formData.get('paymentFrequency') || 'monthly')
    const accountNumber = String(formData.get('accountNumber') || '')
    const bankName = String(formData.get('bankName') || '')
    const accountHolderName = String(formData.get('accountHolderName') || '')
    const swiftCode = String(formData.get('swiftCode') || '')
    const isActive = formData.get('isActive') === 'on' || formData.get('isActive') === 'true'
    const startDate = String(formData.get('startDate') || '')
    const endDate = String(formData.get('endDate') || '')
    const notes = String(formData.get('notes') || '')

    const data: any = {
      employee: parseInt(employeeId),
      payrollType: payrollType as
        | 'primary'
        | 'bonus'
        | 'overtime'
        | 'commission'
        | 'allowance'
        | 'other',
      description: description || null,
      paymentDetails: {
        amount,
        paymentType: paymentType as 'bankTransfer' | 'cash' | 'cheque',
        paymentFrequency: paymentFrequency as 'monthly' | 'quarterly' | 'annual' | 'oneTime',
      },
      bankAccount: {
        accountNumber: accountNumber || null,
        bankName: bankName || null,
        accountHolderName: accountHolderName || null,
        swiftCode: swiftCode || null,
      },
      isActive,
      effectiveDate: {
        startDate,
        endDate: endDate || null,
      },
      notes: notes || null,
    }

    await payload.create({ collection: 'payroll-settings', data, user })

    redirect('/payroll/settings')
  }

  return (
    <>
      <SettingsForm
        mode="create"
        formAction={handleCreateSetting}
        employees={userResult.docs.map((u) => ({ value: String(u.id), label: u.fullName }))}
      />
    </>
  )
}
