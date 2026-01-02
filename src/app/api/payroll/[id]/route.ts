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

    // Check current payroll status before deleting
    const currentPayroll = await payload.findByID({
      collection: 'payroll',
      id,
      user,
    })

    // Prevent deleting if status is paid or cancelled
    if (currentPayroll.status === 'paid' || currentPayroll.status === 'cancelled') {
      return NextResponse.json(
        { error: `Cannot delete ${currentPayroll.status} payroll` },
        { status: 403 },
      )
    }

    // Delete the payroll record
    await payload.delete({
      collection: 'payroll',
      id,
      user,
    })

    return NextResponse.json({
      success: true,
      message: 'Payroll deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting payroll:', error)
    return NextResponse.json({ error: 'Failed to delete payroll' }, { status: 500 })
  }
}
