import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { getCurrentUser } from '@/lib/auth'
import { LeaveDayForm } from '@/components/leaves/forms/leave-form'

const isAdminLevel = (roleLevel: string | undefined | null) =>
  roleLevel === 'admin' || roleLevel === 'manager'

export default async function EmployeeCreateLeavePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const role =
    typeof user.role === 'object' && user.role !== null ? (user.role as { level?: string }) : null
  const roleLevel = role?.level

  if (user.isSuperAdmin === true || isAdminLevel(roleLevel)) {
    redirect('/leaves')
  }

  const requesterOption = {
    value: String(user.id),
    label: user.fullName || user.email || 'Current User',
  }

  const handleCreateLeave = async (formData: FormData) => {
    'use server'

    const payload = await getPayload({ config: configPromise })
    const { user: authUser } = await payload.auth({ headers: await headers() })
    if (!authUser) {
      throw new Error('Unauthorized')
    }

    const type = String(formData.get('type') || '')
    const startDate = String(formData.get('startDate') || '')
    const endDate = String(formData.get('endDate') || '')
    const reason = String(formData.get('reason') || '')
    const note = String(formData.get('note') || '')

    let totalDays = 0
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    }

    const data: any = {
      user: Number(authUser.id),
      type,
      startDate,
      endDate,
      totalDays,
      status: 'requested',
      reason,
    }

    if (note) {
      data.note = note
    }

    await payload.create({
      collection: 'leave-days',
      data,
      user: authUser,
    })

    redirect('/profile')
  }

  return (
    <LeaveDayForm
      mode="create"
      formAction={handleCreateLeave}
      users={[requesterOption]}
      showStatusField={false}
      lockedUserOption={requesterOption}
      returnHref="/profile"
    />
  )
}
