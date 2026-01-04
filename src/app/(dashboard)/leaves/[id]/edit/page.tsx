import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { requireAuth } from '@/lib/auth-guards'
import { leavesTable, usersTable } from '@/db/schema'
import { LeaveDayForm } from '@/components/leaves/forms/leave-form'
import { SetBreadcrumbLabel } from '@/components/set-breadcrumb-label'
import { eq, asc } from 'drizzle-orm'

interface EditLeavePageProps {
  params: Promise<{ id: string }>
}

export default async function EditLeavePage({ params }: EditLeavePageProps) {
  const { id } = await params
  await requireAuth()

  try {
    const leaveItem = await db.query.leavesTable.findFirst({
      where: eq(leavesTable.id, id),
      with: {
        user: true,
      },
    })

    if (!leaveItem) {
      notFound()
    }

    const users = await db.select().from(usersTable).orderBy(asc(usersTable.fullName))

    const handleUpdate = async (formData: FormData) => {
      'use server'

      await requireAuth()

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
        userId,
        type,
        startDate,
        endDate,
        totalDays: calculatedDays,
        status,
        reason,
        updatedAt: new Date().toISOString(),
      }

      if (note) data.note = note
      else data.note = null

      await db.update(leavesTable).set(data).where(eq(leavesTable.id, id))
      redirect('/leaves')
    }

    return (
      <>
        <SetBreadcrumbLabel label={`${leaveItem.type} Leave`} />
        <LeaveDayForm
          mode="edit"
          initialData={leaveItem}
          formAction={handleUpdate}
          users={users.map((u) => ({ value: String(u.id), label: u.fullName }))}
        />
      </>
    )
  } catch (e) {
    notFound()
  }
}
