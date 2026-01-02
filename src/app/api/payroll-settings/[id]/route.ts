import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })

    // Authenticate user
    const { user } = await payload.auth({ headers: await headers() })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete the payroll setting record
    await payload.delete({
      collection: 'payroll-settings',
      id,
      user,
    })

    return NextResponse.json({
      success: true,
      message: 'Payroll setting deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting payroll setting:', error)
    return NextResponse.json({ error: 'Failed to delete payroll setting' }, { status: 500 })
  }
}
