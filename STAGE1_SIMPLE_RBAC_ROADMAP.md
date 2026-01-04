# Stage 1: Simple RBAC System - Implementation Roadmap

## 🎯 Stage 1 Goals

Build a **simple, straightforward** RBAC system with:

- ✅ 3 fixed roles: Admin, Manager, Employee
- ✅ Departments as simple categories (no permissions tied to them)
- ✅ Admin UI to manage departments
- ✅ Different dashboards based on role
- ✅ No complex permission matrix (yet!)

---

## 📊 System Overview

### Role Definitions (Simple & Fixed)

| Role         | Access Level       | Listed as Employee? | Dashboard                       |
| ------------ | ------------------ | ------------------- | ------------------------------- |
| **Admin**    | Full system access | ❌ No               | `/` (admin dashboard)           |
| **Manager**  | Full system access | ✅ Yes              | `/` (admin dashboard)           |
| **Employee** | Own profile only   | ✅ Yes              | `/profile` (employee dashboard) |

### Departments (Simple Categories)

- Just tags/labels: "ENG", "DE", "Marketing", "Sales"
- Users can belong to multiple departments
- No permissions attached (yet)
- Managed via admin panel

---

## 🗄️ Phase 1: Simplified Database Schema

### 1.1 Roles Table (Simplified)

```typescript
// src/db/schema/roles.ts
export const rolesTable = pgTable('roles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 50 }).notNull().unique(), // 'admin', 'manager', 'employee'
  displayName: varchar('display_name', { length: 100 }).notNull(), // 'Administrator', 'Manager', 'Employee'
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Relations
export const rolesRelations = relations(rolesTable, ({ many }) => ({
  users: many(usersTable),
}))
```

**Seed Data:**

```typescript
;[
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access, not listed as employee',
  },
  {
    name: 'manager',
    displayName: 'Manager',
    description: 'Full system access, listed as employee',
  },
  { name: 'employee', displayName: 'Employee', description: 'Access to own profile only' },
]
```

### 1.2 Departments Table (Simplified)

```typescript
// src/db/schema/departments.ts
export const departmentsTable = pgTable('departments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 100 }).notNull().unique(), // 'ENG', 'DE', 'Marketing', 'Sales'
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Relations
export const departmentsRelations = relations(departmentsTable, ({ many }) => ({
  users: many(userDepartmentsTable),
}))
```

### 1.3 User-Department Junction (Already Exists)

```typescript
// src/db/schema/departments.ts
export const userDepartmentsTable = pgTable('user_departments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  departmentId: text('department_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const userDepartmentsRelations = relations(userDepartmentsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userDepartmentsTable.userId],
    references: [usersTable.id],
  }),
  department: one(departmentsTable, {
    fields: [userDepartmentsTable.departmentId],
    references: [departmentsTable.id],
  }),
}))
```

### 1.4 Users Table (Keep Simple)

```typescript
// Already exists in src/db/schema/users.ts
// Just make sure it has:
export const usersTable = pgTable('users', {
  // ... existing fields
  roleId: text('role_id').references(() => rolesTable.id),
  isSuperAdmin: boolean('is_super_admin').default(false).notNull(),
  // ... rest of fields
})
```

---

## 🔧 Phase 2: Simple RBAC Logic

### 2.1 Role Checking (Simple)

```typescript
// src/lib/rbac-simple.ts

export type RoleName = 'admin' | 'manager' | 'employee'

export interface SimpleUser {
  id: string
  email?: string | null
  name?: string | null
  isSuperAdmin?: boolean
  role?: {
    id: string
    name: RoleName
    displayName: string
  }
  departments?: Array<{
    departmentId: string
    department: {
      id: string
      name: string
    }
  }>
}

/**
 * Check if user is admin
 */
export function isAdmin(user: SimpleUser | null | undefined): boolean {
  if (!user) return false
  if (user.isSuperAdmin) return true
  return user.role?.name === 'admin'
}

/**
 * Check if user is manager
 */
export function isManager(user: SimpleUser | null | undefined): boolean {
  if (!user) return false
  return user.role?.name === 'manager'
}

/**
 * Check if user is employee
 */
export function isEmployee(user: SimpleUser | null | undefined): boolean {
  if (!user) return false
  return user.role?.name === 'employee'
}

/**
 * Check if user has full access (admin or manager)
 */
export function hasFullAccess(user: SimpleUser | null | undefined): boolean {
  return isAdmin(user) || isManager(user)
}

/**
 * Check if user should be listed as employee
 */
export function isListedAsEmployee(user: SimpleUser | null | undefined): boolean {
  if (!user) return false
  // Managers and employees are listed, admins are not
  return isManager(user) || isEmployee(user)
}

/**
 * Get user's department IDs
 */
export function getUserDepartmentIds(user: SimpleUser | null | undefined): string[] {
  if (!user?.departments) return []
  return user.departments.map((ud) => ud.departmentId)
}

/**
 * Get user's department names
 */
export function getUserDepartmentNames(user: SimpleUser | null | undefined): string[] {
  if (!user?.departments) return []
  return user.departments.map((ud) => ud.department.name)
}

/**
 * Check if user can access another user's profile
 */
export function canAccessUserProfile(currentUser: SimpleUser, targetUserId: string): boolean {
  // Can always access own profile
  if (currentUser.id === targetUserId) return true

  // Admin and manager can access all profiles
  return hasFullAccess(currentUser)
}

/**
 * Get redirect path based on role
 */
export function getRoleRedirectPath(user: SimpleUser | null | undefined): string {
  if (!user) return '/login'

  // Employee goes to their profile
  if (isEmployee(user)) {
    return '/profile'
  }

  // Admin and manager go to dashboard
  return '/'
}
```

### 2.2 Simplified Auth Guards

```typescript
// src/lib/auth-guards-simple.ts
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import type { SimpleUser } from '@/lib/rbac-simple'
import { isAdmin, isManager, hasFullAccess, getRoleRedirectPath } from '@/lib/rbac-simple'

/**
 * Require user to be authenticated
 */
export async function requireAuth(): Promise<SimpleUser> {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/login')
  }

  return session.user as SimpleUser
}

/**
 * Require user to be authenticated (for API routes)
 */
export async function requireAuthAPI(): Promise<SimpleUser | null> {
  const session = await getServerSession()

  if (!session?.user) {
    return null
  }

  return session.user as SimpleUser
}

/**
 * Require full access (admin or manager)
 */
export async function requireFullAccess(): Promise<SimpleUser> {
  const user = await requireAuth()

  if (!hasFullAccess(user)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Require full access (for API routes)
 */
export async function requireFullAccessAPI(): Promise<SimpleUser | null> {
  const user = await requireAuthAPI()

  if (!user || !hasFullAccess(user)) {
    return null
  }

  return user
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<SimpleUser> {
  const user = await requireAuth()

  if (!isAdmin(user)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Require admin role (for API routes)
 */
export async function requireAdminAPI(): Promise<SimpleUser | null> {
  const user = await requireAuthAPI()

  if (!user || !isAdmin(user)) {
    return null
  }

  return user
}

/**
 * Redirect to appropriate dashboard based on role
 */
export async function redirectToDashboard() {
  const user = await requireAuth()
  redirect(getRoleRedirectPath(user))
}

/**
 * API response helpers
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 })
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return Response.json({ error: message }, { status: 403 })
}

export function successResponse<T>(data: T, status: number = 200) {
  return Response.json(data, { status })
}

export function errorResponse(message: string, status: number = 400) {
  return Response.json({ error: message }, { status })
}
```

---

## 🎨 Phase 3: Admin UI - Department Management

### 3.1 Departments List Page

```typescript
// app/(dashboard)/admin/departments/page.tsx
import { requireFullAccess } from '@/lib/auth-guards-simple'
import { db } from '@/db'
import { DepartmentsList } from '@/components/admin/departments-list'

export default async function DepartmentsPage() {
  await requireFullAccess() // Only admin/manager can access

  const departments = await db.query.departmentsTable.findMany({
    with: {
      users: {
        with: {
          user: true,
        },
      },
    },
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <CreateDepartmentButton />
      </div>

      <DepartmentsList departments={departments} />
    </div>
  )
}
```

### 3.2 Create/Edit Department Form

```typescript
// components/admin/department-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function DepartmentForm({ department }: { department?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      isActive: formData.get('isActive') === 'on',
    }

    const url = department?.id
      ? `/api/admin/departments/${department.id}`
      : '/api/admin/departments'

    const method = department?.id ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      router.push('/admin/departments')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          name="name"
          defaultValue={department?.name}
          placeholder="e.g., ENG, DE, Marketing"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          name="description"
          defaultValue={department?.description}
          placeholder="Optional description"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={department?.isActive ?? true}
          className="h-4 w-4"
        />
        <label className="text-sm">Active</label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
```

### 3.3 Department API Routes

```typescript
// app/api/admin/departments/route.ts
import {
  requireFullAccessAPI,
  unauthorizedResponse,
  successResponse,
} from '@/lib/auth-guards-simple'
import { db } from '@/db'
import { departmentsTable } from '@/db/schema'

export async function GET() {
  const user = await requireFullAccessAPI()

  if (!user) {
    return unauthorizedResponse()
  }

  const departments = await db.query.departmentsTable.findMany({
    with: {
      users: {
        with: {
          user: true,
        },
      },
    },
  })

  return successResponse(departments)
}

export async function POST(request: Request) {
  const user = await requireFullAccessAPI()

  if (!user) {
    return unauthorizedResponse()
  }

  const body = await request.json()
  const { name, description, isActive } = body

  const [department] = await db
    .insert(departmentsTable)
    .values({
      name,
      description,
      isActive: isActive ?? true,
    })
    .returning()

  return successResponse(department, 201)
}
```

```typescript
// app/api/admin/departments/[id]/route.ts
import {
  requireFullAccessAPI,
  unauthorizedResponse,
  successResponse,
} from '@/lib/auth-guards-simple'
import { db } from '@/db'
import { departmentsTable } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await requireFullAccessAPI()

  if (!user) {
    return unauthorizedResponse()
  }

  const body = await request.json()
  const { name, description, isActive } = body

  const [updated] = await db
    .update(departmentsTable)
    .set({
      name,
      description,
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(departmentsTable.id, params.id))
    .returning()

  return successResponse(updated)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await requireFullAccessAPI()

  if (!user) {
    return unauthorizedResponse()
  }

  await db.delete(departmentsTable).where(eq(departmentsTable.id, params.id))

  return successResponse({ success: true })
}
```

---

## 🔄 Phase 4: Update Existing Files

### 4.1 Update NextAuth Config

```typescript
// src/auth.ts (update authorize function)

async authorize(credentials) {
  // ... existing password check

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, credentials.email as string),
    with: {
      role: true, // ← Just get role (no complex permissions)
      departments: {
        with: {
          department: true,
        },
      },
    },
  })

  // ... existing validation

  return {
    id: user.id,
    email: user.email,
    name: user.fullName,
    image: user.photo,
    isSuperAdmin: user.isSuperAdmin,
    role: user.role, // ← Simple role object
    departments: user.departments,
  } as any
}
```

### 4.2 Update Session Callbacks

```typescript
// src/auth.ts (callbacks section)

callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id
      token.isSuperAdmin = (user as any).isSuperAdmin
      token.role = (user as any).role
      token.departments = (user as any).departments
    }
    return token
  },
  async session({ session, token }) {
    if (token && session.user) {
      session.user.id = token.id as string
      ;(session.user as any).isSuperAdmin = token.isSuperAdmin
      ;(session.user as any).role = token.role
      ;(session.user as any).departments = token.departments
    }
    return session
  },
}
```

### 4.3 Update Middleware (Route Protection)

```typescript
// middleware.ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const user = req.auth?.user as any

  // Public routes
  if (pathname.startsWith('/login') || pathname.startsWith('/apply')) {
    return NextResponse.next()
  }

  // Not logged in → redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Employee trying to access admin routes → redirect to profile
  if (pathname.startsWith('/admin') || pathname === '/') {
    if (user.role?.name === 'employee') {
      return NextResponse.redirect(new URL('/profile', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 🌱 Phase 5: Simplified Seeding

### 5.1 Seed Roles

```typescript
// src/seed/index.ts (add to beginning)

async function seedRoles() {
  console.log('📋 Seeding roles...')

  const roles = [
    {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Full system access, not listed as employee',
    },
    {
      name: 'manager',
      displayName: 'Manager',
      description: 'Full system access, listed as employee',
    },
    {
      name: 'employee',
      displayName: 'Employee',
      description: 'Access to own profile only',
    },
  ]

  for (const role of roles) {
    await db
      .insert(rolesTable)
      .values(role)
      .onConflictDoUpdate({
        target: rolesTable.name,
        set: { displayName: role.displayName, description: role.description },
      })
    console.log(`  ✓ Created/updated role: ${role.displayName}`)
  }
}
```

### 5.2 Seed Departments

```typescript
// src/seed/index.ts

async function seedDepartments() {
  console.log('🏢 Seeding departments...')

  const departments = [
    { name: 'ENG', description: 'English Department' },
    { name: 'DE', description: 'German Department' },
    { name: 'Marketing', description: 'Marketing Department' },
    { name: 'Sales', description: 'Sales Department' },
  ]

  for (const dept of departments) {
    await db.insert(departmentsTable).values(dept).onConflictDoNothing()
    console.log(`  ✓ Created department: ${dept.name}`)
  }
}
```

### 5.3 Update Main Seed Function

```typescript
// src/seed/index.ts

export async function seed() {
  console.log('🌱 Starting database seeding...')

  try {
    // 1. Seed roles (must be first)
    await seedRoles()

    // 2. Seed departments
    await seedDepartments()

    // 3. Fetch created data
    const roles = await db.query.rolesTable.findMany()
    const departments = await db.query.departmentsTable.findMany()

    // 4. Seed users with simple roles
    await seedMarvelCharacters(roles, departments)

    // ... rest of seeding

    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}
```

---

## 📋 Implementation Checklist

### Phase 1: Database & Schema

- [ ] Update/simplify `roles` table schema
- [ ] Update/simplify `departments` table schema
- [ ] Remove complex permission fields
- [ ] Run `drizzle-kit push` to update database

### Phase 2: RBAC Logic

- [ ] Create `src/lib/rbac-simple.ts` with simple role checks
- [ ] Create `src/lib/auth-guards-simple.ts` with simplified guards
- [ ] Delete `src/lib/roles.ts` (complex definitions)
- [ ] Delete `src/lib/rbac.ts` (complex permission checking)
- [ ] Delete `src/access/authenticated.ts` (old PayloadCMS file)

### Phase 3: API Routes

- [ ] Create `/api/admin/departments` (GET, POST)
- [ ] Create `/api/admin/departments/[id]` (PUT, DELETE)

### Phase 4: Admin UI

- [ ] Create `/admin/departments` page (list view)
- [ ] Create department form component
- [ ] Create department list component
- [ ] Add create/edit/delete functionality

### Phase 5: Route Protection

- [ ] Update `middleware.ts` for role-based redirects
- [ ] Protect admin routes (require admin/manager)
- [ ] Redirect employees to `/profile`

### Phase 6: Seeding

- [ ] Update seed script with simplified roles
- [ ] Update seed script with departments
- [ ] Remove complex permission seeding
- [ ] Test seeding flow

### Phase 7: Testing

- [ ] Test admin login → dashboard access
- [ ] Test manager login → dashboard access
- [ ] Test employee login → profile redirect
- [ ] Test department CRUD operations
- [ ] Test user-department assignments

---

## 🚀 Quick Start Commands

```bash
# 1. Clean up old files
rm src/lib/roles.ts
rm src/lib/rbac.ts
rm src/access/authenticated.ts

# 2. Create new simplified files
# (create files as shown above)

# 3. Update database schema
pnpm drizzle-kit push

# 4. Run seeding
pnpm seed

# 5. Test the app
pnpm dev
```

---

## 🎯 What You'll Have After Stage 1

### Simple & Clean:

- 3 fixed roles (admin, manager, employee)
- Departments as simple categories
- Admin panel for department management
- Role-based dashboard redirects
- Easy to understand and maintain

### Ready for Stage 2:

- Clean foundation to build on
- Database structure ready for expansion
- Simple RBAC that can be enhanced
- Admin UI patterns established

---

## 🔜 Stage 2 Preview

After Stage 1 is complete and stable, Stage 2 will add:

- Dynamic permissions table
- Role-permission junction table
- Permission assignment UI in admin panel
- Granular access control
- Department-based permissions
- Full audit logging

But for now, keep it simple! 🎉
