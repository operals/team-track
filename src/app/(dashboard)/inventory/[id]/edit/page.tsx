import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { requireAuth } from '@/lib/auth-guards'
import { inventoryTable, usersTable, mediaTable } from '@/db/schema'
import { InventoryForm } from '@/components/inventory/forms/inventory-form'
import { SetBreadcrumbLabel } from '@/components/set-breadcrumb-label'
import { eq, asc } from 'drizzle-orm'
import { writeFile } from 'fs/promises'
import { join } from 'path'

interface EditInventoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditInventoryPage({ params }: EditInventoryPageProps) {
  const { id } = await params
  await requireAuth()

  try {
    const item = await db.query.inventoryTable.findFirst({
      where: eq(inventoryTable.id, id),
    })

    if (!item) {
      notFound()
    }

    const users = await db.select().from(usersTable).orderBy(asc(usersTable.fullName))

    const handleUpdate = async (formData: FormData) => {
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

      // Image IDs to keep, coming from the form
      const keptIds = (formData.getAll('keepImageIds') as string[]).filter((v) => v)

      // Upload new images
      const imageFiles = formData
        .getAll('image')
        .filter((f): f is File => f instanceof File && f.size > 0)
      const newIds: string[] = []

      for (const file of imageFiles) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const timestamp = Date.now()
        const fileExtension = file.name.split('.').pop()
        const filename = `inventory-${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`
        const filepath = join(process.cwd(), 'public', 'media', filename)

        await writeFile(filepath, buffer)

        const [media] = await db
          .insert(mediaTable)
          .values({
            filename,
            mimeType: file.type,
            filesize: file.size,
            url: `/media/${filename}`,
          })
          .returning()

        newIds.push(media.id)
      }

      const data: any = {
        itemType,
        model,
        serialNumber,
        status,
        image: JSON.stringify([...keptIds, ...newIds]),
        updatedAt: new Date().toISOString(),
      }

      if (holder && holder.trim() !== '') {
        data.holderId = holder
      } else {
        data.holderId = null
      }
      if (purchaseDate) data.purchaseDate = purchaseDate
      else data.purchaseDate = null
      if (warrantyExpiry) data.warrantyExpiry = warrantyExpiry
      else data.warrantyExpiry = null
      data.notes = notes || null

      await db.update(inventoryTable).set(data).where(eq(inventoryTable.id, id))
      redirect('/inventory')
    }

    return (
      <>
        <SetBreadcrumbLabel label={item.itemType} />
        <InventoryForm
          mode="edit"
          initialData={item}
          formAction={handleUpdate}
          holders={users.map((u) => ({ value: String(u.id), label: u.fullName }))}
        />
      </>
    )
  } catch (e) {
    notFound()
  }
}
