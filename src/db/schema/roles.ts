import { pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { usersTable } from './users'

// ============================================
// Role Table (Stage 1: Simple RBAC)
// ============================================

export const rolesTable = pgTable('roles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 50 }).notNull().unique(), // 'admin', 'manager', 'employee'
  displayName: varchar('display_name', { length: 100 }).notNull(), // 'Administrator', 'Manager', 'Employee'
  description: text('description'),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  updatedAt: text('updated_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
})

// ============================================
// Relations
// ============================================

export const rolesRelations = relations(rolesTable, ({ many }) => ({
  users: many(usersTable),
}))
