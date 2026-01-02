import type { CollectionConfig } from 'payload'

import { superAdminOnly } from '@/access/authenticated'
import { canCreateUsers, canDeleteUsers, canReadUsers, canUpdateUsers } from '@/access/rbac'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: superAdminOnly,
    create: canCreateUsers,
    delete: canDeleteUsers,
    read: canReadUsers,
    update: canUpdateUsers,
  },
  admin: {
    defaultColumns: ['fullName', 'primaryPhone', 'employmentType', 'isActive'],
    useAsTitle: 'fullName',
  },
  auth: {
    loginWithUsername: {
      requireEmail: true,
      allowEmailLogin: true,
    },
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      required: true,
    },
    {
      name: 'isSuperAdmin',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Super admins have full access and are hidden from the dashboard user list',
      },
      access: {
        // Only super admins can set other super admins
        update: ({ req: { user } }) => {
          return (user as any)?.isSuperAdmin === true
        },
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      hasMany: false,
    },
    {
      name: 'departments',
      type: 'relationship',
      relationTo: 'departments',
      hasMany: true,
      admin: {
        description: 'Assign multiple departments (e.g., Sales + English, or just HR)',
      },
      access: {
        // Only HR/Managers can update departments
        update: ({ req: { user } }) => {
          if (!user) return false
          const u = user as any
          return u.isSuperAdmin === true || u.role?.permissions?.users?.edit === true
        },
      },
    },
    {
      name: 'role',
      type: 'relationship',
      relationTo: 'roles',
      access: {
        // Only HR/Managers can update roles
        update: ({ req: { user } }) => {
          if (!user) return false
          const u = user as any
          return u.isSuperAdmin === true || u.role?.permissions?.users?.edit === true
        },
      },
    },
    {
      name: 'jobTitle',
      type: 'text',
    },
    {
      name: 'birthDate',
      type: 'date',
      required: false,
      admin: {
        description: 'Not required for super admins',
      },
    },
    {
      name: 'primaryPhone',
      type: 'text',
      required: false,
      admin: {
        description: 'Not required for super admins',
      },
    },
    {
      name: 'secondaryPhone',
      type: 'text',
    },
    {
      name: 'secondaryEmail',
      type: 'email',
      unique: true,
    },
    {
      name: 'employmentType',
      type: 'select',
      options: [
        {
          label: 'Citizen',
          value: 'citizen',
        },
        {
          label: 'Work Permit',
          value: 'workPermit',
        },
        {
          label: 'Residence Permit',
          value: 'residencePermit',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
      defaultValue: 'other',
      required: true,
      access: {
        // Only HR/Managers can update employment type
        update: ({ req: { user } }) => {
          if (!user) return false
          const u = user as any
          return u.isSuperAdmin === true || u.role?.permissions?.users?.edit === true
        },
      },
    },
    {
      name: 'nationality',
      type: 'text',
    },
    {
      name: 'identityNumber',
      type: 'text',
    },
    {
      name: 'workPermitExpiry',
      type: 'date',
    },
    {
      name: 'address',
      type: 'textarea',
    },
    {
      name: 'documents',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      access: {
        // Only HR/Managers can update active status
        update: ({ req: { user } }) => {
          if (!user) return false
          const u = user as any
          return u.isSuperAdmin === true || u.role?.permissions?.users?.edit === true
        },
      },
    },
    {
      name: 'joinedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      access: {
        // Only HR/Managers can update join date
        update: ({ req: { user } }) => {
          if (!user) return false
          const u = user as any
          return u.isSuperAdmin === true || u.role?.permissions?.users?.edit === true
        },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
  ],
  timestamps: true,
}
