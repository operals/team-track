import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  try {
    const { id, docId } = await params
    const payload = await getPayload({ config: configPromise })

    // Authenticate user
    const { user } = await payload.auth({ headers: await headers() })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user to retrieve existing documents
    const currentUser = await payload.findByID({
      collection: 'users',
      id,
      user,
    })

    // Get existing document IDs
    const existingDocIds = Array.isArray(currentUser.documents)
      ? currentUser.documents.map((doc) =>
          typeof doc === 'object' && doc && 'id' in doc ? Number(doc.id) : Number(doc),
        )
      : []

    // Remove the specified document ID
    const updatedDocIds = existingDocIds.filter((id) => id !== Number(docId))

    // Update the user with the filtered documents
    await payload.update({
      collection: 'users',
      id,
      data: {
        documents: updatedDocIds,
      },
      user,
    })

    // Optionally delete the media file itself
    try {
      await payload.delete({
        collection: 'media',
        id: docId,
        user,
      })
    } catch (error) {
      console.log('Media file already deleted or not found')
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
