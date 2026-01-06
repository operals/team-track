# User Data Architecture - From Database to Frontend

## Overview

This document explains the complete user data flow in the Team Track application, from database schema to frontend components.

---

## 1. Database Layer (Drizzle ORM)

### Location: `/src/db/schema/users.ts`

**Purpose:** Defines the database table structure and types for PostgreSQL.

```typescript
export const usersTable = pgTable('users', {
  // Auth fields
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }).unique(),
  password: text('password'),
  emailVerified: timestamp('email_verified'),

  // Personal Information
  fullName: varchar('full_name', { length: 255 }).notNull(),
  photo: text('photo'),
  birthDate: timestamp('birth_date'),

  // Contact Information
  primaryPhone: varchar('primary_phone', { length: 50 }),
  secondaryPhone: varchar('secondary_phone', { length: 50 }),
  secondaryEmail: varchar('secondary_email', { length: 255 }),
  address: text('address'),

  // Employment Information
  jobTitle: varchar('job_title', { length: 255 }),
  employmentType: employmentTypeEnum('employment_type'),
  nationality: varchar('nationality', { length: 100 }),
  identityNumber: varchar('identity_number', { length: 100 }),
  workPermitExpiry: timestamp('work_permit_expiry'),

  // Relations
  roleId: text('role_id'),
  documents: json('documents').$type<string[]>(),

  // Timestamps
  joinedAt: timestamp('joined_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

**Key Points:**

- Uses `timestamp` type for dates → **Returns JavaScript Date objects**
- Uses `json` type for documents array
- Has relations to roles and departments tables
- Drizzle infers TypeScript types from this schema

**Type Export:**

```typescript
type User = InferSelectModel<typeof usersTable>
// This generates a TypeScript type matching the database structure
```

---

## 2. Server Component Layer (RSC - React Server Components)

### Location: `/src/app/(dashboard)/users/[id]/edit/page.tsx`

**Purpose:** Fetch user data from database and pass it to client components.

### Data Flow:

#### Step 1: Query Database

```typescript
const userToEdit = await db.query.usersTable.findFirst({
  where: eq(usersTable.id, id),
  with: {
    role: true,
    departments: {
      with: {
        department: true,
      },
    },
  },
})
```

**Returns:**

```typescript
{
  id: string
  email: string
  fullName: string
  birthDate: Date       // ⚠️ JavaScript Date object
  joinedAt: Date        // ⚠️ JavaScript Date object
  workPermitExpiry: Date // ⚠️ JavaScript Date object
  createdAt: Date       // ⚠️ JavaScript Date object
  updatedAt: Date       // ⚠️ JavaScript Date object
  emailVerified: Date   // ⚠️ JavaScript Date object
  nationality: string
  // ... other fields
  role: { id: string, name: string }
  departments: Array<{
    id: string
    userId: string
    departmentId: string
    createdAt: Date     // ⚠️ JavaScript Date object
    department: {
      id: string
      name: string
      createdAt: Date   // ⚠️ JavaScript Date object
      updatedAt: Date   // ⚠️ JavaScript Date object
      // ... other fields
    }
  }>
}
```

#### Step 2: Pass to Client Component

```typescript
<UserForm
  mode="edit"
  initialData={userToEdit}  // ⚠️ PROBLEM: Contains Date objects!
  formAction={handleUpdateUser}
/>
```

**🚨 THE CORE ISSUE:**

- Server Components can only pass **serializable data** to Client Components
- JavaScript `Date` objects are **NOT serializable** in React's RSC protocol
- Date objects need to be converted to strings (ISO format) before crossing the server/client boundary

---

## 3. Form Validation Layer (Zod)

### Location: `/src/components/user/forms/user-form.schema.ts`

**Purpose:** Client-side validation schema for the user form.

```typescript
export const UserFormSchema = z.object({
  email: z.string().min(1, 'Please enter a valid email address'),
  fullName: z.string().min(1, 'Full name is required'),
  birthDate: z
    .string() // ✅ Expects STRING
    .min(1, 'Birth date is required')
    .refine((val) => !Number.isNaN(new Date(val).getTime()), 'Invalid date'),
  nationality: z.string().optional().default(''),
  workPermitExpiry: z.string().optional(), // ✅ Expects STRING
  // ... other fields
})

export type UserFormValues = z.infer<typeof UserFormSchema>
```

**Key Points:**

- All date fields are defined as **strings** (not Date objects)
- This matches HTML input[type="date"] which uses string format "YYYY-MM-DD"
- Zod validates the data before submission

**Why Keep This Separate from Drizzle Schema?**

1. **Different Concerns:**
   - Drizzle: Database structure and types
   - Zod: Form validation and user input
2. **Different Data Formats:**
   - DB: `timestamp` → Date objects
   - Form: `string` → "YYYY-MM-DD" format
3. **Additional Validation:**
   - Password confirmation (not in DB)
   - Conditional validation (work permit expiry required if employment type is workPermit)
   - Custom business rules

---

## 4. Client Component Layer (User Form)

### Location: `/src/components/user/forms/user-form.tsx`

**Purpose:** Render the form UI and handle user interactions.

### Data Flow:

#### Step 1: Receive Props

```typescript
interface UserFormProps {
  initialData?: Partial<User> // ⚠️ Type from Drizzle (has Date objects)
  mode: 'create' | 'edit'
  formAction?: (formData: FormData) => Promise<void>
  departments?: Array<{ value: string; label: string }>
  roles?: Array<{ value: string; label: string }>
}
```

#### Step 2: Transform to Form Values

```typescript
const defaultValues: UserFormValues = {
  fullName: initialData?.fullName || '',
  birthDate: initialData?.birthDate
    ? formatDateForInput(initialData.birthDate) // Date → "YYYY-MM-DD"
    : '',
  nationality: initialData?.nationality || '',
  workPermitExpiry: initialData?.workPermitExpiry
    ? formatDateForInput(initialData.workPermitExpiry) // Date → "YYYY-MM-DD"
    : undefined,
  // ... transform all fields
}
```

**Date Transformation Function:**

```typescript
// /src/lib/date-utils.ts
export function formatDateForInput(value?: string | Date | null): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
```

#### Step 3: Initialize React Hook Form

```typescript
const {
  register,
  control,
  watch,
  formState: { errors },
} = useForm<UserFormValues>({
  resolver: zodResolver(UserFormSchema),
  defaultValues, // Uses transformed string values
  mode: 'onSubmit',
})
```

#### Step 4: Render Form Fields

```typescript
<SelectField
  control={control}
  name="nationality"
  label="Nationality"
  options={COUNTRIES}
  searchable={true}
/>
```

---

## 5. Form Field Components

### Location: `/src/components/form/select-field.tsx`

**Purpose:** Reusable select dropdown with React Hook Form integration.

```typescript
export function SelectField<TFieldValues extends FieldValues>({
  control,
  name,
  options,
  // ...
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        // ⚠️ field.value could be anything from the form state
        const stringValue = field.value != null ? String(field.value) : ''

        return (
          <>
            <input type="hidden" name={String(name)} value={stringValue} />
            <Select value={stringValue} onValueChange={field.onChange}>
              {/* ... */}
            </Select>
          </>
        )
      }}
    />
  )
}
```

**Current Problem:**

- `String(field.value)` assumes the value is primitive
- If `field.value` is a Date object, `String(date)` calls `date.toString()`
- The hidden input tries to serialize this, which can fail

---

## 6. Server Action Layer

### Location: `/src/app/(dashboard)/users/[id]/edit/page.tsx` (handleUpdateUser)

**Purpose:** Process form submission and update database.

### Data Flow:

#### Step 1: Receive FormData

```typescript
const handleUpdateUser = async (formData: FormData) => {
  'use server'

  const nationality = String(formData.get('nationality') || '')
  const birthDate = String(formData.get('birthDate') || '')
  // ... extract all fields
}
```

#### Step 2: Update Database

```typescript
await db
  .update(usersTable)
  .set({
    nationality,
    birthDate, // String → Drizzle converts to timestamp
    updatedAt: new Date().toISOString(),
  })
  .where(eq(usersTable.id, id))
```

---

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE (PostgreSQL)                     │
│                                                                  │
│  usersTable                                                      │
│  ├─ birthDate: timestamp        → Returns Date object           │
│  ├─ joinedAt: timestamp         → Returns Date object           │
│  ├─ workPermitExpiry: timestamp → Returns Date object           │
│  └─ nationality: varchar        → Returns string                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Drizzle Query
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              SERVER COMPONENT (RSC)                              │
│              /app/(dashboard)/users/[id]/edit/page.tsx           │
│                                                                  │
│  const userToEdit = await db.query.usersTable.findFirst(...)    │
│                                                                  │
│  Result:                                                         │
│  {                                                               │
│    birthDate: Date,        ⚠️ JavaScript Date object            │
│    nationality: "Afghan",  ✅ String                            │
│    // ...                                                        │
│  }                                                               │
│                                                                  │
│  ⚠️ ISSUE: Passing Date objects to Client Component             │
│  <UserForm initialData={userToEdit} />                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ RSC Serialization Boundary
                            │ (Date objects cause issues here)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              CLIENT COMPONENT                                    │
│              /components/user/forms/user-form.tsx                │
│                                                                  │
│  Receives: initialData with Date objects ⚠️                     │
│                                                                  │
│  Transform:                                                      │
│  birthDate: formatDateForInput(initialData.birthDate)           │
│  → "2003-06-13" ✅                                              │
│                                                                  │
│  nationality: initialData.nationality                            │
│  → "Afghan" ✅                                                  │
│                                                                  │
│  Initialize React Hook Form with transformed values              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Form State
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              FORM VALIDATION (Zod)                               │
│              /components/user/forms/user-form.schema.ts          │
│                                                                  │
│  UserFormSchema {                                                │
│    birthDate: z.string(),    ✅ Expects string                  │
│    nationality: z.string(),  ✅ Expects string                  │
│  }                                                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ User Input
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              FORM FIELDS                                         │
│              /components/form/select-field.tsx                   │
│                                                                  │
│  <SelectField name="nationality" />                              │
│  ├─ field.value = "Afghan" ✅                                   │
│  └─ onChange updates form state                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Form Submit
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              SERVER ACTION                                       │
│              handleUpdateUser(formData)                          │
│                                                                  │
│  Extract:                                                        │
│  nationality = String(formData.get('nationality'))               │
│  → "Afghan" ✅                                                  │
│                                                                  │
│  Update DB:                                                      │
│  await db.update(usersTable).set({ nationality })                │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Problem & Solutions

### 🚨 Current Issue

**Root Cause:**
When a Server Component passes data containing JavaScript `Date` objects to a Client Component, React's serialization fails because Date objects are not JSON-serializable in the RSC protocol.

**Where It Happens:**

```typescript
// Server Component
const userToEdit = await db.query.usersTable.findFirst(...)
// userToEdit.birthDate is a Date object

<UserForm initialData={userToEdit} />  // ⚠️ Error here
```

### ✅ Solution Options

#### Option 1: Serialize Before Passing (Recommended)

```typescript
// In /src/app/(dashboard)/users/[id]/edit/page.tsx

const serializableUser = {
  ...userToEdit,
  // Convert all Date fields to ISO strings
  birthDate: userToEdit.birthDate?.toISOString() ?? null,
  joinedAt: userToEdit.joinedAt?.toISOString() ?? null,
  workPermitExpiry: userToEdit.workPermitExpiry?.toISOString() ?? null,
  createdAt: userToEdit.createdAt?.toISOString() ?? null,
  updatedAt: userToEdit.updatedAt?.toISOString() ?? null,
  emailVerified: userToEdit.emailVerified?.toISOString() ?? null,
  // Also serialize dates in nested relations
  departments: userToEdit.departments?.map(dept => ({
    ...dept,
    createdAt: dept.createdAt?.toISOString() ?? null,
    department: {
      ...dept.department,
      createdAt: dept.department.createdAt?.toISOString() ?? null,
      updatedAt: dept.department.updatedAt?.toISOString() ?? null,
    }
  })) ?? []
}

<UserForm initialData={serializableUser} />
```

#### Option 2: Use JSON.parse(JSON.stringify())

```typescript
// Quick but loses type safety
const serializableUser = JSON.parse(JSON.stringify(userToEdit))
<UserForm initialData={serializableUser} />
```

#### Option 3: Create a Serialization Utility

```typescript
// /src/lib/serialize.ts
export function serializeUser(user: User) {
  return {
    ...user,
    birthDate: user.birthDate?.toISOString() ?? null,
    joinedAt: user.joinedAt?.toISOString() ?? null,
    // ... serialize all date fields
  }
}
```

---

## Key Takeaways

1. **Database Layer (Drizzle):**
   - Defines DB structure
   - Returns Date objects for timestamp columns
   - Provides type inference

2. **Form Validation Layer (Zod):**
   - Validates user input
   - Uses string format for dates (matches HTML inputs)
   - Separate from DB schema for good reason

3. **Server/Client Boundary:**
   - Date objects cannot cross this boundary
   - Must serialize Date → ISO string before passing to client

4. **Client Components:**
   - Receive serialized data (strings)
   - Transform to appropriate formats for display
   - Use React Hook Form for state management

5. **Best Practice:**
   - Always serialize Date objects in Server Components before passing to Client Components
   - Keep DB schema and form validation schema separate
   - Use utility functions for consistent date formatting

---

## Files Reference

| File                                             | Purpose                           | Layer    |
| ------------------------------------------------ | --------------------------------- | -------- |
| `/src/db/schema/users.ts`                        | Database table definition         | Database |
| `/src/app/(dashboard)/users/[id]/edit/page.tsx`  | Server component - fetch & update | Server   |
| `/src/components/user/forms/user-form.tsx`       | Client component - UI             | Client   |
| `/src/components/user/forms/user-form.schema.ts` | Form validation                   | Client   |
| `/src/components/form/select-field.tsx`          | Reusable form field               | Client   |
| `/src/lib/date-utils.ts`                         | Date formatting utilities         | Shared   |

---

## Next Steps for Refactoring

1. ✅ Create a serialization utility for User objects
2. ✅ Apply serialization in all Server Components that pass User data
3. ✅ Ensure type safety with proper TypeScript types
4. ✅ Update form components to handle both string and Date inputs gracefully
5. ✅ Add tests for date serialization/deserialization
