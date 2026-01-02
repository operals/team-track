'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InputField } from '@/components/form/input-field'
import { SelectField } from '@/components/form/select-field'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save, X } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

const InventorySchemaBase = z.object({
  itemType: z.enum(['laptop', 'phone', 'accessory', 'simCard', 'other'] as const, {
    error: 'Item type is required',
  }),
  holder: z.string().optional(),
  model: z.string().min(1, 'Model is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  status: z.enum(['inUse', 'inStock', 'needsRepair', 'underRepair'] as const, {
    error: 'Status is required',
  }),
  purchaseDate: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  notes: z.string().optional(),
  // Multiple images handled through native <input type="file" multiple>
})

const InventorySchema = InventorySchemaBase.superRefine((val, ctx) => {
  if (val.status === 'inUse') {
    if (!val.holder || val.holder === '__none__') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['holder'],
        message: 'Holder is required when status is In Use',
      })
    }
  }
})

export type InventoryFormValues = z.infer<typeof InventorySchema>

interface Option {
  value: string
  label: string
}

interface InventoryFormProps {
  mode: 'create' | 'edit'
  onSubmit?: (data: InventoryFormValues) => Promise<any>
  formAction?: (formData: FormData) => Promise<void>
  holders: Option[]
  initialData?: Partial<import('@/payload-types').Inventory>
}

export function InventoryForm({
  mode,
  onSubmit,
  formAction,
  holders,
  initialData,
}: InventoryFormProps) {
  const {
    register,
    control,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InventoryFormValues>({
    resolver: zodResolver(InventorySchema) as any,
    defaultValues: {
      itemType: (initialData?.itemType as any) || 'other',
      model: initialData?.model || '',
      serialNumber: initialData?.serialNumber || '',
      status: (initialData?.status as any) || 'inStock',
      purchaseDate: initialData?.purchaseDate
        ? new Date(initialData.purchaseDate).toISOString().split('T')[0]
        : undefined,
      warrantyExpiry: initialData?.warrantyExpiry
        ? new Date(initialData.warrantyExpiry).toISOString().split('T')[0]
        : undefined,
      notes: initialData?.notes || '',
    },
  })

  const formRef = React.useRef<HTMLFormElement>(null)
  const [nativeSubmitting, setNativeSubmitting] = React.useState(false)

  // Existing images (edit mode): keep/remove state
  const [existingImages, setExistingImages] = React.useState<
    Array<{ id: number; url?: string; keep: boolean }>
  >(() => {
    if (mode !== 'edit' || !initialData?.image) return []
    const arr = Array.isArray(initialData.image) ? initialData.image : []
    return arr
      .map((img: any) => ({
        id: typeof img === 'object' && img ? Number(img.id) : Number(img),
        url:
          typeof img === 'object' && img && 'url' in img
            ? (img.url as string | undefined)
            : undefined,
        keep: true,
      }))
      .filter((x) => !Number.isNaN(x.id))
  })

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [newFiles, setNewFiles] = React.useState<Array<{ file: File; preview: string }>>([])

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const mapped = files.map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setNewFiles(mapped)
  }

  const removeNewFileAt = (idx: number) => {
    setNewFiles((prev) => {
      const next = prev.slice()
      const removed = next.splice(idx, 1)
      if (removed[0]) URL.revokeObjectURL(removed[0].preview)
      // Rebuild FileList on the input by filtering out the removed index
      const input = fileInputRef.current
      if (input && input.files) {
        const dt = new DataTransfer()
        Array.from(input.files).forEach((file, i) => {
          if (i !== idx) dt.items.add(file)
        })
        input.files = dt.files
      }
      return next
    })
  }

  const removeExistingImage = (id: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id))
  }

  const statusOptions: Option[] = [
    { value: 'inUse', label: 'In Use' },
    { value: 'inStock', label: 'In Stock' },
    { value: 'needsRepair', label: 'Needs Repair' },
    { value: 'underRepair', label: 'Under Repair' },
  ]

  const itemTypeOptions: Option[] = [
    { value: 'laptop', label: 'Laptop' },
    { value: 'phone', label: 'Phone' },
    { value: 'accessory', label: 'Accessory' },
    { value: 'simCard', label: 'Sim Card' },
    { value: 'other', label: 'Other' },
  ]

  const status = useWatch({ control, name: 'status' }) as string | undefined
  const holder = useWatch({ control, name: 'holder' }) as string | undefined

  React.useEffect(() => {
    if (!status) return
    if (status !== 'inUse') {
      if (holder !== '__none__') setValue('holder', '__none__', { shouldValidate: true })
    } else {
      if (holder === '__none__') setValue('holder', '', { shouldValidate: true })
    }
  }, [status])

  const holderOptions: Option[] = React.useMemo(() => {
    if (status === 'inUse') return holders
    return [{ value: '__none__', label: 'Unassigned' }, ...holders]
  }, [holders, status])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/inventory">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">
              {mode === 'create' ? 'Add Inventory Item' : 'Edit Inventory Item'}
            </h1>
          </div>
        </div>

        <form
          ref={formRef}
          action={formAction as any}
          onSubmit={!formAction ? handleSubmit(async (values) => onSubmit?.(values)) : undefined}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Inventory Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  control={control}
                  name={'itemType'}
                  label="Item Type *"
                  placeholder="Select item type"
                  options={itemTypeOptions}
                  error={errors.itemType?.message as string | undefined}
                />

                <InputField
                  label="Model *"
                  name={'model'}
                  register={register}
                  error={errors.model?.message as string | undefined}
                />

                <InputField
                  label="Serial Number *"
                  name={'serialNumber'}
                  register={register}
                  error={errors.serialNumber?.message as string | undefined}
                />

                <SelectField
                  control={control}
                  name={'status'}
                  label="Status *"
                  placeholder="Select status"
                  options={statusOptions}
                  error={errors.status?.message as string | undefined}
                />

                <SelectField
                  control={control}
                  name={'holder'}
                  label="Holder"
                  placeholder="Select user holder"
                  options={holderOptions}
                  error={errors.holder?.message as string | undefined}
                  searchable={true}
                />

                <div>
                  <label
                    htmlFor="purchaseDate"
                    className="px-1 text-sm font-medium text-foreground"
                  >
                    Purchase Date
                  </label>
                  <input
                    id="purchaseDate"
                    type="date"
                    className="mt-2 w-full rounded-md border bg-background p-2"
                    {...register('purchaseDate')}
                  />
                </div>

                <div>
                  <label
                    htmlFor="warrantyExpiry"
                    className="px-1 text-sm font-medium text-foreground"
                  >
                    Warranty Expiry
                  </label>
                  <input
                    id="warrantyExpiry"
                    type="date"
                    className="mt-2 w-full rounded-md border bg-background p-2"
                    {...register('warrantyExpiry')}
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label htmlFor="picture" className="px-1 text-sm font-medium text-foreground">
                    Images
                  </label>

                  {mode === 'edit' && existingImages.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Existing images (click X to remove)
                      </p>
                      <div className="flex flex-row gap-4">
                        {existingImages.map((img) => (
                          <div key={img.id} className="relative group">
                            {img.url ? (
                              <Image
                                src={img.url}
                                alt="inventory"
                                width={128}
                                height={128}
                                className="h-32 w-32 object-cover rounded"
                              />
                            ) : (
                              <div className="h-32 w-32 bg-muted rounded" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingImage(img.id)}
                              className="absolute top-1 right-1 rounded-full bg-background/80 p-2 text-md shadow text-destructive hover:bg-red-300"
                              title="Delete this image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    id="picture"
                    ref={fileInputRef}
                    name="image"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesSelected}
                    className="mt-6 block text-sm bg-accent shadow p-2 rounded cursor-pointer"
                  />
                  {newFiles.length > 0 && (
                    <div className="mt-2 bg-accent p-4">
                      <p className="text-xs text-muted-foreground mb-2">New images to upload</p>
                      <div className="flex flex-row gap-4">
                        {newFiles.map((nf, idx) => (
                          <div key={idx} className="relative group">
                            <Image
                              src={nf.preview}
                              alt="preview"
                              width={128}
                              height={128}
                              className="h-32 w-32 object-cover rounded"
                              unoptimized
                            />
                            <button
                              type="button"
                              onClick={() => removeNewFileAt(idx)}
                              className="absolute top-1 right-1 bg-background/80 rounded-full text-md p-2 shadow text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">You can select multiple images.</p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="notes" className="px-1 text-sm font-medium text-foreground">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    className="mt-2 w-full rounded-md border bg-background p-2"
                    rows={4}
                    {...register('notes')}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Link href="/inventory">
                  <Button type="button" variant="outline" className="cursor-pointer">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </Link>
                <Button
                  type={formAction ? 'button' : 'submit'}
                  className="cursor-pointer disabled:cursor-not-allowed"
                  disabled={isSubmitting || nativeSubmitting}
                  onClick={async () => {
                    if (!formAction) return
                    const isValid = await trigger()
                    if (isValid) {
                      setNativeSubmitting(true)
                      formRef.current?.requestSubmit()
                    }
                  }}
                >
                  {isSubmitting || nativeSubmitting ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting || nativeSubmitting ? 'Saving...' : 'Save Item'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
