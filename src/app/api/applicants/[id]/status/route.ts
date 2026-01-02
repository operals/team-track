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
    const { status, internalNotes } = body

    // Validate status
    const validStatuses = [
      'new',
      'under-review',
      'shortlisted',
      'interview-scheduled',
      'rejected',
      'hired',
    ]
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 },
      )
    }

    // Get current applicant
    const currentApplicant = await payload.findByID({
      collection: 'applicants',
      id,
      user,
    })

    if (!currentApplicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      status,
    }

    // If status is being changed from 'new', set reviewed info
    if (currentApplicant.status === 'new' && status !== 'new') {
      updateData.reviewedBy = user.id
      updateData.reviewedAt = new Date().toISOString()
    }

    // If internal notes are provided, update them
    if (internalNotes !== undefined && internalNotes !== null) {
      updateData.internalNotes = internalNotes
    }

    // Update the applicant status
    const updatedApplicant = await payload.update({
      collection: 'applicants',
      id,
      data: updateData,
      user,
    })

    return NextResponse.json({
      success: true,
      applicant: updatedApplicant,
    })
  } catch (error) {
    console.error('Error updating applicant status:', error)
    return NextResponse.json({ error: 'Failed to update applicant status' }, { status: 500 })
  }
}
