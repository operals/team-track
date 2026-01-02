import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import configPromise from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return NextResponse.json({ options: [] }, { status: 401 })

  const res = await payload.find({ collection: 'users', limit: 100, sort: 'fullName', user })
  const options = res.docs.map((s) => ({ value: String(s.id), label: s.fullName }))
  return NextResponse.json({ options })
}
