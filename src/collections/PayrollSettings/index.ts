import type { CollectionConfig } from 'payload'
import { superAdminOnly } from '@/access/authenticated'
import { canManagePayroll, canReadPayrollSettings } from '@/access/rbac'

export const PayrollSettings: CollectionConfig = {
  slug: 'payroll-settings',
  access: {
    admin: superAdminOnly,
    read: canReadPayrollSettings,
    delete: canManagePayroll,
    create: canManagePayroll,
    update: canManagePayroll,
  },
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['employee', 'payrollType', 'amount', 'paymentType', 'isActive'],
    group: 'Payroll Management',
  },
  fields: [
    {
      name: 'employee',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'payrollType',
      type: 'select',
      required: true,
      options: [
        { label: 'Primary Salary', value: 'primary' },
        { label: 'Bonus Payment', value: 'bonus' },
        { label: 'Overtime Pay', value: 'overtime' },
        { label: 'Commission', value: 'commission' },
        { label: 'Allowance', value: 'allowance' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'primary',
    },
    {
      name: 'description',
      type: 'text',
    },

    // Payment Details
    {
      name: 'paymentDetails',
      type: 'group',
      fields: [
        {
          name: 'amount',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'paymentType',
          type: 'select',
          required: true,
          options: [
            { label: 'Bank Transfer', value: 'bankTransfer' },
            { label: 'Cash', value: 'cash' },
            { label: 'Cheque', value: 'cheque' },
          ],
          defaultValue: 'bankTransfer',
        },
        {
          name: 'paymentFrequency',
          type: 'select',
          required: true,
          options: [
            { label: 'Monthly', value: 'monthly' },
            { label: 'Quarterly', value: 'quarterly' },
            { label: 'Annual', value: 'annual' },
            { label: 'One Time', value: 'oneTime' },
          ],
          defaultValue: 'monthly',
        },
      ],
    },

    // Bank Account Details (conditional)
    {
      name: 'bankAccount',
      type: 'group',
      fields: [
        {
          name: 'accountNumber',
          type: 'text',
        },
        {
          name: 'bankName',
          type: 'text',
          admin: {
            placeholder: 'Bank name',
          },
        },
        {
          name: 'accountHolderName',
          type: 'text',
        },
        {
          name: 'swiftCode',
          type: 'text',
        },
      ],
    },

    // Status and Timing
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'effectiveDate',
      type: 'group',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          defaultValue: () => new Date(),
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
            description: 'Leave empty for ongoing payments, set for temporary bonuses/deductions',
          },
        },
      ],
    },

    // // Additional Settings
    // {
    //   name: 'taxSettings',
    //   type: 'group',
    //   fields: [
    //     {
    //       name: 'taxable',
    //       type: 'checkbox',
    //       defaultValue: true,
    //       admin: {
    //         description: 'Whether this payment is subject to income tax',
    //       },
    //     },
    //     {
    //       name: 'taxRate',
    //       type: 'number',
    //       min: 0,
    //       max: 100,
    //       admin: {
    //         step: 0.01,
    //         description: 'Custom tax rate for this payment (leave empty to use default)',
    //         condition: (data) => data?.taxSettings?.taxable,
    //       },
    //     },
    //   ],
    // },

    {
      name: 'notes',
      type: 'textarea',
    },
  ],

  // Hooks for validation and auto-population
  hooks: {
    beforeChange: [
      ({ data, operation }) => {

        // Validate date ranges
        if (data.effectiveDate?.startDate && data.effectiveDate?.endDate) {
          const start = new Date(data.effectiveDate.startDate)
          const end = new Date(data.effectiveDate.endDate)

          if (end <= start) {
            throw new Error('End date must be after start date')
          }
        }

        // Ensure primary salary type is unique per employee
        if (data.payrollType === 'primary' && operation === 'create') {
          // This would need additional validation logic in a real implementation
          // to check for existing primary salary entries for the same employee
        }
        return data
      },
    ],
  },
  timestamps: true,
}
