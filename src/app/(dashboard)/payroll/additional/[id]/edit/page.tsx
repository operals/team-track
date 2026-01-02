import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import AdditionalPaymentForm from '@/components/payroll/forms/additional-payment-form'

export default async function EditAdditionalPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const payload = await getPayload({ config })
  const { id } = await params

  // Remove the 'additional-' prefix if present
  const actualId = id.startsWith('additional-') ? id.replace('additional-', '') : id

  // Fetch the additional payment record
  const additionalPayment = await payload.findByID({
    collection: 'additional-payments',
    id: actualId,
  })

  if (!additionalPayment) {
    redirect('/payroll')
  }

  // Check if payment is locked (paid or cancelled)
  if (additionalPayment.status === 'paid' || additionalPayment.status === 'cancelled') {
    redirect('/payroll')
  }

  // Fetch all active users for the dropdown
  const users = await payload.find({
    collection: 'users',
    limit: 1000,
    where: {
      isActive: {
        equals: true,
      },
    },
  })

  async function handleUpdateAdditionalPayment(formData: FormData) {
    'use server'
    const payload = await getPayload({ config })

    const employeeId = formData.get('employee') as string
    const category = formData.get('category') as
      | 'bonus'
      | 'deduction'
      | 'advance'
      | 'commission'
      | 'allowance'
      | 'other'
    const description = formData.get('description') as string
    const amount = parseFloat(formData.get('amount') as string)
    const paymentType = formData.get('paymentType') as 'bankTransfer' | 'cash' | 'cheque'
    const month = formData.get('month') as
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
      | '12'
    const year = parseInt(formData.get('year') as string)
    const paymentDate = formData.get('paymentDate') as string

    console.log('Updating additional payment with FormData:', {
      employeeId,
      category,
      description,
      amount,
      paymentType,
      month,
      year,
      paymentDate,
    })

    // Validate required fields
    if (!description || description.trim() === '') {
      console.error('Description is empty')
      throw new Error('Description is required')
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      console.error('Invalid amount:', amount)
      throw new Error('Amount must be greater than 0')
    }

    try {
      await payload.update({
        collection: 'additional-payments',
        id: actualId,
        data: {
          employee: parseInt(employeeId),
          category,
          description: description.trim(),
          amount,
          paymentType,
          period: {
            month,
            year,
          },
          paymentDate,
        },
      })

      redirect('/payroll')
    } catch (error) {
      console.error('Error updating additional payment:', error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <AdditionalPaymentForm
        formAction={handleUpdateAdditionalPayment}
        employees={users.docs.map((user) => ({
          value: String(user.id),
          label: user.fullName,
        }))}
        defaultValues={{
          employee:
            typeof additionalPayment.employee === 'object'
              ? String(additionalPayment.employee.id)
              : String(additionalPayment.employee),
          category: additionalPayment.category,
          description: additionalPayment.description,
          amount: additionalPayment.amount,
          paymentType: additionalPayment.paymentType,
          month: additionalPayment.period.month,
          year: additionalPayment.period.year,
          paymentDate: additionalPayment.paymentDate || '',
          status: additionalPayment.status,
          notes: additionalPayment.notes || '',
        }}
        isEdit={true}
      />
    </div>
  )
}
