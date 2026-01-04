# Dynamic RBAC System - Complete Roadmap

## 🎯 System Goals

Build a flexible, admin-configurable Role-Based Access Control system where:

- ✅ Roles, permissions, departments, and languages are managed via admin panel
- ✅ No code changes needed to modify permissions
- ✅ All configuration stored in database
- ✅ Simple RBAC (not complex ABAC)
- ✅ Easy to understand and maintain

---

## 📊 Current vs. Desired System

### Current System (Static)

```
src/lib/roles.ts (hardcoded)
  ↓
Roles with permissions defined in code
  ↓
Must redeploy to change permissions ❌
```

### Desired System (Dynamic)

```
Admin Panel UI
  ↓
Database (roles, permissions, role_permissions)
  ↓
Runtime permission checking
  ↓
Changes apply immediately ✅
```

---

## 🗄️ Phase 1: Database Schema Redesign

### 1.1 New Tables Needed

#### A. Permissions Table (New)

Stores all available permissions in the system.

```typescript
// src/db/schema/permissions.ts
export const permissionsTable = pgTable('permissions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // Permission identity
  resource: varchar('resource', { length: 50 }).notNull(), // 'users', 'payroll', 'leaves', etc.
  action: varchar('action', { length: 50 }).notNull(), // 'viewAll', 'create', 'edit', etc.

  // Display info
  name: varchar('name', { length: 255 }).notNull(), // "View All Users"
  description: text('description'), // "Can view all users in the system"
  category: varchar('category', { length: 50 }).notNull(), // Groups permissions in UI

  // Meta
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Unique constraint: one permission per resource+action
// CREATE UNIQUE INDEX ON permissions(resource, action)
```

**Example Data:**

```typescript
;[
  { resource: 'users', action: 'viewAll', name: 'View All Users', category: 'users' },
  { resource: 'users', action: 'viewDepartment', name: 'View Department Users', category: 'users' },
  { resource: 'users', action: 'create', name: 'Create Users', category: 'users' },
  { resource: 'payroll', action: 'viewAll', name: 'View All Payroll', category: 'payroll' },
  {
    resource: 'payroll',
    action: 'manageSettings',
    name: 'Manage Payroll Settings',
    category: 'payroll',
  },
  { resource: 'leaves', action: 'approve', name: 'Approve Leave Requests', category: 'leaves' },
  // ... etc
]
```

#### B. Role-Permission Junction Table (New)

Links roles to their permissions (many-to-many).

```typescript
// src/db/schema/role-permissions.ts
export const rolePermissionsTable = pgTable('role_permissions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  roleId: text('role_id')
    .notNull()
    .references(() => rolesTable.id, { onDelete: 'cascade' }),
  permissionId: text('permission_id')
    .notNull()
    .references(() => permissionsTable.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Unique constraint: can't assign same permission twice to a role
// CREATE UNIQUE INDEX ON role_permissions(role_id, permission_id)
```

#### C. Updated Roles Table

Remove the JSON `permissions` field, add metadata.

```typescript
// src/db/schema/roles.ts
export const rolesTable = pgTable('roles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),

  // Role level for hierarchy
  level: varchar('level', { length: 20 }).notNull().default('employee'), // 'admin', 'manager', 'employee'

  // UI/UX
  color: varchar('color', { length: 7 }), // Hex color for UI badges
  isSystemRole: boolean('is_system_role').default(false), // Can't be deleted

  // Status
  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

#### D. Updated Departments Table

Add more metadata for better organization.

```typescript
// src/db/schema/departments.ts
export const departmentsTable = pgTable('departments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),

  // Department type
  type: varchar('type', { length: 20 }).notNull(), // 'functional', 'language'

  // For language departments
  languageCode: varchar('language_code', { length: 10 }), // 'en', 'tr', 'pl', etc.

  // Hierarchy (optional - for nested departments)
  parentId: text('parent_id').references(() => departmentsTable.id),

  // Manager
  managerId: text('manager_id').references(() => usersTable.id),

  // Status
  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

### 1.2 Relations

```typescript
// Roles Relations
export const rolesRelations = relations(rolesTable, ({ many }) => ({
  users: many(usersTable),
  permissions: many(rolePermissionsTable), // ← New: role's permissions
}))

// Permissions Relations
export const permissionsRelations = relations(permissionsTable, ({ many }) => ({
  roles: many(rolePermissionsTable), // ← New: which roles have this permission
}))

// Role-Permissions Junction Relations
export const rolePermissionsRelations = relations(rolePermissionsTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [rolePermissionsTable.roleId],
    references: [rolesTable.id],
  }),
  permission: one(permissionsTable, {
    fields: [rolePermissionsTable.permissionId],
    references: [permissionsTable.id],
  }),
}))

// Departments Relations
export const departmentsRelations = relations(departmentsTable, ({ one, many }) => ({
  parent: one(departmentsTable, {
    fields: [departmentsTable.parentId],
    references: [departmentsTable.id],
  }),
  children: many(departmentsTable),
  manager: one(usersTable, {
    fields: [departmentsTable.managerId],
    references: [usersTable.id],
  }),
  users: many(userDepartmentsTable),
}))
```

---

## 🏗️ Phase 2: Permission Structure Design

### 2.1 Permission Categories & Structure

Organize permissions by resource and action:

```typescript
// Permission structure
{
  resource: string,    // What is being accessed
  action: string,      // What operation is being performed
  scope?: string       // Optional: 'all' | 'department' | 'own'
}
```

### 2.2 Standard Permissions List

#### Users Management

- `users.viewAll` - View all users in system
- `users.viewDepartment` - View users in own department(s)
- `users.viewOwn` - View own profile only
- `users.create` - Create new users
- `users.edit` - Edit user information
- `users.delete` - Delete users

#### Payroll Management

- `payroll.viewAll` - View all payroll records
- `payroll.viewDepartment` - View department payroll
- `payroll.viewOwn` - View own payroll
- `payroll.create` - Create payroll records
- `payroll.edit` - Edit payroll records
- `payroll.delete` - Delete payroll records
- `payroll.manageSettings` - Configure payroll settings

#### Leave Management

- `leaves.viewAll` - View all leave requests
- `leaves.viewDepartment` - View department leave requests
- `leaves.viewOwn` - View own leave requests
- `leaves.create` - Create leave requests
- `leaves.edit` - Edit leave requests (own or others)
- `leaves.approve` - Approve/reject leave requests
- `leaves.delete` - Delete leave requests

#### Inventory Management

- `inventory.viewAll` - View all inventory items
- `inventory.viewOwn` - View own assigned items
- `inventory.create` - Add new inventory items
- `inventory.edit` - Edit inventory items
- `inventory.assign` - Assign items to users
- `inventory.delete` - Delete inventory items

#### Department Management

- `departments.view` - View departments
- `departments.create` - Create departments
- `departments.edit` - Edit departments
- `departments.delete` - Delete departments
- `departments.assignUsers` - Add/remove users from departments

#### System Administration

- `system.manageRoles` - Create/edit/delete roles
- `system.managePermissions` - Assign permissions to roles
- `system.viewReports` - Access system reports
- `system.viewAuditLog` - View audit/activity logs
- `system.systemSettings` - Modify system settings

### 2.3 Permission Seeding

```typescript
// src/seed/permissions-seed.ts
export const PERMISSION_DEFINITIONS = [
  // Users
  {
    resource: 'users',
    action: 'viewAll',
    name: 'View All Users',
    description: 'Can view all users in the system',
    category: 'users',
  },
  {
    resource: 'users',
    action: 'viewDepartment',
    name: 'View Department Users',
    description: 'Can view users in own department(s)',
    category: 'users',
  },
  // ... all other permissions
]

// Seed function
async function seedPermissions() {
  for (const perm of PERMISSION_DEFINITIONS) {
    await db.insert(permissionsTable).values(perm).onConflictDoNothing()
  }
}
```

---

## 🎨 Phase 3: Admin Panel UI Design

### 3.1 Pages/Routes Needed

```
/admin/roles
  ├─ List all roles
  ├─ Create new role
  └─ /admin/roles/[id]
      ├─ Edit role details
      ├─ Assign permissions (checkbox list)
      └─ View assigned users

/admin/permissions
  └─ View all available permissions (read-only)
      - Grouped by category
      - Shows which roles have each permission

/admin/departments
  ├─ List all departments
  ├─ Create new department
  └─ /admin/departments/[id]
      ├─ Edit department details
      ├─ Assign manager
      ├─ View department users
      └─ Department hierarchy

/admin/users/[id]
  ├─ Edit user details
  ├─ Assign role (dropdown)
  └─ Assign departments (multi-select)
```

### 3.2 Role Management UI Components

#### A. Roles List Page

```tsx
// app/admin/roles/page.tsx
- Table showing:
  - Role name
  - Level (admin/manager/employee)
  - Number of users
  - Number of permissions
  - Active status
  - Actions (Edit, Delete, Duplicate)
- Create New Role button
- Filter by level
- Search by name
```

#### B. Create/Edit Role Page

```tsx
// app/admin/roles/[id]/page.tsx
- Role Details Section:
  - Name (input)
  - Description (textarea)
  - Level (select: admin/manager/employee)
  - Color (color picker)
  - Active status (toggle)

- Permissions Assignment Section:
  - Grouped by category (tabs or accordion)
  - Checkboxes for each permission
  - "Select All" / "Deselect All" per category
  - Permission search/filter

- Preview Section:
  - Shows permission summary
  - Lists affected users

- Actions:
  - Save, Cancel, Delete (if existing role)
```

#### C. Permission Matrix View (Optional)

```tsx
// app/admin/roles/matrix
// Shows grid of roles vs permissions
//           | HR Manager | Dept Mgr | Employee
// users.viewAll    ✓          ✗          ✗
// users.create     ✓          ✗          ✗
// payroll.viewAll  ✓          ✗          ✗
```

### 3.3 Department Management UI

#### A. Departments List

```tsx
// app/admin/departments/page.tsx
- Tree view OR flat table
- Show: Name, Type, Manager, User Count, Status
- Create Department button
- Filter by type (functional/language)
```

#### B. Create/Edit Department

```tsx
// app/admin/departments/[id]/page.tsx
- Department Details:
  - Name
  - Description
  - Type (functional/language)
  - Language Code (if language type)
  - Parent Department (for hierarchy)
  - Manager (user selector)
  - Active status

- Users in Department:
  - List of assigned users
  - Add/remove users
```

---

## 🔌 Phase 4: API Endpoints

### 4.1 Roles API

```typescript
// app/api/admin/roles/route.ts
GET / api / admin / roles // List all roles
POST / api / admin / roles // Create new role

// app/api/admin/roles/[id]/route.ts
GET / api / admin / roles / [id] // Get role details with permissions
PUT / api / admin / roles / [id] // Update role
DELETE / api / admin / roles / [id] // Delete role (if not system role)

// app/api/admin/roles/[id]/permissions/route.ts
GET / api / admin / roles / [id] / permissions // Get role's permissions
PUT / api / admin / roles / [id] / permissions // Update role's permissions
POST / api / admin / roles / [id] / permissions // Add permission to role
DELETE / api / admin / roles / [id] / permissions // Remove permission from role
```

### 4.2 Permissions API

```typescript
// app/api/admin/permissions/route.ts
GET / api / admin / permissions // List all available permissions
// ?category=users - filter by category
// ?grouped=true - group by category
```

### 4.3 Departments API

```typescript
// app/api/admin/departments/route.ts
GET / api / admin / departments // List all departments
POST / api / admin / departments // Create department

// app/api/admin/departments/[id]/route.ts
GET / api / admin / departments / [id] // Get department details
PUT / api / admin / departments / [id] // Update department
DELETE / api / admin / departments / [id] // Delete department

// app/api/admin/departments/[id]/users/route.ts
GET / api / admin / departments / [id] / users // Get users in department
POST / api / admin / departments / [id] / users // Add user to department
DELETE / api / admin / departments / [id] / users // Remove user from department
```

### 4.4 Example API Implementation

```typescript
// app/api/admin/roles/route.ts
import { requireHRAPI } from '@/lib/auth-guards'
import { db } from '@/db'
import { rolesTable } from '@/db/schema'

export async function GET(request: Request) {
  const user = await requireHRAPI()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const roles = await db.query.rolesTable.findMany({
    with: {
      permissions: {
        with: {
          permission: true,
        },
      },
      users: true, // To get user count
    },
  })

  // Transform to include counts
  const rolesWithCounts = roles.map((role) => ({
    ...role,
    permissionCount: role.permissions.length,
    userCount: role.users.length,
  }))

  return Response.json(rolesWithCounts)
}

export async function POST(request: Request) {
  const user = await requireHRAPI()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, level, color, permissionIds } = body

  // Create role
  const [role] = await db
    .insert(rolesTable)
    .values({
      name,
      description,
      level,
      color,
    })
    .returning()

  // Assign permissions
  if (permissionIds?.length > 0) {
    await db.insert(rolePermissionsTable).values(
      permissionIds.map((permId: string) => ({
        roleId: role.id,
        permissionId: permId,
      })),
    )
  }

  return Response.json(role, { status: 201 })
}
```

---

## ⚙️ Phase 5: Updated Permission Checking Logic

### 5.1 New RBAC Helper Functions

```typescript
// src/lib/rbac-dynamic.ts

/**
 * Check if user has a specific permission
 * Now checks against database role-permissions instead of hardcoded
 */
export function hasPermission(
  user: SessionUser | null | undefined,
  resource: string,
  action: string,
): boolean {
  if (!user) return false

  // Super admin bypasses all checks
  if (user.isSuperAdmin) return true

  // Check if user's role has the permission
  if (!user.role?.permissions) return false

  // permissions is now an array of permission objects
  return user.role.permissions.some((p) => p.resource === resource && p.action === action)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: SessionUser | null | undefined,
  permissions: Array<{ resource: string; action: string }>,
): boolean {
  if (!user) return false
  if (user.isSuperAdmin) return true

  return permissions.some((perm) => hasPermission(user, perm.resource, perm.action))
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(
  user: SessionUser | null | undefined,
  permissions: Array<{ resource: string; action: string }>,
): boolean {
  if (!user) return false
  if (user.isSuperAdmin) return true

  return permissions.every((perm) => hasPermission(user, perm.resource, perm.action))
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: SessionUser | null | undefined): string[] {
  if (!user?.role?.permissions) return []

  return user.role.permissions.map((p) => `${p.resource}.${p.action}`)
}
```

### 5.2 Updated Session Type

```typescript
// src/lib/rbac-dynamic.ts

export interface SessionUser {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  isSuperAdmin?: boolean
  role?: {
    id: string
    name: string
    level: 'admin' | 'manager' | 'employee'
    permissions: Array<{
      // ← Changed from JSON to array
      id: string
      resource: string
      action: string
      name: string
    }>
  }
  departments?: Array<{
    departmentId: string
    department: {
      id: string
      name: string
      type: 'functional' | 'language'
    }
  }>
}
```

### 5.3 Updated NextAuth Config

```typescript
// src/auth.ts

// In authorize function, fetch role WITH permissions via junction table
const user = await db.query.usersTable.findFirst({
  where: eq(usersTable.email, credentials.email as string),
  with: {
    role: {
      with: {
        permissions: {
          // ← Get permissions via junction table
          with: {
            permission: true,
          },
        },
      },
    },
    departments: {
      with: {
        department: true,
      },
    },
  },
})

// Transform permissions to flat array
const roleWithPermissions = user.role
  ? {
      ...user.role,
      permissions: user.role.permissions.map((rp) => rp.permission),
    }
  : null

return {
  id: user.id,
  email: user.email,
  name: user.fullName,
  role: roleWithPermissions,
  departments: user.departments,
}
```

---

## 🔄 Phase 6: Migration Plan

### 6.1 Migration Steps

```typescript
// Step 1: Create new tables
await db.schema.createTable(permissionsTable)
await db.schema.createTable(rolePermissionsTable)

// Step 2: Migrate existing roles
// Update roles table to add new columns
await db.schema
  .alterTable(rolesTable)
  .addColumn('level', 'varchar')
  .addColumn('color', 'varchar')
  .addColumn('isSystemRole', 'boolean')

// Step 3: Seed permissions
await seedPermissions()

// Step 4: Migrate role permissions from JSON to junction table
const roles = await db.query.rolesTable.findMany()

for (const role of roles) {
  const oldPermissions = role.permissions as any // Old JSON format

  // Convert JSON permissions to permission records
  for (const [resource, actions] of Object.entries(oldPermissions)) {
    for (const [action, value] of Object.entries(actions as any)) {
      if (value === true) {
        // Find permission by resource + action
        const permission = await db.query.permissionsTable.findFirst({
          where: and(eq(permissionsTable.resource, resource), eq(permissionsTable.action, action)),
        })

        if (permission) {
          // Create role-permission link
          await db
            .insert(rolePermissionsTable)
            .values({
              roleId: role.id,
              permissionId: permission.id,
            })
            .onConflictDoNothing()
        }
      }
    }
  }
}

// Step 5: Remove old permissions JSON column
await db.schema.alterTable(rolesTable).dropColumn('permissions')

// Step 6: Update departments table
await db.schema
  .alterTable(departmentsTable)
  .addColumn('type', 'varchar')
  .addColumn('languageCode', 'varchar')
  .addColumn('parentId', 'text')
  .addColumn('managerId', 'text')
  .addColumn('isActive', 'boolean')
```

### 6.2 Data Migration Script

```typescript
// scripts/migrate-to-dynamic-rbac.ts
import { db } from '@/db'
import { PERMISSION_DEFINITIONS } from '@/seed/permissions-seed'

async function migrate() {
  console.log('🔄 Migrating to dynamic RBAC...')

  // 1. Seed all permissions
  console.log('📝 Seeding permissions...')
  for (const perm of PERMISSION_DEFINITIONS) {
    await db.insert(permissionsTable).values(perm).onConflictDoNothing()
  }

  // 2. Migrate existing roles
  console.log('🔄 Migrating existing roles...')
  // ... migration logic

  console.log('✅ Migration complete!')
}

migrate().catch(console.error)
```

---

## 📋 Phase 7: Implementation Checklist

### Database

- [ ] Create `permissions` table schema
- [ ] Create `role_permissions` junction table schema
- [ ] Update `roles` table (add level, color, isSystemRole)
- [ ] Update `departments` table (add type, languageCode, parentId, managerId)
- [ ] Create relations between tables
- [ ] Run Drizzle push/migration

### Seeding

- [ ] Create permission definitions list
- [ ] Create permission seeding function
- [ ] Update role seeding to use new structure
- [ ] Update department seeding with new fields

### Backend

- [ ] Create RBAC helper functions (dynamic version)
- [ ] Update NextAuth to fetch permissions via junction table
- [ ] Update session type definition
- [ ] Create role management API endpoints
- [ ] Create permission API endpoints
- [ ] Create department management API endpoints
- [ ] Add authorization guards to admin endpoints

### Frontend - Admin Panel

- [ ] Create roles list page
- [ ] Create role create/edit page
- [ ] Create permission assignment UI (checkboxes)
- [ ] Create departments list page
- [ ] Create department create/edit page
- [ ] Create department user management UI
- [ ] Add role assignment to user edit page
- [ ] Add department assignment to user edit page

### Testing

- [ ] Test permission checking with different roles
- [ ] Test role creation/editing
- [ ] Test permission assignment/removal
- [ ] Test department management
- [ ] Test user role/department assignment
- [ ] Test permission changes reflect immediately

### Migration

- [ ] Write migration script
- [ ] Test migration on development database
- [ ] Backup production database
- [ ] Run migration on production
- [ ] Verify all users have correct permissions

---

## 🎯 Phase 8: Best Practices

### 8.1 Security Considerations

```typescript
// Always check for system roles before deletion
export async function deleteRole(roleId: string) {
  const role = await db.query.rolesTable.findFirst({
    where: eq(rolesTable.id, roleId),
  })

  if (role?.isSystemRole) {
    throw new Error('Cannot delete system role')
  }

  // Check if role has users
  const userCount = await db.query.usersTable.findMany({
    where: eq(usersTable.roleId, roleId),
  }).length

  if (userCount > 0) {
    throw new Error('Cannot delete role with assigned users')
  }

  await db.delete(rolesTable).where(eq(rolesTable.id, roleId))
}
```

### 8.2 Caching Strategy

```typescript
// Cache user permissions in session to avoid DB calls on every request
// Already cached in JWT token via NextAuth

// For admin panel, cache permission list
import { unstable_cache } from 'next/cache'

export const getAllPermissions = unstable_cache(
  async () => {
    return await db.query.permissionsTable.findMany({
      orderBy: [asc(permissionsTable.category), asc(permissionsTable.name)],
    })
  },
  ['all-permissions'],
  { revalidate: 3600 }, // Cache for 1 hour
)
```

### 8.3 Audit Logging

```typescript
// Track permission changes
export const auditLogTable = pgTable('audit_log', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(), // 'role.created', 'permission.assigned', etc.
  resourceType: varchar('resource_type', { length: 50 }).notNull(),
  resourceId: text('resource_id'),
  changes: json('changes'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Log permission changes
async function logPermissionChange(userId: string, action: string, details: any) {
  await db.insert(auditLogTable).values({
    userId,
    action,
    resourceType: 'permission',
    changes: details,
  })
}
```

---

## 🚀 Quick Start Guide

### For Developers

1. **Understand the structure:**
   - Permissions = What can be done (stored in DB)
   - Roles = Collections of permissions (stored in DB)
   - Users = Assigned one role + multiple departments

2. **To check permission:**

   ```typescript
   import { hasPermission } from '@/lib/rbac-dynamic'

   if (hasPermission(user, 'users', 'create')) {
     // Allow user creation
   }
   ```

3. **To protect admin routes:**

   ```typescript
   import { requireHR } from '@/lib/auth-guards'

   export async function GET() {
     const user = await requireHRAPI()
     // Only HR can access
   }
   ```

### For Admins

1. **To create a new role:**
   - Go to /admin/roles
   - Click "Create Role"
   - Set name, description, level
   - Check permissions you want
   - Save

2. **To modify permissions:**
   - Go to /admin/roles/[role-id]
   - Check/uncheck permissions
   - Changes apply immediately

3. **To assign role to user:**
   - Go to /admin/users/[user-id]
   - Select role from dropdown
   - Save

---

## 📊 Example Permission Matrix

| Permission             | HR Manager | Dept Manager | Employee |
| ---------------------- | ---------- | ------------ | -------- |
| users.viewAll          | ✓          | ✗            | ✗        |
| users.viewDepartment   | ✓          | ✓            | ✗        |
| users.create           | ✓          | ✗            | ✗        |
| payroll.viewAll        | ✓          | ✗            | ✗        |
| payroll.viewDepartment | ✓          | ✓            | ✗        |
| payroll.viewOwn        | ✓          | ✓            | ✓        |
| leaves.approve         | ✓          | ✓            | ✗        |
| leaves.create          | ✓          | ✓            | ✓        |
| system.manageRoles     | ✓          | ✗            | ✗        |

---

## 🎓 Summary

### What This System Gives You:

1. **Flexibility** - Change permissions without code deployment
2. **Scalability** - Easy to add new permissions or roles
3. **Auditability** - Track who has what permissions
4. **User-Friendly** - Admin panel for non-technical users
5. **Maintainability** - Clear structure, easy to understand
6. **Security** - Proper permission checking at every level

### Key Files After Implementation:

```
Database:
  permissions (table)
  role_permissions (junction table)
  roles (updated table)
  departments (updated table)

Backend:
  src/lib/rbac-dynamic.ts     ← Permission checking
  src/lib/auth-guards.ts      ← Route protection
  app/api/admin/roles/        ← Role management APIs
  app/api/admin/permissions/  ← Permission APIs

Frontend:
  app/admin/roles/            ← Role management UI
  app/admin/permissions/      ← Permission viewer
  app/admin/departments/      ← Department management
```

This roadmap gives you a complete, production-ready RBAC system that's easy to manage and maintain! 🎉
