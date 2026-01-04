import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { requireAuth } from '@/lib/auth-guards'
import { leavesTable, usersTable } from '@/db/schema'
import { LeaveDayForm } from '@/components/leaves/forms/leave-form'
import { asc } from 'drizzle-orm'

export const metadata: Metadata = {
  title: 'New Leave Request',
  description: 'Create a new leave request',
}

export default async function NewLeavePage() {
  await requireAuth()

  // Fetch user options for user select
  const users = await db.select().from(usersTable).orderBy(asc(usersTable.fullName))

  const handleCreateLeave = async (formData: FormData) => {
    'use server'

    await requireAuth()

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
      userId,
      type,
      startDate,
      endDate,
      totalDays: calculatedDays,
      status,
      reason,
    }

    if (note) data.note = note

    await db.insert(leavesTable).values(data)

    redirect('/leaves')
  }

  return (
    <>
      <LeaveDayForm
        mode="create"
        formAction={handleCreateLeave}
        users={users.map((u) => ({ value: String(u.id), label: u.fullName }))}
        showStatusField={false} // Regular users can't set status - always starts as "requested"
      />
    </>
  )
}
