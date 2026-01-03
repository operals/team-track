import { pgTable, text, varchar, integer, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core'

// ============================================
// Enums
// ============================================

export const educationLevelEnum = pgEnum('education_level', [
  'high-school',
  'associate',
  'bachelor',
  'master',
  'phd',
  'other',
])

export const employmentStatusEnum = pgEnum('employment_status', [
  'employed',
  'unemployed',
  'notice-period',
  'student',
])

export const applicationSourceEnum = pgEnum('application_source', [
  'website',
  'linkedin',
  'referral',
  'job-board',
  'other',
])

export const applicationStatusEnum = pgEnum('application_status', [
  'new',
  'under-review',
  'shortlisted',
  'interview-scheduled',
  'rejected',
  'hired',
])

// ============================================
// Applicants Table
// ============================================

export const applicantsTable = pgTable('applicants', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // Personal Information
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }).notNull(),
  linkedInUrl: text('linkedin_url'),
  portfolioUrl: text('portfolio_url'),

  // Position & Experience
  positionAppliedFor: varchar('position_applied_for', { length: 255 }).notNull(),
  yearsOfExperience: integer('years_of_experience').notNull(),
  educationLevel: educationLevelEnum('education_level').notNull(),
  currentEmploymentStatus: employmentStatusEnum('current_employment_status')
    .default('unemployed')
    .notNull(),
  expectedSalary: integer('expected_salary'),
  availabilityDate: timestamp('availability_date'),

  // Application Details
  source: applicationSourceEnum('source'),
  bio: text('bio').notNull(), // Cover letter / Bio
  cv: text('cv').notNull(), // URL to CV file in media

  // Application Management
  status: applicationStatusEnum('status').default('new').notNull(),
  applicationDate: timestamp('application_date').defaultNow().notNull(),
  internalNotes: text('internal_notes'), // Rich text stored as HTML/JSON

  // Compliance
  consentToDataStorage: boolean('consent_to_data_storage').default(false).notNull(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
