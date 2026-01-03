import { pgTable, text, varchar, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { usersTable } from './users'

// ============================================
// Department Table
// ============================================

export const departmentsTable = pgTable('departments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================
// User-Department Junction Table
// ============================================

export const userDepartmentsTable = pgTable('user_departments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  departmentId: text('department_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ============================================
// Relations
// ============================================

export const departmentsRelations = relations(departmentsTable, ({ many }) => ({
  users: many(userDepartmentsTable),
}))

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
