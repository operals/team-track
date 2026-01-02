# PayloadCMS to Prisma + NextAuth Migration Plan

## Overview
This document outlines the complete migration process from PayloadCMS to a custom setup using Prisma ORM and NextAuth.js for the Team Track application.

---

## Current Architecture Analysis

### PayloadCMS Components
- **Database**: PostgreSQL via `@payloadcms/db-postgres`
- **Collections**: Users, Applicants, Inventory, LeaveDays, Payroll, PayrollSettings, AdditionalPayments, Roles, Departments, Media
- **Authentication**: Built-in PayloadCMS auth with JWT tokens
- **File Uploads**: PayloadCMS media handling
- **Admin Panel**: PayloadCMS auto-generated admin UI
- **API**: Auto-generated REST and GraphQL APIs

### Dependencies to Remove
```json
"@payloadcms/db-postgres": "3.68.1",
"@payloadcms/next": "3.68.1",
"@payloadcms/richtext-lexical": "3.68.1",
"@payloadcms/ui": "3.68.1",
"payload": "3.68.1"
```

---

## Migration Steps

### Phase 1: Setup New Infrastructure

#### Step 1.1: Install Prisma
```bash
pnpm add prisma @prisma/client
pnpm add -D prisma
```

#### Step 1.2: Initialize Prisma
```bash
npx prisma init
```

#### Step 1.3: Install NextAuth
```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

#### Step 1.4: Install File Upload Solution (Choose one)
**Option A - UploadThing (Recommended)**
```bash
pnpm add uploadthing @uploadthing/react
```

**Option B - Vercel Blob**
```bash
pnpm add @vercel/blob
```

**Option C - Local Storage with formidable**
```bash
pnpm add formidable
pnpm add -D @types/formidable
```

---

### Phase 2: Create Prisma Schema

#### Step 2.1: Define Core Models

Create `prisma/schema.prisma` with models for:

1. **User Model**
   - Fields: id, email, username, password, fullName, photo, phone numbers, addresses, role/department relations, employment info, leaves, dates
   - Relations: Role, Department, Payroll, Leaves, AdditionalPayments

2. **Role & Department Models**
   - RBAC structure with permissions

3. **Applicant Model**
   - Job application data

4. **Inventory Model**
   - Inventory management

5. **Leave Model**
   - Leave management

6. **Payroll & PayrollSettings Models**
   - Payroll data and configuration

7. **AdditionalPayments Model**
   - Additional payment tracking

8. **Media/File Model**
   - File metadata and storage paths

#### Step 2.2: Generate Prisma Client
```bash
npx prisma generate
npx prisma db push
```

---

### Phase 3: Setup NextAuth

#### Step 3.1: Create NextAuth Configuration
File: `src/auth.ts`
- Configure Credentials provider
- Setup Prisma adapter
- Configure session strategy
- Add callbacks for JWT and session

#### Step 3.2: Create Auth API Route
File: `src/app/api/auth/[...nextauth]/route.ts`
- Export GET and POST handlers

#### Step 3.3: Update Middleware
File: `middleware.ts`
- Protect routes with NextAuth middleware
- Handle public/private route logic

#### Step 3.4: Create Auth Helper Functions
- `getServerSession()` for server components
- `useSession()` for client components
- Login/logout actions

---

### Phase 4: Create API Routes

Replace PayloadCMS auto-generated APIs with custom routes:

#### Step 4.1: User API Routes
- `POST /api/users` - Create user
- `GET /api/users` - List users
- `GET /api/users/[id]` - Get user
- `PATCH /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

#### Step 4.2: Applicant API Routes
- CRUD operations for applicants
- File upload for CVs

#### Step 4.3: Inventory API Routes
- CRUD operations for inventory

#### Step 4.4: Leave API Routes
- CRUD operations for leaves
- Leave approval workflow

#### Step 4.5: Payroll API Routes
- Payroll generation
- Payroll history
- Settings management

#### Step 4.6: Additional Payments API Routes
- CRUD operations for additional payments

#### Step 4.7: Roles & Departments API Routes
- CRUD operations for roles and departments

#### Step 4.8: Media/Upload API Routes
- File upload handling
- File retrieval
- File deletion

---

### Phase 5: Implement Access Control

#### Step 5.1: Create Middleware Utils
File: `src/lib/access-control.ts`
- Port RBAC logic from `src/access/rbac.ts`
- Create permission checking functions
- Create role-based middleware

#### Step 5.2: Create Server Actions
- Protected server actions with permission checks
- Use NextAuth session for user context

#### Step 5.3: Update API Route Protection
- Add permission checks to all API routes
- Return 401/403 appropriately

---

### Phase 6: Migrate File Uploads

#### Step 6.1: Setup File Storage
- Configure chosen upload solution
- Create upload endpoint
- Handle file metadata

#### Step 6.2: Update Media Model
- Store file URLs/paths in Prisma
- Handle file deletion

#### Step 6.3: Update Components
- Replace PayloadCMS upload components
- Use new upload solution in forms

---

### Phase 7: Update Application Code

#### Step 7.1: Update Authentication Logic
Files to update:
- `src/lib/auth.ts` - Replace with NextAuth helpers
- `src/components/login-form.tsx` - Use NextAuth signIn
- `src/app/login/page.tsx` - Update login flow

#### Step 7.2: Update Server Components
Replace all:
```typescript
import { getPayload } from 'payload'
const payload = await getPayload({ config })
```

With:
```typescript
import { prisma } from '@/lib/prisma'
```

#### Step 7.3: Update API Calls
Replace all fetch calls to PayloadCMS API routes with new custom API routes

#### Step 7.4: Update Server Actions
Files in `src/lib/actions/` - Update to use Prisma

#### Step 7.5: Update Components
All components that fetch data or interact with auth:
- Dashboard components
- User components
- Applicant components
- Inventory components
- Leave components
- Payroll components
- Calendar components

---

### Phase 8: Data Migration

#### Step 8.1: Create Migration Script
File: `scripts/migrate-payload-to-prisma.ts`

Steps:
1. Connect to existing PayloadCMS database
2. Read all data from PayloadCMS tables
3. Transform data to match new Prisma schema
4. Insert into new Prisma database
5. Handle file migrations
6. Verify data integrity

#### Step 8.2: Run Migration
```bash
pnpm tsx scripts/migrate-payload-to-prisma.ts
```

---

### Phase 9: Remove PayloadCMS

#### Step 9.1: Remove Dependencies
```bash
pnpm remove @payloadcms/db-postgres @payloadcms/next @payloadcms/richtext-lexical @payloadcms/ui payload graphql
```

#### Step 9.2: Delete Files/Folders
- `src/payload.config.ts`
- `src/payload-types.ts`
- `src/collections/` (entire directory)
- `src/migrations/` (PayloadCMS migrations)
- `src/app/(payload)/` (admin panel)
- `src/seed/` (if using PayloadCMS seed structure)

#### Step 9.3: Update Scripts
Remove from `package.json`:
- `generate:importmap`
- `generate:types`
- `payload`
- Update `db:reset` script

#### Step 9.4: Clean Configuration
- Remove PayloadCMS from `next.config.mjs`
- Update `tsconfig.json` if needed

---

### Phase 10: Testing & Validation

#### Step 10.1: Update Tests
- Update integration tests in `tests/int/`
- Update e2e tests in `tests/e2e/`
- Test all authentication flows
- Test all CRUD operations
- Test file uploads

#### Step 10.2: Manual Testing
- [ ] User registration/login
- [ ] User management (CRUD)
- [ ] Applicant management
- [ ] Inventory management
- [ ] Leave management
- [ ] Payroll generation
- [ ] File uploads
- [ ] Role-based access control
- [ ] All dashboard features
- [ ] Calendar functionality

#### Step 10.3: Database Verification
- Verify all data migrated correctly
- Check foreign key relationships
- Validate data integrity

---

## Implementation Order

### Quick Reference Checklist

#### Infrastructure (Days 1-2)
- [ ] Install Prisma
- [ ] Create Prisma schema
- [ ] Install NextAuth
- [ ] Configure authentication

#### Backend (Days 3-5)
- [ ] Create all Prisma models
- [ ] Generate Prisma client
- [ ] Setup database migrations
- [ ] Create API routes for all collections
- [ ] Implement access control

#### File Handling (Day 6)
- [ ] Choose and setup upload solution
- [ ] Migrate file upload logic
- [ ] Update media handling

#### Frontend (Days 7-9)
- [ ] Update authentication UI
- [ ] Update all data-fetching components
- [ ] Update forms and mutations
- [ ] Update server actions

#### Migration & Cleanup (Days 10-11)
- [ ] Create data migration script
- [ ] Run data migration
- [ ] Verify data integrity
- [ ] Remove PayloadCMS files and dependencies

#### Testing (Days 12-13)
- [ ] Update tests
- [ ] Manual QA testing
- [ ] Fix bugs

---

## Critical Files to Create

### New Files Needed
```
prisma/
  schema.prisma

src/
  auth.ts (NextAuth config)
  lib/
    prisma.ts (Prisma client singleton)
    access-control.ts (RBAC helpers)
  app/
    api/
      auth/[...nextauth]/route.ts
      users/route.ts
      users/[id]/route.ts
      applicants/route.ts
      applicants/[id]/route.ts
      inventory/route.ts
      inventory/[id]/route.ts
      leaves/route.ts
      leaves/[id]/route.ts
      payroll/route.ts
      payroll/[id]/route.ts
      payroll-settings/route.ts
      additional-payments/route.ts
      additional-payments/[id]/route.ts
      roles/route.ts
      roles/[id]/route.ts
      departments/route.ts
      departments/[id]/route.ts
      upload/route.ts
```

---

## Environment Variables

### Add to `.env`
```env
# Prisma
DATABASE_URL="postgresql://user:password@localhost:5432/teamtrack"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"

# File Upload (if using UploadThing)
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

---

## Database Schema Notes

### Key Considerations
1. **User Authentication**: Store hashed passwords using bcrypt
2. **File Storage**: Store file URLs/paths, not binary data
3. **Soft Deletes**: Consider adding `deletedAt` fields
4. **Timestamps**: Add `createdAt` and `updatedAt` to all models
5. **Relations**: Maintain all foreign key relationships
6. **Indexes**: Add indexes for frequently queried fields

---

## Rollback Plan

If migration fails:
1. Keep old database backup
2. Revert git commits
3. Reinstall PayloadCMS dependencies
4. Restore database from backup

---

## Post-Migration Tasks

1. **Performance Optimization**
   - Add database indexes
   - Implement caching strategy
   - Optimize API queries

2. **Security Audit**
   - Review all API routes for security
   - Test authentication flows
   - Verify RBAC implementation

3. **Documentation**
   - Update README.md
   - Document new API endpoints
   - Create developer guide

4. **Monitoring**
   - Setup error tracking
   - Monitor database performance
   - Log authentication events

---

## Notes

- Keep PayloadCMS database backup before migration
- Test thoroughly in development before production
- Consider running both systems in parallel during transition
- Document any custom PayloadCMS hooks or logic to port over
- Review all `src/access/` logic for RBAC migration

---

## Questions to Answer

1. **File Storage**: Which upload solution to use? (UploadThing recommended for simplicity)
2. **Admin Panel**: Build custom admin or use existing dashboard?
3. **Rich Text**: Need rich text editor? (if yes, consider TipTap or Lexical standalone)
4. **Email**: Does app send emails? Need to setup email service?
5. **Database**: Keep same PostgreSQL database or start fresh?

---

*Last Updated: January 2, 2026*
*Status: Planning Phase*
