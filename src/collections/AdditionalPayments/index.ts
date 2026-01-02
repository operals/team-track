import { CollectionConfig } from 'payload'
import { superAdminOnly } from '@/access/authenticated'
import { canManagePayroll, canReadPayroll } from '@/access/rbac'

export const AdditionalPayments: CollectionConfig = {
  slug: 'additional-payments',
  access: {
    admin: superAdminOnly,
    create: canManagePayroll,
    delete: canManagePayroll,
    read: canReadPayroll,
    update: canManagePayroll,
  },
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['employee', 'category', 'amount', 'period', 'status'],
    group: 'Payroll Management',
  },
  fields: [
    {
      name: 'employee',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Bonus', value: 'bonus' },
        { label: 'Deduction', value: 'deduction' },
        { label: 'Advance Payment', value: 'advance' },
        { label: 'Commission', value: 'commission' },
        { label: 'Allowance', value: 'allowance' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Type of additional payment',
      },
    },
    {
      name: 'description',
      type: 'text',
      required: true,
      admin: {
        description: 'Brief description (e.g., "Performance bonus Q4", "Salary advance")',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      admin: {
        description: 'Amount (positive for payments, can be positive for deductions too)',
      },
    },
    {
      name: 'paymentType',
      type: 'select',
      required: true,
      defaultValue: 'bankTransfer',
      options: [
        { label: 'Bank Transfer', value: 'bankTransfer' },
        { label: 'Cash', value: 'cash' },
        { label: 'Cheque', value: 'cheque' },
      ],
    },
    {
      name: 'period',
      type: 'group',
      fields: [
        {
          name: 'month',
          type: 'select',
          required: true,
          options: [
            { label: 'January', value: '01' },
            { label: 'February', value: '02' },
            { label: 'March', value: '03' },
            { label: 'April', value: '04' },
            { label: 'May', value: '05' },
            { label: 'June', value: '06' },
            { label: 'July', value: '07' },
            { label: 'August', value: '08' },
            { label: 'September', value: '09' },
            { label: 'October', value: '10' },
            { label: 'November', value: '11' },
            { label: 'December', value: '12' },
          ],
          admin: {
            description: 'Period this payment relates to (for reporting)',
          },
        },
        {
          name: 'year',
          type: 'number',
          required: true,
          defaultValue: new Date().getFullYear(),
        },
      ],
    },
    {
      name: 'paymentDate',
      type: 'date',
      admin: {
        description: 'Date when the payment was made',
        condition: (data) => data?.status === 'paid',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'generated',
      options: [
        { label: 'Generated', value: 'generated' },
        { label: 'Approved', value: 'approved' },
        { label: 'Paid', value: 'paid' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes or comments',
      },
    },
    {
      name: 'processedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        condition: (data) => ['paid', 'cancelled'].includes(data?.status),
        description: 'User who processed this payment',
      },
    },
    {
      name: 'processedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        condition: (data) => ['paid', 'cancelled'].includes(data?.status),
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' || operation === 'update') {
          // Auto-set processedAt when status changes to paid/cancelled
          if (['paid', 'cancelled'].includes(data.status) && !data.processedAt) {
            data.processedAt = new Date()
          }
        }
        return data
      },
    ],
  },
}
