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

    // Fetch the current additional payment to check status
    const currentPayment = await payload.findByID({
      collection: 'additional-payments',
      id,
    })

    // Prevent deletion of paid or cancelled payments
    if (currentPayment.status === 'paid' || currentPayment.status === 'cancelled') {
      return NextResponse.json(
        { error: `Cannot delete ${currentPayment.status} payment` },
        { status: 403 },
      )
    }

    // Delete the payment
    await payload.delete({
      collection: 'additional-payments',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting additional payment:', error)
    return NextResponse.json({ error: 'Failed to delete additional payment' }, { status: 500 })
  }
}
