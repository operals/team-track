import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })

    // Authenticate user
    const { user } = await payload.auth({ headers: await headers() })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { status } = body

    // Check current payroll status
    const currentPayroll = await payload.findByID({
      collection: 'payroll',
      id,
      user,
    })

    // Prevent changing status if already paid or cancelled
    if (currentPayroll.status === 'paid' || currentPayroll.status === 'cancelled') {
      return NextResponse.json(
        { error: `Cannot change status of ${currentPayroll.status} payroll` },
        { status: 403 },
      )
    }

    // Validate status
    const validStatuses = ['generated', 'approved', 'paid', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 },
      )
    }

    // Update the payroll status
    const updatedPayroll = await payload.update({
      collection: 'payroll',
      id,
      data: { status },
      user,
    })

    return NextResponse.json({
      success: true,
      payroll: updatedPayroll,
    })
  } catch (error) {
    console.error('Error updating payroll status:', error)
    return NextResponse.json({ error: 'Failed to update payroll status' }, { status: 500 })
  }
}
