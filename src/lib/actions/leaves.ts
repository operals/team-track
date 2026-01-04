'use server'

import { db } from '@/db'
import { leavesTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth-guards'

export async function updateLeaveDayInline(
  id: string,
  data: { status?: string; user?: string | null },
) {
  // Check authentication
  await requireAuth()

  const updateData: any = { updatedAt: new Date() }

  if (data.status) {
    updateData.status = data.status as any
  }

  if (data.user === null) {
    updateData.userId = null
  } else if (data.user) {
    updateData.userId = data.user
  }

  await db.update(leavesTable).set(updateData).where(eq(leavesTable.id, id))

  revalidatePath('/leaves')
}
