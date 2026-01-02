import type { Payload } from 'payload'

export const seedRolesAndDepartments = async (payload: Payload): Promise<void> => {
  console.log('Seeding roles and departments...')

  // Check if roles already exist
  const existingRoles = await payload.find({
    collection: 'roles',
    limit: 1,
  })

  if (existingRoles.docs.length === 0) {
    // Create default roles
    const roles = [
      {
        name: 'HR Manager',
        level: 'admin',
        description:
          'Full access to all system features including user management, payroll, leaves, and inventory',
        permissions: {
          users: {
            viewAll: true,
            viewDepartment: true,
            create: true,
            edit: true,
            delete: true,
          },
          payroll: {
            viewAll: true,
            viewDepartment: true,
            viewOwn: true,
            create: true,
            edit: true,
            delete: true,
            manageSettings: true,
          },
          leaves: {
            viewAll: true,
            viewDepartment: true,
            viewOwn: true,
            create: true,
            approve: true,
            delete: true,
          },
          inventory: {
            viewAll: true,
            viewOwn: true,
            create: true,
            edit: true,
            assign: true,
            delete: true,
          },
          departments: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
          system: {
            manageRoles: true,
            viewReports: true,
            systemSettings: true,
          },
        },
      },
      {
        name: 'Department Manager',
        level: 'manager',
        description:
          'Manages their department, can view and approve leaves, view department payroll and users',
        permissions: {
          users: {
            viewAll: false,
            viewDepartment: true,
            create: false,
            edit: false,
            delete: false,
          },
          payroll: {
            viewAll: false,
            viewDepartment: true,
            viewOwn: true,
            create: false,
            edit: false,
            delete: false,
            manageSettings: false,
          },
          leaves: {
            viewAll: false,
            viewDepartment: true,
            viewOwn: true,
            create: true,
            approve: true,
            delete: false,
          },
          inventory: {
            viewAll: false,
            viewOwn: true,
            create: false,
            edit: false,
            assign: false,
            delete: false,
          },
          departments: {
            view: true,
            create: false,
            edit: false,
            delete: false,
          },
          system: {
            manageRoles: false,
            viewReports: true,
            systemSettings: false,
          },
        },
      },
      {
        name: 'Sales Representative',
        level: 'employee',
        description: 'Standard employee with view-only access to their own information',
        permissions: {
          users: {
            viewAll: false,
            viewDepartment: false,
            create: false,
            edit: false,
            delete: false,
          },
          payroll: {
            viewAll: false,
            viewDepartment: false,
            viewOwn: true,
            create: false,
            edit: false,
            delete: false,
            manageSettings: false,
          },
          leaves: {
            viewAll: false,
            viewDepartment: false,
            viewOwn: true,
            create: true,
            approve: false,
            delete: false,
          },
          inventory: {
            viewAll: false,
            viewOwn: true,
            create: false,
            edit: false,
            assign: false,
            delete: false,
          },
          departments: {
            view: false,
            create: false,
            edit: false,
            delete: false,
          },
          system: {
            manageRoles: false,
            viewReports: false,
            systemSettings: false,
          },
        },
      },
      {
        name: 'Field Agent',
        level: 'employee',
        description: 'Field worker with view-only access to their own information',
        permissions: {
          users: {
            viewAll: false,
            viewDepartment: false,
            create: false,
            edit: false,
            delete: false,
          },
          payroll: {
            viewAll: false,
            viewDepartment: false,
            viewOwn: true,
            create: false,
            edit: false,
            delete: false,
            manageSettings: false,
          },
          leaves: {
            viewAll: false,
            viewDepartment: false,
            viewOwn: true,
            create: true,
            approve: false,
            delete: false,
          },
          inventory: {
            viewAll: false,
            viewOwn: true,
            create: false,
            edit: false,
            assign: false,
            delete: false,
          },
          departments: {
            view: false,
            create: false,
            edit: false,
            delete: false,
          },
          system: {
            manageRoles: false,
            viewReports: false,
            systemSettings: false,
          },
        },
      },
      {
        name: 'Doctor',
        level: 'employee',
        description: 'Medical staff with view-only access to their own information',
        permissions: {
          users: {
            viewAll: false,
            viewDepartment: false,
            create: false,
            edit: false,
            delete: false,
          },
          payroll: {
            viewAll: false,
            viewDepartment: false,
            viewOwn: true,
            create: false,
            edit: false,
            delete: false,
            manageSettings: false,
          },
          leaves: {
            viewAll: false,
            viewDepartment: false,
            viewOwn: true,
            create: true,
            approve: false,
            delete: false,
          },
          inventory: {
            viewAll: false,
            viewOwn: true,
            create: false,
            edit: false,
            assign: false,
            delete: false,
          },
          departments: {
            view: false,
            create: false,
            edit: false,
            delete: false,
          },
          system: {
            manageRoles: false,
            viewReports: false,
            systemSettings: false,
          },
        },
      },
      {
        name: 'Marketing Specialist',
        level: 'employee',
        description: 'Marketing team member with view-only access to their own information',
        permissions: {
          users: {
            viewAll: false,
            viewDepartment: false,
            create: false,
            edit: false,
            delete: false,
          },
          payroll: {
            viewAll: false,
            viewDepartment: false,
            viewOwn: true,
            create: false,
            edit: false,
            delete: false,
            manageSettings: false,
          },
          leaves: {
            viewAll: false,
            viewDepartment: false,
            viewOwn: true,
            create: true,
            approve: false,
            delete: false,
          },
          inventory: {
            viewAll: false,
            viewOwn: true,
            create: false,
            edit: false,
            assign: false,
            delete: false,
          },
          departments: {
            view: false,
            create: false,
            edit: false,
            delete: false,
          },
          system: {
            manageRoles: false,
            viewReports: false,
            systemSettings: false,
          },
        },
      },
    ]

    for (const role of roles) {
      await payload.create({
        collection: 'roles',
        data: role as any,
      })
      console.log(`Created role: ${role.name}`)
    }
  }

  // Check if departments already exist
  const existingDepts = await payload.find({
    collection: 'departments',
    limit: 1,
  })

  if (existingDepts.docs.length === 0) {
    // Create Functional Departments
    const functionalDepartments = [
      {
        name: 'Sales',
        category: 'functional',
        functionalType: 'sales',
        description: 'Sales team across all languages',
      },
      {
        name: 'Field',
        category: 'functional',
        functionalType: 'field',
        description: 'Field agents across all languages',
      },
      {
        name: 'Marketing',
        category: 'functional',
        functionalType: 'marketing',
        description: 'Marketing and promotion team',
      },
      {
        name: 'Transfer',
        category: 'functional',
        functionalType: 'transfer',
        description: 'Transfer coordination team',
      },
      {
        name: 'Human Resources',
        category: 'functional',
        functionalType: 'hr',
        description: 'HR and administration',
      },
      {
        name: 'Dental Clinic - Doctors',
        category: 'functional',
        functionalType: 'dental',
        description: 'Dental clinic doctors',
      },
      {
        name: 'Dental Clinic - Assistants',
        category: 'functional',
        functionalType: 'dental',
        description: 'Dental clinic assistants',
      },
    ]

    // Create Language Departments
    const languageDepartments = [
      {
        name: 'English',
        category: 'language',
        languageCode: 'en',
        description: 'English language team',
      },
      {
        name: 'Turkish',
        category: 'language',
        languageCode: 'tr',
        description: 'Turkish language team',
      },
      {
        name: 'Polish',
        category: 'language',
        languageCode: 'pl',
        description: 'Polish language team',
      },
      {
        name: 'Russian',
        category: 'language',
        languageCode: 'ru',
        description: 'Russian language team',
      },
      {
        name: 'French',
        category: 'language',
        languageCode: 'fr',
        description: 'French language team',
      },
      {
        name: 'German',
        category: 'language',
        languageCode: 'de',
        description: 'German language team',
      },
      {
        name: 'Romanian',
        category: 'language',
        languageCode: 'ro',
        description: 'Romanian language team',
      },
      {
        name: 'Ukrainian',
        category: 'language',
        languageCode: 'uk',
        description: 'Ukrainian language team',
      },
    ]

    // Create all departments
    const allDepartments = [...functionalDepartments, ...languageDepartments]

    for (const dept of allDepartments) {
      await payload.create({
        collection: 'departments',
        data: dept as any,
      })
      console.log(`Created department: ${dept.name}`)
    }
  }

  console.log('Roles and departments seeding completed!')
}
