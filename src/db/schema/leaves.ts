import { pgTable, text, pgEnum, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { usersTable } from './users'

// ============================================
// Enums
// ============================================

export const leaveTypeEnum = pgEnum('leave_type', ['annual', 'sick', 'unpaid', 'other'])

export const leaveStatusEnum = pgEnum('leave_status', [
  'requested',
  'approved',
  'rejected',
  'cancelled',
])

// ============================================
// Leaves Table
// ============================================

export const leavesTable = pgTable('leave_days', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // User (who is taking leave)
  userId: text('user_id').notNull(),

  // Leave Information
  type: leaveTypeEnum('type').notNull(),
  startDate: text('start_date').notNull(), // ISO 8601: "YYYY-MM-DD"
  endDate: text('end_date').notNull(), // ISO 8601: "YYYY-MM-DD"
  totalDays: integer('total_days'), // Auto-calculated

  // Status & Approval
  status: leaveStatusEnum('status').default('requested').notNull(),

  // Details
  reason: text('reason').notNull(),
  note: text('note'), // Additional notes/comments

  // Timestamps
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

export const leavesRelations = relations(leavesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [leavesTable.userId],
    references: [usersTable.id],
  }),
}))
