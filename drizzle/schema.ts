import { pgTable, unique, integer, varchar, text, timestamp, boolean, json, numeric, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const applicationSource = pgEnum("application_source", ['website', 'linkedin', 'referral', 'job-board', 'other'])
export const applicationStatus = pgEnum("application_status", ['new', 'under-review', 'shortlisted', 'interview-scheduled', 'rejected', 'hired'])
export const educationLevel = pgEnum("education_level", ['high-school', 'associate', 'bachelor', 'master', 'phd', 'other'])
export const employmentStatus = pgEnum("employment_status", ['employed', 'unemployed', 'notice-period', 'student'])
export const employmentType = pgEnum("employment_type", ['citizen', 'workPermit', 'residencePermit', 'other'])
export const inventoryStatus = pgEnum("inventory_status", ['inUse', 'inStock', 'needsRepair', 'underRepair'])
export const itemType = pgEnum("item_type", ['laptop', 'phone', 'accessory', 'simCard', 'other'])
export const leaveStatus = pgEnum("leave_status", ['requested', 'approved', 'rejected', 'cancelled'])
export const leaveType = pgEnum("leave_type", ['annual', 'sick', 'unpaid', 'other'])
export const paymentFrequency = pgEnum("payment_frequency", ['monthly', 'quarterly', 'annual', 'oneTime'])
export const paymentMethod = pgEnum("payment_method", ['bankTransfer', 'cash', 'cheque'])
export const payrollStatus = pgEnum("payroll_status", ['generated', 'approved', 'paid', 'cancelled'])
export const payrollType = pgEnum("payroll_type", ['primary', 'bonus', 'overtime', 'commission', 'allowance', 'other'])


export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	age: integer().notNull(),
	email: varchar({ length: 255 }).notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const accounts = pgTable("accounts", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text("provider_account_id").notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
});

export const sessions = pgTable("sessions", {
	id: text().primaryKey().notNull(),
	sessionToken: text("session_token").notNull(),
	userId: text("user_id").notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	unique("sessions_session_token_unique").on(table.sessionToken),
]);

export const verificationTokens = pgTable("verification_tokens", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	unique("verification_tokens_token_unique").on(table.token),
]);

export const roles = pgTable("roles", {
	id: text().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	displayName: varchar("display_name", { length: 100 }).notNull(),
}, (table) => [
	unique("roles_name_unique").on(table.name),
]);

export const departments = pgTable("departments", {
	id: text().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	unique("departments_name_unique").on(table.name),
]);

export const userDepartments = pgTable("user_departments", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	departmentId: text("department_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const applicants = pgTable("applicants", {
	id: text().primaryKey().notNull(),
	fullName: varchar("full_name", { length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 50 }).notNull(),
	linkedinUrl: text("linkedin_url"),
	portfolioUrl: text("portfolio_url"),
	positionAppliedFor: varchar("position_applied_for", { length: 255 }).notNull(),
	yearsOfExperience: integer("years_of_experience").notNull(),
	educationLevel: educationLevel("education_level").notNull(),
	currentEmploymentStatus: employmentStatus("current_employment_status").default('unemployed').notNull(),
	expectedSalary: integer("expected_salary"),
	availabilityDate: timestamp("availability_date", { mode: 'string' }),
	source: applicationSource(),
	bio: text().notNull(),
	cv: text().notNull(),
	status: applicationStatus().default('new').notNull(),
	applicationDate: timestamp("application_date", { mode: 'string' }).defaultNow().notNull(),
	internalNotes: text("internal_notes"),
	consentToDataStorage: boolean("consent_to_data_storage").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("applicants_email_unique").on(table.email),
]);

export const inventory = pgTable("inventory", {
	id: text().primaryKey().notNull(),
	itemType: itemType("item_type").default('other').notNull(),
	model: varchar({ length: 255 }).notNull(),
	serialNumber: varchar("serial_number", { length: 255 }).notNull(),
	holderId: text("holder_id"),
	status: inventoryStatus().default('inStock').notNull(),
	purchaseDate: timestamp("purchase_date", { mode: 'string' }),
	warrantyExpiry: timestamp("warranty_expiry", { mode: 'string' }),
	images: json().default([]),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("inventory_serial_number_unique").on(table.serialNumber),
]);

export const leaveDays = pgTable("leave_days", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	type: leaveType().notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	totalDays: integer("total_days"),
	status: leaveStatus().default('requested').notNull(),
	reason: text().notNull(),
	note: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const media = pgTable("media", {
	id: text().primaryKey().notNull(),
	filename: varchar({ length: 255 }).notNull(),
	mimeType: varchar("mime_type", { length: 100 }).notNull(),
	filesize: integer().notNull(),
	width: integer(),
	height: integer(),
	alt: text(),
	url: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const payrollSettings = pgTable("payroll_settings", {
	id: text().primaryKey().notNull(),
	employeeId: text("employee_id").notNull(),
	payrollType: payrollType("payroll_type").default('primary').notNull(),
	description: text(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	paymentType: paymentMethod("payment_type").default('bankTransfer').notNull(),
	paymentFrequency: paymentFrequency("payment_frequency").default('monthly').notNull(),
	bankAccount: json("bank_account"),
	isActive: boolean("is_active").default(true).notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const payroll = pgTable("payroll", {
	id: text().primaryKey().notNull(),
	employeeId: text("employee_id").notNull(),
	month: varchar({ length: 2 }).notNull(),
	year: integer().notNull(),
	payrollItems: json("payroll_items").default([]),
	bonusAmount: numeric("bonus_amount", { precision: 10, scale:  2 }).default('0'),
	deductionAmount: numeric("deduction_amount", { precision: 10, scale:  2 }).default('0'),
	adjustmentNote: text("adjustment_note"),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	paymentDate: timestamp("payment_date", { mode: 'string' }),
	paymentReference: text("payment_reference"),
	paymentNotes: text("payment_notes"),
	status: payrollStatus().default('generated').notNull(),
	processedById: text("processed_by_id"),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
