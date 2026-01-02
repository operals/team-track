import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { LeaveDayForm } from '@/components/leaves/forms/leave-form'

export const metadata: Metadata = {
  title: 'New Leave Request',
  description: 'Create a new leave request',
}

export default async function NewLeavePage() {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/login')

  // Fetch user options for user select
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

  const handleCreateLeave = async (formData: FormData) => {
    'use server'

    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })
    if (!user) throw new Error('Unauthorized')

    const userId = String(formData.get('user') || '')
    const type = String(formData.get('type') || '')
    const startDate = String(formData.get('startDate') || '')
    const endDate = String(formData.get('endDate') || '')
    const status = 'requested' // Always start with requested status
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

    await payload.create({ collection: 'leave-days', data, user })

    redirect('/leaves')
  }

  return (
    <>
      <LeaveDayForm
        mode="create"
        formAction={handleCreateLeave}
        users={userResult.docs.map((u) => ({ value: String(u.id), label: u.fullName }))}
        showStatusField={false} // Regular users can't set status - always starts as "requested"
      />
    </>
  )
}
