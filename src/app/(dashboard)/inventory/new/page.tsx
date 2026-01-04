import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { requireAuth } from '@/lib/auth-guards'
import { inventoryTable, usersTable, mediaTable } from '@/db/schema'
import { InventoryForm } from '@/components/inventory/forms/inventory-form'
import { asc } from 'drizzle-orm'
import { writeFile } from 'fs/promises'
import { join } from 'path'

// Force dynamic rendering - do not generate static page at build time
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'New Inventory',
  description: 'Add a new inventory item',
}

export default async function NewInventoryPage() {
  await requireAuth()

  // Fetch user options for holder select
  const users = await db.select().from(usersTable).orderBy(asc(usersTable.fullName))

  const handleCreateInventory = async (formData: FormData) => {
    'use server'

    await requireAuth()

    const itemType = String(formData.get('itemType') || '')
    const model = String(formData.get('model') || '')
    const serialNumber = String(formData.get('serialNumber') || '')
    const status = String(formData.get('status') || '')
    const rawHolder = String(formData.get('holder') || '')
    const holder = rawHolder === '__none__' ? '' : rawHolder
    const purchaseDate = String(formData.get('purchaseDate') || '')
    const warrantyExpiry = String(formData.get('warrantyExpiry') || '')
    const notes = String(formData.get('notes') || '')

    // Upload multiple images
    const imageFiles = formData
      .getAll('image')
      .filter((f): f is File => f instanceof File && f.size > 0)
    const imagePaths: string[] = []

    for (const file of imageFiles) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const filename = `inventory-${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`
      const filepath = join(process.cwd(), 'public', 'media', filename)

      await writeFile(filepath, buffer)

      // Store file metadata in media table
      const [media] = await db
        .insert(mediaTable)
        .values({
          filename,
          mimeType: file.type,
          filesize: file.size,
          url: `/media/${filename}`,
        })
        .returning()

      imagePaths.push(media.id)
    }

    const data: any = {
      itemType,
      model,
      serialNumber,
      status,
    }

    if (holder && holder.trim() !== '') {
      data.holderId = holder
    }
    if (purchaseDate) data.purchaseDate = purchaseDate
    if (warrantyExpiry) data.warrantyExpiry = warrantyExpiry
    if (notes) data.notes = notes
    if (imagePaths.length) data.image = JSON.stringify(imagePaths)

    await db.insert(inventoryTable).values(data)

    redirect('/inventory')
  }

  return (
    <>
      <InventoryForm
        mode="create"
        formAction={handleCreateInventory}
        holders={users.map((u) => ({ value: String(u.id), label: u.fullName }))}
      />
    </>
  )
}
