import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all users for the dropdown
    const userResult = await payload.find({
      collection: 'users',
      limit: 100,
      sort: 'fullName',
      user,
    })

    const options = userResult.docs.map((u) => ({
      value: String(u.id),
      label: u.fullName || u.username || u.email,
    }))

    return NextResponse.json({ options })
  } catch (error) {
    console.error('Error fetching user options:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
