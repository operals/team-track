import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { InventoryForm } from '@/components/inventory/forms/inventory-form'
import { SetBreadcrumbLabel } from '@/components/set-breadcrumb-label'

interface EditInventoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditInventoryPage({ params }: EditInventoryPageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin')

  try {
    const item = await payload.findByID({ collection: 'inventory', id, depth: 2, user })
    const userResult = await payload.find({
      collection: 'users',
      limit: 100,
      sort: 'fullName',
      user,
    })

    const handleUpdate = async (formData: FormData) => {
      'use server'

      const payload = await getPayload({ config: configPromise })
      const { user } = await payload.auth({ headers: await headers() })
      if (!user) throw new Error('Unauthorized')

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
      const keptIds: number[] = (formData.getAll('keepImageIds') as string[])
        .map((v) => Number(v))
        .filter((n) => !Number.isNaN(n))

      // Upload new images
      const imageFiles = formData
        .getAll('image')
        .filter((f): f is File => f instanceof File && f.size > 0)
      const newIds: number[] = []
      for (const file of imageFiles) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const upload = await payload.create({
          collection: 'media',
          data: { alt: `${itemType || item.itemType} image` },
          file: { data: buffer, mimetype: file.type, name: file.name, size: file.size },
          user,
        })
        newIds.push(upload.id as number)
      }

      const data: any = {
        itemType,
        model,
        serialNumber,
        status,
        image: [...keptIds, ...newIds],
      }
      if (holder && holder.trim() !== '') {
        const holderId = parseInt(holder)
        if (!isNaN(holderId)) {
          data.holder = holderId
        }
      } else {
        data.holder = null
      }
      if (purchaseDate) data.purchaseDate = purchaseDate
      else data.purchaseDate = null
      if (warrantyExpiry) data.warrantyExpiry = warrantyExpiry
      else data.warrantyExpiry = null
      data.notes = notes || null

      await payload.update({ collection: 'inventory', id, data, user })
      redirect('/inventory')
    }

    return (
      <>
        <SetBreadcrumbLabel label={item.itemType} />
        <InventoryForm
          mode="edit"
          initialData={item}
          formAction={handleUpdate}
          holders={userResult.docs.map((u) => ({ value: String(u.id), label: u.fullName }))}
        />
      </>
    )
  } catch (e) {
    notFound()
  }
}
