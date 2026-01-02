import type { CollectionConfig } from 'payload'
import { superAdminOnly } from '@/access/authenticated'
import { canManageInventory, canReadInventory } from '@/access/rbac'

export const Inventory: CollectionConfig = {
  slug: 'inventory',
  access: {
    admin: superAdminOnly,
    create: canManageInventory,
    delete: canManageInventory,
    read: canReadInventory,
    update: canManageInventory,
  },
  admin: {
    useAsTitle: 'itemType',
    defaultColumns: ['itemType', 'model', 'holder', 'status'],
  },
  fields: [
    {
      name: 'itemType',
      type: 'select',
      options: [
        {
          label: 'Laptop',
          value: 'laptop',
        },
        {
          label: 'Phone',
          value: 'phone',
        },
        {
          label: 'Accessory',
          value: 'accessory',
        },
        {
          label: 'Sim Card',
          value: 'simCard',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
      defaultValue: 'other',
      required: true,
    },
    {
      name: 'model',
      type: 'text',
      required: true,
    },
    {
      name: 'serialNumber',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'holder',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: {
        isSuperAdmin: {
          not_equals: true,
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'In Use',
          value: 'inUse',
        },
        {
          label: 'In Stock',
          value: 'inStock',
        },
        {
          label: 'Needs Repair',
          value: 'needsRepair',
        },
        {
          label: 'Under Repair',
          value: 'underRepair',
        },
      ],
      defaultValue: 'inStock',
      required: true,
    },
    {
      name: 'purchaseDate',
      type: 'date',
    },
    {
      name: 'warrantyExpiry',
      type: 'date',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
