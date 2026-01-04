import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { db } from '@/db'
import { mediaTable } from '@/db/schema'
import { getServerSession } from '@/lib/auth'
import { eq } from 'drizzle-orm'

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
const ALLOWED_TYPES = (
  process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,application/pdf'
).split(',')

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 },
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 },
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${sanitizedName}`

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'media')
    await mkdir(uploadDir, { recursive: true })

    // Write file to disk
    const filepath = path.join(uploadDir, filename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Get image dimensions if it's an image
    let width: number | null = null
    let height: number | null = null

    if (file.type.startsWith('image/')) {
      try {
        const sharp = (await import('sharp')).default
        const metadata = await sharp(buffer).metadata()
        width = metadata.width || null
        height = metadata.height || null
      } catch (error) {
        console.warn('Could not get image dimensions:', error)
      }
    }

    // Store metadata in database
    const [mediaRecord] = await db
      .insert(mediaTable)
      .values({
        filename,
        mimeType: file.type,
        filesize: file.size,
        width,
        height,
        url: `/media/${filename}`,
        alt: (formData.get('alt') as string) || '',
      })
      .returning()

    return NextResponse.json({
      success: true,
      file: mediaRecord,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// DELETE - Remove uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    // Get file info from database
    const [media] = await db.select().from(mediaTable).where(eq(mediaTable.id, fileId)).limit(1)

    if (!media) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete from filesystem
    const filepath = path.join(process.cwd(), 'public', 'media', media.filename)
    try {
      await unlink(filepath)
    } catch (error) {
      console.warn('Could not delete file from disk:', error)
    }

    // Delete from database
    await db.delete(mediaTable).where(eq(mediaTable.id, fileId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
