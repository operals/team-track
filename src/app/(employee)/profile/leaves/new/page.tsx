import { redirect } from 'next/navigation'
import { db } from '@/db'
import { leavesTable } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { hasFullAccess } from '@/lib/rbac'
import { LeaveDayForm } from '@/components/leaves/forms/leave-form'
import { requireAuth } from '@/lib/auth-guards'

export default async function EmployeeCreateLeavePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Admin and manager should use the main leaves page
  if (hasFullAccess(user as any)) {
    redirect('/leaves')
  }

  const requesterOption = {
    value: String(user.id),
    label: user.name || user.email || 'Current User',
  }

  const handleCreateLeave = async (formData: FormData) => {
    'use server'

    const user = await requireAuth()

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
      userId: user.id,
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

    await db.insert(leavesTable).values(data)

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
