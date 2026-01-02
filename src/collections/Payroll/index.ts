import { CollectionConfig } from 'payload'
import { superAdminOnly } from '@/access/authenticated'
import { canManagePayroll, canReadPayroll } from '@/access/rbac'

export const Payroll: CollectionConfig = {
  slug: 'payroll',
  access: {
    admin: superAdminOnly,
    create: canManagePayroll,
    delete: canManagePayroll,
    read: canReadPayroll,
    update: canManagePayroll,
  },
  admin: {
    useAsTitle: 'employee',
    defaultColumns: ['employee', 'period', 'totalAmount', 'status'],
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
      filterOptions: {
        isSuperAdmin: {
          not_equals: true,
        },
      },
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
        },
        {
          name: 'year',
          type: 'number',
          required: true,
          defaultValue: new Date().getFullYear(),
        },
      ],
    },

    // Generated from PayrollSettings
    {
      name: 'payrollItems',
      type: 'array',
      label: 'Payroll Items',
      fields: [
        {
          name: 'payrollSetting',
          type: 'relationship',
          relationTo: 'payroll-settings',
          required: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'description',
          type: 'text',
          required: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'payrollType',
          type: 'select',
          options: [
            { label: 'Primary Salary', value: 'primary' },
            { label: 'Bonus Payment', value: 'bonus' },
            { label: 'Overtime Pay', value: 'overtime' },
            { label: 'Commission', value: 'commission' },
            { label: 'Allowance', value: 'allowance' },
            { label: 'Other', value: 'other' },
          ],
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'paymentType',
          type: 'select',
          options: [
            { label: 'Bank Transfer', value: 'bankTransfer' },
            { label: 'Cash', value: 'cash' },
            { label: 'Cheque', value: 'cheque' },
          ],
          admin: {
            readOnly: true,
          },
        },
      ],
    },

    // Manual adjustments (for this specific payroll period)
    {
      name: 'adjustments',
      type: 'group',
      label: 'Manual Adjustments',
      fields: [
        {
          name: 'bonusAmount',
          type: 'number',
          defaultValue: 0,
          label: 'One-time Bonus',
        },
        {
          name: 'deductionAmount',
          type: 'number',
          defaultValue: 0,
          label: 'Additional Deduction',
        },
        {
          name: 'adjustmentNote',
          type: 'textarea',
          label: 'Reason for Adjustment',
        },
      ],
    },

    // Calculated totals (auto-calculated)
    {
      name: 'totalAmount',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Total amount calculated from payroll items + adjustments',
      },
    },

    // Payment tracking
    {
      name: 'paymentDetails',
      type: 'group',
      label: 'Payment Tracking',
      fields: [
        {
          name: 'paymentDate',
          type: 'date',
          admin: {
            condition: (data) => data?.status === 'paid',
          },
        },
        {
          name: 'paymentReference',
          type: 'text',
          admin: {
            condition: (data) => data?.status === 'paid',
            description: 'Transaction ID, cheque number, or other payment reference',
          },
        },
        {
          name: 'paymentNotes',
          type: 'textarea',
          admin: {
            condition: (data) => ['paid', 'cancelled'].includes(data?.status),
          },
        },
      ],
    },

    // Status tracking
    {
      name: 'status',
      type: 'select',
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

    // Processing timestamps
    {
      name: 'processedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        condition: (data) => ['paid', 'cancelled'].includes(data?.status),
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
          // Calculate total amount from payroll items and adjustments
          let totalFromItems = 0

          if (data.payrollItems && Array.isArray(data.payrollItems)) {
            totalFromItems = data.payrollItems.reduce((sum, item) => {
              return sum + (item.amount || 0)
            }, 0)
          }

          // Add manual adjustments
          const bonusAmount = data.adjustments?.bonusAmount || 0
          const deductionAmount = data.adjustments?.deductionAmount || 0

          // Calculate final total
          const totalAmount = totalFromItems + bonusAmount - deductionAmount

          // Update the total amount field
          data.totalAmount = Math.round(totalAmount * 100) / 100

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
