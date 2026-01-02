import type { CollectionConfig } from 'payload'
import { superAdminOnly } from '@/access/authenticated'
import { canManageDepartments, canReadDepartments } from '@/access/rbac'

export const Departments: CollectionConfig = {
  slug: 'departments',
  access: {
    admin: superAdminOnly,
    create: canManageDepartments,
    delete: canManageDepartments,
    read: canReadDepartments,
    update: canManageDepartments,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'manager', 'isActive'],
    group: 'System Management',
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Functional Department', value: 'functional' },
        { label: 'Language Department', value: 'language' },
      ],
      admin: {
        description:
          'Is this a functional department (Sales, Field, HR) or a language department (English, Turkish)?',
      },
    },
    {
      name: 'functionalType',
      type: 'select',
      options: [
        { label: 'Sales', value: 'sales' },
        { label: 'Field', value: 'field' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Transfer', value: 'transfer' },
        { label: 'Human Resources (HR)', value: 'hr' },
        { label: 'Dental Clinic', value: 'dental' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'The functional type (only for functional departments)',
        condition: (data) => data?.category === 'functional',
      },
    },
    {
      name: 'languageCode',
      type: 'select',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Turkish', value: 'tr' },
        { label: 'Polish', value: 'pl' },
        { label: 'Russian', value: 'ru' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' },
        { label: 'Romanian', value: 'ro' },
        { label: 'Ukrainian', value: 'uk' },
      ],
      admin: {
        description: 'The language code (only for language departments)',
        condition: (data) => data?.category === 'language',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description of this department',
      },
    },
    {
      name: 'manager',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Department manager/head (typically for functional departments)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this department is currently active',
      },
    },
  ],
  timestamps: true,
}
