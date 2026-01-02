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

    // Validate status
    const validStatuses = ['requested', 'approved', 'rejected', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 },
      )
    }

    // Get current leave to check existing status
    const currentLeave = await payload.findByID({
      collection: 'leave-days',
      id,
      user,
    })

    // Check if current status is final (cannot be changed)
    const finalStatuses = ['approved', 'rejected', 'cancelled']
    if (currentLeave.status && finalStatuses.includes(currentLeave.status)) {
      return NextResponse.json(
        { error: 'Cannot change status. Leave request has already been processed.' },
        { status: 400 },
      )
    }

    // Update the leave status
    const updatedLeave = await payload.update({
      collection: 'leave-days',
      id,
      data: { status },
      user,
    })

    return NextResponse.json({
      success: true,
      leave: updatedLeave,
    })
  } catch (error) {
    console.error('Error updating leave status:', error)
    return NextResponse.json({ error: 'Failed to update leave status' }, { status: 500 })
  }
}
