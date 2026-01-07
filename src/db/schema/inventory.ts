import { pgTable, text, varchar, timestamp, pgEnum, json } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { usersTable } from './users'

// ============================================
// Enums
// ============================================

export const itemTypeEnum = pgEnum('item_type', [
  'laptop',
  'phone',
  'accessory',
  'simCard',
  'other',
])

export const inventoryStatusEnum = pgEnum('inventory_status', [
  'inUse',
  'inStock',
  'needsRepair',
  'underRepair',
])

// ============================================
// Inventory Table
// ============================================

export const inventoryTable = pgTable('inventory', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // Item Information
  itemType: itemTypeEnum('item_type').default('other').notNull(),
  model: varchar('model', { length: 255 }).notNull(),
  serialNumber: varchar('serial_number', { length: 255 }).notNull().unique(),

  // Holder (User assigned to)
  holderId: text('holder_id'),

  // Status
  status: inventoryStatusEnum('status').default('inStock').notNull(),

  // Dates
  purchaseDate: text('purchase_date'), // ISO 8601: "YYYY-MM-DD"
  warrantyExpiry: text('warranty_expiry'), // ISO 8601: "YYYY-MM-DD"

  // Media & Notes
  images: json('images').$type<string[]>().default([]), // Array of media URLs
  notes: text('notes'),

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

export const inventoryRelations = relations(inventoryTable, ({ one }) => ({
  holder: one(usersTable, {
    fields: [inventoryTable.holderId],
    references: [usersTable.id],
  }),
}))
