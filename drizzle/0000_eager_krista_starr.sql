CREATE TYPE "public"."employment_type" AS ENUM('citizen', 'workPermit', 'residencePermit', 'other');--> statement-breakpoint
CREATE TYPE "public"."application_source" AS ENUM('website', 'linkedin', 'referral', 'job-board', 'other');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('new', 'under-review', 'shortlisted', 'interview-scheduled', 'rejected', 'hired');--> statement-breakpoint
CREATE TYPE "public"."education_level" AS ENUM('high-school', 'associate', 'bachelor', 'master', 'phd', 'other');--> statement-breakpoint
CREATE TYPE "public"."employment_status" AS ENUM('employed', 'unemployed', 'notice-period', 'student');--> statement-breakpoint
CREATE TYPE "public"."inventory_status" AS ENUM('inUse', 'inStock', 'needsRepair', 'underRepair');--> statement-breakpoint
CREATE TYPE "public"."item_type" AS ENUM('laptop', 'phone', 'accessory', 'simCard', 'other');--> statement-breakpoint
CREATE TYPE "public"."leave_status" AS ENUM('requested', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."leave_type" AS ENUM('annual', 'sick', 'unpaid', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_frequency" AS ENUM('monthly', 'quarterly', 'annual', 'oneTime');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('bankTransfer', 'cash', 'cheque');--> statement-breakpoint
CREATE TYPE "public"."payroll_type" AS ENUM('primary', 'bonus', 'overtime', 'commission', 'allowance', 'other');--> statement-breakpoint
CREATE TYPE "public"."payroll_status" AS ENUM('generated', 'approved', 'paid', 'cancelled');--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(255),
	"password" text,
	"email_verified" text,
	"full_name" varchar(255) NOT NULL,
	"photo" text,
	"birth_date" text,
	"primary_phone" varchar(50),
	"secondary_phone" varchar(50),
	"secondary_email" varchar(255),
	"address" text,
	"job_title" varchar(255),
	"employment_type" "employment_type" DEFAULT 'other' NOT NULL,
	"nationality" varchar(100),
	"identity_number" varchar(100),
	"work_permit_expiry" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"role_id" text,
	"documents" json DEFAULT '[]'::json,
	"joined_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_secondary_email_unique" UNIQUE("secondary_email")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" text,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"session_token" text NOT NULL,
	"user_id" text NOT NULL,
	"expires" text NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" text NOT NULL,
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"description" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_departments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"department_id" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applicants" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"linkedin_url" text,
	"portfolio_url" text,
	"position_applied_for" varchar(255) NOT NULL,
	"years_of_experience" integer NOT NULL,
	"education_level" "education_level" NOT NULL,
	"current_employment_status" "employment_status" DEFAULT 'unemployed' NOT NULL,
	"expected_salary" integer,
	"availability_date" text,
	"source" "application_source",
	"bio" text NOT NULL,
	"cv" text NOT NULL,
	"status" "application_status" DEFAULT 'new' NOT NULL,
	"application_date" text NOT NULL,
	"internal_notes" text,
	"consent_to_data_storage" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "applicants_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" text PRIMARY KEY NOT NULL,
	"item_type" "item_type" DEFAULT 'other' NOT NULL,
	"model" varchar(255) NOT NULL,
	"serial_number" varchar(255) NOT NULL,
	"holder_id" text,
	"status" "inventory_status" DEFAULT 'inStock' NOT NULL,
	"purchase_date" text,
	"warranty_expiry" text,
	"images" json DEFAULT '[]'::json,
	"notes" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "inventory_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "leave_days" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "leave_type" NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"total_days" integer,
	"status" "leave_status" DEFAULT 'requested' NOT NULL,
	"reason" text NOT NULL,
	"note" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"filesize" integer NOT NULL,
	"width" integer,
	"height" integer,
	"alt" text,
	"url" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"payroll_type" "payroll_type" DEFAULT 'primary' NOT NULL,
	"description" text,
	"amount" numeric(10, 2) NOT NULL,
	"payment_type" "payment_method" DEFAULT 'bankTransfer' NOT NULL,
	"payment_frequency" "payment_frequency" DEFAULT 'monthly' NOT NULL,
	"bank_account" json,
	"is_active" boolean DEFAULT true NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text,
	"notes" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"month" varchar(2) NOT NULL,
	"year" integer NOT NULL,
	"payroll_items" json DEFAULT '[]'::json,
	"bonus_amount" numeric(10, 2) DEFAULT '0',
	"deduction_amount" numeric(10, 2) DEFAULT '0',
	"adjustment_note" text,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_date" text,
	"payment_reference" text,
	"payment_notes" text,
	"status" "payroll_status" DEFAULT 'generated' NOT NULL,
	"processed_by_id" text,
	"processed_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
