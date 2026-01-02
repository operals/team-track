import type { CollectionConfig } from 'payload'
import { superAdminOnly } from '@/access/authenticated'
import { canManageRoles } from '@/access/rbac'

export const Roles: CollectionConfig = {
  slug: 'roles',
  access: {
    admin: superAdminOnly,
    create: canManageRoles,
    delete: canManageRoles,
    read: canManageRoles,
    update: canManageRoles,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'level', 'description'],
    group: 'System Management',
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'E.g., HR Manager, Department Manager, Sales Representative, Doctor',
      },
    },
    {
      name: 'level',
      type: 'select',
      required: true,
      options: [
        { label: 'Admin (Full Access)', value: 'admin' },
        { label: 'Manager (Department Level)', value: 'manager' },
        { label: 'Employee (Limited Access)', value: 'employee' },
        { label: 'Restricted (View Only)', value: 'restricted' },
      ],
      defaultValue: 'employee',
      admin: {
        description: 'Determines the base permission level',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description of this role and its responsibilities',
      },
    },
    {
      name: 'permissions',
      type: 'group',
      label: 'Permissions',
      fields: [
        // User Management
        {
          name: 'users',
          type: 'group',
          label: 'User Management',
          fields: [
            {
              name: 'viewAll',
              type: 'checkbox',
              label: 'View All Users',
              defaultValue: false,
              admin: {
                description: 'Can view all users in the system',
              },
            },
            {
              name: 'viewDepartment',
              type: 'checkbox',
              label: 'View Department Users',
              defaultValue: false,
              admin: {
                description: 'Can view users in their own department',
              },
            },
            {
              name: 'create',
              type: 'checkbox',
              label: 'Create Users',
              defaultValue: false,
            },
            {
              name: 'edit',
              type: 'checkbox',
              label: 'Edit Users',
              defaultValue: false,
            },
            {
              name: 'delete',
              type: 'checkbox',
              label: 'Delete Users',
              defaultValue: false,
            },
          ],
        },

        // Payroll Management
        {
          name: 'payroll',
          type: 'group',
          label: 'Payroll Management',
          fields: [
            {
              name: 'viewAll',
              type: 'checkbox',
              label: 'View All Payroll',
              defaultValue: false,
            },
            {
              name: 'viewDepartment',
              type: 'checkbox',
              label: 'View Department Payroll',
              defaultValue: false,
            },
            {
              name: 'viewOwn',
              type: 'checkbox',
              label: 'View Own Payroll',
              defaultValue: true,
              admin: {
                description: 'Users can always view their own payroll',
              },
            },
            {
              name: 'create',
              type: 'checkbox',
              label: 'Create Payroll',
              defaultValue: false,
            },
            {
              name: 'edit',
              type: 'checkbox',
              label: 'Edit Payroll',
              defaultValue: false,
            },
            {
              name: 'delete',
              type: 'checkbox',
              label: 'Delete Payroll',
              defaultValue: false,
            },
            {
              name: 'manageSettings',
              type: 'checkbox',
              label: 'Manage Payroll Settings',
              defaultValue: false,
            },
          ],
        },

        // Leave Management
        {
          name: 'leaves',
          type: 'group',
          label: 'Leave Management',
          fields: [
            {
              name: 'viewAll',
              type: 'checkbox',
              label: 'View All Leaves',
              defaultValue: false,
            },
            {
              name: 'viewDepartment',
              type: 'checkbox',
              label: 'View Department Leaves',
              defaultValue: false,
            },
            {
              name: 'viewOwn',
              type: 'checkbox',
              label: 'View Own Leaves',
              defaultValue: true,
            },
            {
              name: 'create',
              type: 'checkbox',
              label: 'Create Leave Requests',
              defaultValue: true,
            },
            {
              name: 'approve',
              type: 'checkbox',
              label: 'Approve Leaves',
              defaultValue: false,
            },
            {
              name: 'delete',
              type: 'checkbox',
              label: 'Delete Leaves',
              defaultValue: false,
            },
          ],
        },

        // Inventory Management
        {
          name: 'inventory',
          type: 'group',
          label: 'Inventory Management',
          fields: [
            {
              name: 'viewAll',
              type: 'checkbox',
              label: 'View All Inventory',
              defaultValue: false,
            },
            {
              name: 'viewOwn',
              type: 'checkbox',
              label: 'View Own Inventory',
              defaultValue: true,
            },
            {
              name: 'create',
              type: 'checkbox',
              label: 'Create Inventory Items',
              defaultValue: false,
            },
            {
              name: 'edit',
              type: 'checkbox',
              label: 'Edit Inventory',
              defaultValue: false,
            },
            {
              name: 'assign',
              type: 'checkbox',
              label: 'Assign Items',
              defaultValue: false,
            },
            {
              name: 'delete',
              type: 'checkbox',
              label: 'Delete Inventory',
              defaultValue: false,
            },
          ],
        },

        // Department Management
        {
          name: 'departments',
          type: 'group',
          label: 'Department Management',
          fields: [
            {
              name: 'view',
              type: 'checkbox',
              label: 'View Departments',
              defaultValue: false,
            },
            {
              name: 'create',
              type: 'checkbox',
              label: 'Create Departments',
              defaultValue: false,
            },
            {
              name: 'edit',
              type: 'checkbox',
              label: 'Edit Departments',
              defaultValue: false,
            },
            {
              name: 'delete',
              type: 'checkbox',
              label: 'Delete Departments',
              defaultValue: false,
            },
          ],
        },

        // System Settings
        {
          name: 'system',
          type: 'group',
          label: 'System Management',
          fields: [
            {
              name: 'manageRoles',
              type: 'checkbox',
              label: 'Manage Roles',
              defaultValue: false,
            },
            {
              name: 'viewReports',
              type: 'checkbox',
              label: 'View Reports',
              defaultValue: false,
            },
            {
              name: 'systemSettings',
              type: 'checkbox',
              label: 'System Settings',
              defaultValue: false,
            },
          ],
        },
      ],
    },
  ],

  // Default roles to be seeded
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // You can add hooks to sync permissions if needed
        console.log(`Role ${doc.name} was ${operation}d`)
      },
    ],
  },
}
