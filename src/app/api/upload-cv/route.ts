import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Simple rate limiting: track IP addresses
const uploadAttempts = new Map<string, { count: number; resetTime: number }>()
const MAX_UPLOADS_PER_HOUR = 5
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds

export async function POST(req: NextRequest) {
  // Rate limiting check
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()

  const userAttempts = uploadAttempts.get(ip)
  if (userAttempts) {
    if (now < userAttempts.resetTime) {
      if (userAttempts.count >= MAX_UPLOADS_PER_HOUR) {
        return NextResponse.json(
          { success: false, message: 'Too many upload attempts. Please try again later.' },
          { status: 429 },
        )
      }
      userAttempts.count++
    } else {
      // Reset counter after time window
      uploadAttempts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    }
  } else {
    uploadAttempts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only PDF files are allowed.' },
        { status: 400 },
      )
    }

    // Verify actual PDF content by checking magic bytes
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const header = buffer.toString('utf8', 0, 5)
    if (header !== '%PDF-') {
      return NextResponse.json(
        { success: false, message: 'Invalid PDF file. File content does not match PDF format.' },
        { status: 400 },
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 5MB limit' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Create media record using Payload's upload functionality
    // We use a system user context (bypass auth) for public CV uploads
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: `CV - ${file.name}`,
      },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
      overrideAccess: true, // Bypass access control for this operation
    })

    return NextResponse.json(
      {
        success: true,
        doc: {
          id: media.id,
          url: media.url,
          filename: media.filename,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error uploading CV:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to upload CV',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
