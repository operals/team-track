import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    // Parse the form data
    const formData = await request.formData()
    const documentIds: number[] = [...existingDocIds]

    // Upload new documents
    let docIndex = 0
    while (formData.has(`documents[${docIndex}]`)) {
      const doc = formData.get(`documents[${docIndex}]`) as File | null
      if (doc && typeof doc === 'object' && 'arrayBuffer' in doc && doc.size > 0) {
        const arrayBuffer = await doc.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const uploadResult = await payload.create({
          collection: 'media',
          data: {
            alt: `${currentUser.fullName} - ${doc.name}`,
          },
          file: {
            data: buffer,
            mimetype: doc.type,
            name: doc.name,
            size: doc.size,
          },
          user,
        })
        documentIds.push(uploadResult.id as number)
      }
      docIndex++
    }

    // Update the user with new documents
    await payload.update({
      collection: 'users',
      id,
      data: {
        documents: documentIds,
      },
      user,
    })

    return NextResponse.json({
      success: true,
      message: 'Documents uploaded successfully',
      documentCount: documentIds.length,
    })
  } catch (error) {
    console.error('Error uploading documents:', error)
    return NextResponse.json({ error: 'Failed to upload documents' }, { status: 500 })
  }
}
