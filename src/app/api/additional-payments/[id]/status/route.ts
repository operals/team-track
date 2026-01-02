import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    const payload = await getPayload({ config: configPromise })

    // Fetch the current payment
    const currentPayment = await payload.findByID({
      collection: 'additional-payments',
      id,
    })

    // Prevent changing status of already paid or cancelled payments
    if (currentPayment.status === 'paid' || currentPayment.status === 'cancelled') {
      return NextResponse.json(
        { error: `Cannot change status of ${currentPayment.status} payment` },
        { status: 403 },
      )
    }

    // Update the payment
    const updated = await payload.update({
      collection: 'additional-payments',
      id,
      data: {
        status,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating additional payment status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
