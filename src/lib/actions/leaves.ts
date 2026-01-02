'use server'

import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function updateLeaveDayInline(id: string, data: { status?: string; user?: string | number | null }) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) throw new Error('Unauthorized')

  const patch: any = {}
  if (data.status) patch.status = data.status
  if (data.user === null) patch.user = null
  else if (typeof data.user !== 'undefined' && data.user !== '') patch.user = Number(data.user)

  await payload.update({ collection: 'leave-days', id, data: patch, user })
  revalidatePath('/leaves')
}

