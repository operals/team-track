import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SettingsForm } from '@/components/payroll/forms/settings-form'
import { SetBreadcrumbLabel } from '@/components/set-breadcrumb-label'

interface EditPayrollSettingPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPayrollSettingPage({ params }: EditPayrollSettingPageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/login')

  try {
    const settingItem = await payload.findByID({
      collection: 'payroll-settings',
      id,
      depth: 2,
      user,
    })
    const userResult = await payload.find({
      collection: 'users',
      limit: 100,
      sort: 'fullName',
      user,
    })

    const handleUpdate = async (formData: FormData) => {
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

      await payload.update({ collection: 'payroll-settings', id, data, user })
      redirect('/payroll/settings')
    }

    const employeeName =
      typeof settingItem.employee === 'object' && settingItem.employee
        ? (settingItem.employee as any).fullName
        : 'Setting'

    const label = settingItem.description || `${employeeName} - ${settingItem.payrollType}`

    return (
      <>
        <SetBreadcrumbLabel label={label} />
        <SettingsForm
          mode="edit"
          initialData={settingItem}
          formAction={handleUpdate}
          employees={userResult.docs.map((u) => ({ value: String(u.id), label: u.fullName }))}
        />
      </>
    )
  } catch (e) {
    notFound()
  }
}
