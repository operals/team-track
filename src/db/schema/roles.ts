import { pgTable, text, varchar, timestamp, json } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { usersTable } from './users'

// ============================================
// Role Table
// ============================================

export const rolesTable = pgTable('roles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  permissions: json('permissions').$type<Record<string, any>>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================
// Relations
// ============================================

export const rolesRelations = relations(rolesTable, ({ many }) => ({
  users: many(usersTable),
}))
