import { pgTable, text, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core'
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
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  totalDays: integer('total_days'), // Auto-calculated

  // Status & Approval
  status: leaveStatusEnum('status').default('requested').notNull(),

  // Details
  reason: text('reason').notNull(),
  note: text('note'), // Additional notes/comments

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
