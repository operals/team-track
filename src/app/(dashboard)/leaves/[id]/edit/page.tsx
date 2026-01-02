import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { LeaveDayForm } from '@/components/leaves/forms/leave-form'
import { SetBreadcrumbLabel } from '@/components/set-breadcrumb-label'

interface EditLeavePageProps {
  params: Promise<{ id: string }>
}

export default async function EditLeavePage({ params }: EditLeavePageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/login')

  try {
    const leaveItem = await payload.findByID({ collection: 'leave-days', id, depth: 2, user })
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

      const userId = String(formData.get('user') || '')
      const type = String(formData.get('type') || '')
      const startDate = String(formData.get('startDate') || '')
      const endDate = String(formData.get('endDate') || '')
      const status = String(formData.get('status') || 'requested')
      const reason = String(formData.get('reason') || '')
      const note = String(formData.get('note') || '')

      // Calculate total days
      let calculatedDays = 0
      if (startDate && endDate) {
        const start = new Date(startDate)
        const end = new Date(endDate)
        calculatedDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      }

      const data: any = {
        user: parseInt(userId),
        type,
        startDate,
        endDate,
        totalDays: calculatedDays,
        status,
        reason,
      }

      if (note) data.note = note
      else data.note = null

      await payload.update({ collection: 'leave-days', id, data, user })
      redirect('/leaves')
    }

    return (
      <>
        <SetBreadcrumbLabel label={`${leaveItem.type} Leave`} />
        <LeaveDayForm
          mode="edit"
          initialData={leaveItem}
          formAction={handleUpdate}
          users={userResult.docs.map((u) => ({ value: String(u.id), label: u.fullName }))}
        />
      </>
    )
  } catch (e) {
    notFound()
  }
}
