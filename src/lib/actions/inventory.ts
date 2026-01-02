'use server'

import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function updateInventoryInline(id: string, data: { status?: string; holder?: string | number | null }) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) throw new Error('Unauthorized')

  const patch: any = {}
  if (data.status) patch.status = data.status
  if (data.holder === null) patch.holder = null
  else if (typeof data.holder !== 'undefined' && data.holder !== '') patch.holder = Number(data.holder)

  await payload.update({ collection: 'inventory', id, data: patch, user })
  revalidatePath('/inventory')
}

