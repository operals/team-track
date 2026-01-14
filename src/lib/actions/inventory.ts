'use server'

import { db } from '@/db'
import { inventoryTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth-guards'

export async function updateInventoryInline(
  id: string,
  data: { status?: string; holder?: string | null },
) {
  // Check authentication
  await requireAuth()

  const updateData: any = { updatedAt: new Date().toISOString() }

  if (data.status) {
    updateData.status = data.status as any
  }

  if (data.holder === null) {
    updateData.holderId = null
  } else if (data.holder) {
    updateData.holderId = data.holder
  }

  await db.update(inventoryTable).set(updateData).where(eq(inventoryTable.id, id))

  revalidatePath('/inventory')
}
