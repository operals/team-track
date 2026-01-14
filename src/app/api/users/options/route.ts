import { NextResponse } from 'next/server'
import { db } from '@/db'
import { usersTable } from '@/db/schema'
import { asc } from 'drizzle-orm'

export async function GET() {
  try {
    const users = await db.select().from(usersTable).orderBy(asc(usersTable.fullName))

    const options = users.map((user) => ({
      value: String(user.id),
      label: user.fullName,
    }))

    return NextResponse.json({ options })
  } catch (error) {
    console.error('Error fetching user options:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
