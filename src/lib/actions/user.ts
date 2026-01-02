'use server'

import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function updateUserStatus(userId: string, isActive: boolean) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })

    if (!user) {
      throw new Error('Unauthorized')
    }

    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        isActive,
      },
      user,
    })

    // Revalidate the user pages to show updated status
    revalidatePath('/users')
    revalidatePath(`/users/${userId}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating user status:', error)
    throw new Error('Failed to update user status')
  }
}
