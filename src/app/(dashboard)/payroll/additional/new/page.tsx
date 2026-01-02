import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { AdditionalPaymentForm } from '@/components/payroll/forms/additional-payment-form'

export const metadata: Metadata = {
  title: 'New Payment',
  description: 'Create a new additional payment',
}

export default async function NewAdditionalPaymentPage() {
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

  // Prepare employees list before passing to client component
  const employeeOptions = userResult.docs.map((u) => ({
    value: String(u.id),
    label: u.fullName,
  }))

  const handleCreateAdditionalPayment = async (formData: FormData) => {
    'use server'

    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })
    if (!user) throw new Error('Unauthorized')

    const employeeId = String(formData.get('employee') || '')
    const category = String(formData.get('category') || 'bonus')
    const description = String(formData.get('description') || '')
    const amount = Number(formData.get('amount') || 0)
    const paymentType = String(formData.get('paymentType') || 'bankTransfer')
    const month = String(formData.get('month') || '')
    const year = Number(formData.get('year') || 0)
    const status = String(formData.get('status') || 'generated')
    const notes = String(formData.get('notes') || '')
    const paymentDate = String(formData.get('paymentDate') || '')

    console.log('Form data received:', {
      employeeId,
      category,
      description,
      amount,
      paymentType,
      month,
      year,
      status,
      notes,
      paymentDate,
    })

    // Validate required fields
    if (!description || description.trim() === '') {
      throw new Error('Description is required')
    }

    const data: any = {
      employee: parseInt(employeeId),
      category: category as
        | 'bonus'
        | 'deduction'
        | 'advance'
        | 'commission'
        | 'allowance'
        | 'other',
      description,
      amount,
      paymentType: paymentType as 'bankTransfer' | 'cash' | 'cheque',
      period: {
        month: month as
          | '01'
          | '02'
          | '03'
          | '04'
          | '05'
          | '06'
          | '07'
          | '08'
          | '09'
          | '10'
          | '11'
          | '12',
        year,
      },
      status: status as 'generated' | 'approved' | 'paid' | 'cancelled',
      notes: notes || null,
      paymentDate: paymentDate || null,
    }

    // If status is paid or cancelled, set processedBy
    if (['paid', 'cancelled'].includes(status)) {
      data.processedBy = user.id
    }

    await payload.create({ collection: 'additional-payments', data, user })

    redirect('/payroll')
  }

  return (
    <>
      <AdditionalPaymentForm
        formAction={handleCreateAdditionalPayment}
        employees={employeeOptions}
      />
    </>
  )
}
