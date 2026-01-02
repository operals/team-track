import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { PayrollForm } from '@/components/payroll/forms/payroll-form'
import { SetBreadcrumbLabel } from '@/components/set-breadcrumb-label'

interface EditPayrollPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPayrollPage({ params }: EditPayrollPageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin')

  try {
    const payrollItem = await payload.findByID({ collection: 'payroll', id, depth: 2, user })
    const userResult = await payload.find({
      collection: 'users',
      limit: 100,
      sort: 'fullName',
      user,
    })

    // Prepare employees list before passing to client component
    const employeeOptions = userResult.docs.map((u) => ({
      value: String(u.id),
      label: u.fullName,
    }))

    const employeeName =
      typeof payrollItem.employee === 'object' && payrollItem.employee
        ? (payrollItem.employee as any).fullName
        : 'Payroll'

    return (
      <>
        <SetBreadcrumbLabel
          label={`${employeeName} - ${payrollItem.period?.month}/${payrollItem.period?.year}`}
        />
        <PayrollForm
          mode="edit"
          initialData={payrollItem}
          formAction={handleUpdate.bind(null, id)}
          employees={employeeOptions}
        />
      </>
    )
  } catch (e) {
    notFound()
  }
}

async function handleUpdate(payrollId: string, formData: FormData) {
  'use server'

  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) throw new Error('Unauthorized')

  const employeeId = String(formData.get('employee') || '')
  const month = String(formData.get('month') || '')
  const year = Number(formData.get('year') || 0)
  const paymentType = String(formData.get('paymentType') || 'bankTransfer')
  const bonusAmount = Number(formData.get('bonusAmount') || 0)
  const deductionAmount = Number(formData.get('deductionAmount') || 0)
  const adjustmentNote = String(formData.get('adjustmentNote') || '')
  const status = String(formData.get('status') || 'generated')
  const paymentDate = String(formData.get('paymentDate') || '')
  const paymentReference = String(formData.get('paymentReference') || '')
  const paymentNotes = String(formData.get('paymentNotes') || '')

  // Fetch the current payroll item to get existing payroll items
  const currentPayroll = await payload.findByID({ collection: 'payroll', id: payrollId, user })

  const data: any = {
    employee: parseInt(employeeId),
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
    payrollItems:
      currentPayroll.payrollItems?.map((item: any) => ({
        ...item,
        paymentType: paymentType as 'bankTransfer' | 'cash',
      })) || [],
    adjustments: {
      bonusAmount,
      deductionAmount,
      adjustmentNote: adjustmentNote || null,
    },
    paymentDetails: {
      paymentDate: paymentDate || null,
      paymentReference: paymentReference || null,
      paymentNotes: paymentNotes || null,
    },
    status,
  }

  await payload.update({ collection: 'payroll', id: payrollId, data, user })
  redirect('/payroll')
}
