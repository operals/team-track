import type { CollectionConfig } from 'payload'
import { superAdminOnly } from '@/access/authenticated'
import {
  canApproveLeaves,
  canCreateLeaves,
  canDeleteLeaves,
  canReadLeaves,
  canUpdateLeaves,
} from '@/access/rbac'

export const LeaveDays: CollectionConfig = {
  slug: 'leave-days',
  access: {
    admin: superAdminOnly,
    read: canReadLeaves,
    delete: canDeleteLeaves,
    create: canCreateLeaves,
    update: canUpdateLeaves,
  },
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'status'],
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.startDate && data?.endDate) {
          const start = new Date(data.startDate)
          const end = new Date(data.endDate)
          const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
          data.totalDays = diff
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      filterOptions: {
        isSuperAdmin: {
          not_equals: true,
        },
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Annual', value: 'annual' },
        { label: 'Sick', value: 'sick' },
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
    },
    {
      name: 'totalDays',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Requested', value: 'requested' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'requested',
      access: {
        update: canApproveLeaves,
      },
    },
    {
      name: 'reason',
      type: 'textarea',
      required: true,
    },
    {
      name: 'note',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
