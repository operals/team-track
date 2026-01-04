import { pgTable, text, varchar, boolean, timestamp, pgEnum, json } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { rolesTable } from './roles'
import { userDepartmentsTable } from './departments'
import { accountsTable, sessionsTable } from './auth'

// ============================================
// Enums
// ============================================

export const employmentTypeEnum = pgEnum('employment_type', [
  'citizen',
  'workPermit',
  'residencePermit',
  'other',
])

// ============================================
// User Table (NextAuth + Custom Fields)
// ============================================

export const usersTable = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // Auth fields
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }).unique(),
  password: text('password'),
  emailVerified: timestamp('email_verified'),

  // Personal Information
  fullName: varchar('full_name', { length: 255 }).notNull(),
  photo: text('photo'), // URL to media file
  birthDate: timestamp('birth_date'),

  // Contact Information
  primaryPhone: varchar('primary_phone', { length: 50 }),
  secondaryPhone: varchar('secondary_phone', { length: 50 }),
  secondaryEmail: varchar('secondary_email', { length: 255 }).unique(),
  address: text('address'),

  // Employment Information
  jobTitle: varchar('job_title', { length: 255 }),
  employmentType: employmentTypeEnum('employment_type').default('other').notNull(),
  nationality: varchar('nationality', { length: 100 }),
  identityNumber: varchar('identity_number', { length: 100 }),
  workPermitExpiry: timestamp('work_permit_expiry'),

  // Status
  isActive: boolean('is_active').default(true).notNull(),

  // Relations
  roleId: text('role_id'),
  documents: json('documents').$type<string[]>().default([]), // Array of media URLs

  // Timestamps
  joinedAt: timestamp('joined_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================
// Relations
// ============================================

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  role: one(rolesTable, {
    fields: [usersTable.roleId],
    references: [rolesTable.id],
  }),
  departments: many(userDepartmentsTable),
  accounts: many(accountsTable),
  sessions: many(sessionsTable),
}))
