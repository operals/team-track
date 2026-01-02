'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import type { User, Inventory } from '@/payload-types'

export interface UserStats {
  total: number
  active: number
  inactive: number
}

export interface InventoryStats {
  total: number
  byType: {
    laptops: number
    phones: number
    simCards: number
    accessories: number
    other: number
  }
  byStatus: {
    inUse: number
    inStock: number
    needsRepair: number
    underRepair: number
  }
}

export async function getUserStats(): Promise<UserStats> {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Fetch all users (team) - Exclude super admins
  const allUsers = await payload.find({
    collection: 'users',
    limit: 1000, // Adjust based on your expected user count
    where: {
      isSuperAdmin: {
        not_equals: true,
      },
    },
    user,
  })

  const total = allUsers.docs.length
  const active = allUsers.docs.filter((user: User) => user.isActive).length
  const inactive = total - active

  return {
    total,
    active,
    inactive,
  }
}

export async function getInventoryStats(): Promise<InventoryStats> {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Fetch all inventory items
  const allInventory = await payload.find({
    collection: 'inventory',
    limit: 1000, // Adjust based on your expected inventory count
    user,
  })

  const total = allInventory.docs.length

  // Count by type
  const byType = {
    laptops: 0,
    phones: 0,
    simCards: 0,
    accessories: 0,
    other: 0,
  }

  // Count by status
  const byStatus = {
    inUse: 0,
    inStock: 0,
    needsRepair: 0,
    underRepair: 0,
  }

  allInventory.docs.forEach((item: Inventory) => {
    // Count by type
    switch (item.itemType) {
      case 'laptop':
        byType.laptops++
        break
      case 'phone':
        byType.phones++
        break
      case 'simCard':
        byType.simCards++
        break
      case 'accessory':
        byType.accessories++
        break
      case 'other':
        byType.other++
        break
    }

    // Count by status
    switch (item.status) {
      case 'inUse':
        byStatus.inUse++
        break
      case 'inStock':
        byStatus.inStock++
        break
      case 'needsRepair':
        byStatus.needsRepair++
        break
      case 'underRepair':
        byStatus.underRepair++
        break
    }
  })

  return {
    total,
    byType,
    byStatus,
  }
}
