import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_employment_type" AS ENUM('citizen', 'workPermit', 'residencePermit', 'other');
  CREATE TYPE "public"."enum_inventory_item_type" AS ENUM('laptop', 'phone', 'accessory', 'simCard', 'other');
  CREATE TYPE "public"."enum_inventory_status" AS ENUM('inUse', 'inStock', 'needsRepair', 'underRepair');
  CREATE TYPE "public"."enum_leave_days_type" AS ENUM('annual', 'sick', 'unpaid', 'other');
  CREATE TYPE "public"."enum_leave_days_status" AS ENUM('requested', 'approved', 'rejected', 'cancelled');
  CREATE TYPE "public"."enum_payroll_payroll_items_payroll_type" AS ENUM('primary', 'bonus', 'overtime', 'commission', 'allowance', 'other');
  CREATE TYPE "public"."enum_payroll_payroll_items_payment_type" AS ENUM('bankTransfer', 'cash', 'cheque');
  CREATE TYPE "public"."enum_payroll_period_month" AS ENUM('01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12');
  CREATE TYPE "public"."enum_payroll_status" AS ENUM('generated', 'approved', 'paid', 'cancelled');
  CREATE TYPE "public"."enum_payroll_settings_payroll_type" AS ENUM('primary', 'bonus', 'overtime', 'commission', 'allowance', 'other');
  CREATE TYPE "public"."enum_payroll_settings_payment_details_payment_type" AS ENUM('bankTransfer', 'cash', 'cheque');
  CREATE TYPE "public"."enum_payroll_settings_payment_details_payment_frequency" AS ENUM('monthly', 'quarterly', 'annual', 'oneTime');
  CREATE TYPE "public"."enum_additional_payments_category" AS ENUM('bonus', 'deduction', 'advance', 'commission', 'allowance', 'other');
  CREATE TYPE "public"."enum_additional_payments_payment_type" AS ENUM('bankTransfer', 'cash', 'cheque');
  CREATE TYPE "public"."enum_additional_payments_period_month" AS ENUM('01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12');
  CREATE TYPE "public"."enum_additional_payments_status" AS ENUM('generated', 'approved', 'paid', 'cancelled');
  CREATE TYPE "public"."enum_roles_level" AS ENUM('admin', 'manager', 'employee', 'restricted');
  CREATE TYPE "public"."enum_departments_category" AS ENUM('functional', 'language');
  CREATE TYPE "public"."enum_departments_functional_type" AS ENUM('sales', 'field', 'marketing', 'transfer', 'hr', 'dental', 'other');
  CREATE TYPE "public"."enum_departments_language_code" AS ENUM('en', 'tr', 'pl', 'ru', 'fr', 'de', 'ro', 'uk');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"is_super_admin" boolean DEFAULT false,
  	"photo_id" integer,
  	"role_id" integer,
  	"job_title" varchar,
  	"birth_date" timestamp(3) with time zone,
  	"primary_phone" varchar,
  	"secondary_phone" varchar,
  	"secondary_email" varchar,
  	"employment_type" "enum_users_employment_type" DEFAULT 'other' NOT NULL,
  	"nationality" varchar,
  	"identification_number" varchar,
  	"work_permit_expiry" timestamp(3) with time zone,
  	"address" varchar,
  	"is_active" boolean DEFAULT true,
  	"joined_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"username" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"departments_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "inventory" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"item_type" "enum_inventory_item_type" DEFAULT 'other' NOT NULL,
  	"model" varchar NOT NULL,
  	"serial_number" varchar NOT NULL,
  	"holder_id" integer,
  	"status" "enum_inventory_status" DEFAULT 'inStock' NOT NULL,
  	"purchase_date" timestamp(3) with time zone,
  	"warranty_expiry" timestamp(3) with time zone,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inventory_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "leave_days" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"type" "enum_leave_days_type" NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"total_days" numeric,
  	"status" "enum_leave_days_status" DEFAULT 'requested',
  	"reason" varchar NOT NULL,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payroll_payroll_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"payroll_setting_id" integer NOT NULL,
  	"description" varchar NOT NULL,
  	"payroll_type" "enum_payroll_payroll_items_payroll_type",
  	"amount" numeric NOT NULL,
  	"payment_type" "enum_payroll_payroll_items_payment_type"
  );
  
  CREATE TABLE "payroll" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"employee_id" integer NOT NULL,
  	"period_month" "enum_payroll_period_month" NOT NULL,
  	"period_year" numeric DEFAULT 2025 NOT NULL,
  	"adjustments_bonus_amount" numeric DEFAULT 0,
  	"adjustments_deduction_amount" numeric DEFAULT 0,
  	"adjustments_adjustment_note" varchar,
  	"total_amount" numeric,
  	"payment_details_payment_date" timestamp(3) with time zone,
  	"payment_details_payment_reference" varchar,
  	"payment_details_payment_notes" varchar,
  	"status" "enum_payroll_status" DEFAULT 'generated',
  	"processed_by_id" integer,
  	"processed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payroll_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"employee_id" integer NOT NULL,
  	"payroll_type" "enum_payroll_settings_payroll_type" DEFAULT 'primary' NOT NULL,
  	"description" varchar,
  	"payment_details_amount" numeric NOT NULL,
  	"payment_details_payment_type" "enum_payroll_settings_payment_details_payment_type" DEFAULT 'bankTransfer' NOT NULL,
  	"payment_details_payment_frequency" "enum_payroll_settings_payment_details_payment_frequency" DEFAULT 'monthly' NOT NULL,
  	"bank_account_account_number" varchar,
  	"bank_account_bank_name" varchar,
  	"bank_account_account_holder_name" varchar,
  	"bank_account_swift_code" varchar,
  	"is_active" boolean DEFAULT true,
  	"effective_date_start_date" timestamp(3) with time zone NOT NULL,
  	"effective_date_end_date" timestamp(3) with time zone,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "additional_payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"employee_id" integer NOT NULL,
  	"category" "enum_additional_payments_category" NOT NULL,
  	"description" varchar NOT NULL,
  	"amount" numeric NOT NULL,
  	"payment_type" "enum_additional_payments_payment_type" DEFAULT 'bankTransfer' NOT NULL,
  	"period_month" "enum_additional_payments_period_month" NOT NULL,
  	"period_year" numeric DEFAULT 2025 NOT NULL,
  	"payment_date" timestamp(3) with time zone,
  	"status" "enum_additional_payments_status" DEFAULT 'generated' NOT NULL,
  	"notes" varchar,
  	"processed_by_id" integer,
  	"processed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"level" "enum_roles_level" DEFAULT 'employee' NOT NULL,
  	"description" varchar,
  	"permissions_users_view_all" boolean DEFAULT false,
  	"permissions_users_view_department" boolean DEFAULT false,
  	"permissions_users_create" boolean DEFAULT false,
  	"permissions_users_edit" boolean DEFAULT false,
  	"permissions_users_delete" boolean DEFAULT false,
  	"permissions_payroll_view_all" boolean DEFAULT false,
  	"permissions_payroll_view_department" boolean DEFAULT false,
  	"permissions_payroll_view_own" boolean DEFAULT true,
  	"permissions_payroll_create" boolean DEFAULT false,
  	"permissions_payroll_edit" boolean DEFAULT false,
  	"permissions_payroll_delete" boolean DEFAULT false,
  	"permissions_payroll_manage_settings" boolean DEFAULT false,
  	"permissions_leaves_view_all" boolean DEFAULT false,
  	"permissions_leaves_view_department" boolean DEFAULT false,
  	"permissions_leaves_view_own" boolean DEFAULT true,
  	"permissions_leaves_create" boolean DEFAULT true,
  	"permissions_leaves_approve" boolean DEFAULT false,
  	"permissions_leaves_delete" boolean DEFAULT false,
  	"permissions_inventory_view_all" boolean DEFAULT false,
  	"permissions_inventory_view_own" boolean DEFAULT true,
  	"permissions_inventory_create" boolean DEFAULT false,
  	"permissions_inventory_edit" boolean DEFAULT false,
  	"permissions_inventory_assign" boolean DEFAULT false,
  	"permissions_inventory_delete" boolean DEFAULT false,
  	"permissions_departments_view" boolean DEFAULT false,
  	"permissions_departments_create" boolean DEFAULT false,
  	"permissions_departments_edit" boolean DEFAULT false,
  	"permissions_departments_delete" boolean DEFAULT false,
  	"permissions_system_manage_roles" boolean DEFAULT false,
  	"permissions_system_view_reports" boolean DEFAULT false,
  	"permissions_system_system_settings" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "departments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"category" "enum_departments_category" NOT NULL,
  	"functional_type" "enum_departments_functional_type",
  	"language_code" "enum_departments_language_code",
  	"description" varchar,
  	"manager_id" integer,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"inventory_id" integer,
  	"leave_days_id" integer,
  	"payroll_id" integer,
  	"payroll_settings_id" integer,
  	"additional_payments_id" integer,
  	"roles_id" integer,
  	"departments_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inventory" ADD CONSTRAINT "inventory_holder_id_users_id_fk" FOREIGN KEY ("holder_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inventory_rels" ADD CONSTRAINT "inventory_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inventory_rels" ADD CONSTRAINT "inventory_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leave_days" ADD CONSTRAINT "leave_days_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payroll_payroll_items" ADD CONSTRAINT "payroll_payroll_items_payroll_setting_id_payroll_settings_id_fk" FOREIGN KEY ("payroll_setting_id") REFERENCES "public"."payroll_settings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payroll_payroll_items" ADD CONSTRAINT "payroll_payroll_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payroll"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payroll" ADD CONSTRAINT "payroll_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payroll" ADD CONSTRAINT "payroll_processed_by_id_users_id_fk" FOREIGN KEY ("processed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payroll_settings" ADD CONSTRAINT "payroll_settings_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "additional_payments" ADD CONSTRAINT "additional_payments_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "additional_payments" ADD CONSTRAINT "additional_payments_processed_by_id_users_id_fk" FOREIGN KEY ("processed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departments" ADD CONSTRAINT "departments_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inventory_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leave_days_fk" FOREIGN KEY ("leave_days_id") REFERENCES "public"."leave_days"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payroll_fk" FOREIGN KEY ("payroll_id") REFERENCES "public"."payroll"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payroll_settings_fk" FOREIGN KEY ("payroll_settings_id") REFERENCES "public"."payroll_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_additional_payments_fk" FOREIGN KEY ("additional_payments_id") REFERENCES "public"."additional_payments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_photo_idx" ON "users" USING btree ("photo_id");
  CREATE INDEX "users_role_idx" ON "users" USING btree ("role_id");
  CREATE UNIQUE INDEX "users_secondary_email_idx" ON "users" USING btree ("secondary_email");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_departments_id_idx" ON "users_rels" USING btree ("departments_id");
  CREATE INDEX "users_rels_media_id_idx" ON "users_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "inventory_serial_number_idx" ON "inventory" USING btree ("serial_number");
  CREATE INDEX "inventory_holder_idx" ON "inventory" USING btree ("holder_id");
  CREATE INDEX "inventory_updated_at_idx" ON "inventory" USING btree ("updated_at");
  CREATE INDEX "inventory_created_at_idx" ON "inventory" USING btree ("created_at");
  CREATE INDEX "inventory_rels_order_idx" ON "inventory_rels" USING btree ("order");
  CREATE INDEX "inventory_rels_parent_idx" ON "inventory_rels" USING btree ("parent_id");
  CREATE INDEX "inventory_rels_path_idx" ON "inventory_rels" USING btree ("path");
  CREATE INDEX "inventory_rels_media_id_idx" ON "inventory_rels" USING btree ("media_id");
  CREATE INDEX "leave_days_user_idx" ON "leave_days" USING btree ("user_id");
  CREATE INDEX "leave_days_updated_at_idx" ON "leave_days" USING btree ("updated_at");
  CREATE INDEX "leave_days_created_at_idx" ON "leave_days" USING btree ("created_at");
  CREATE INDEX "payroll_payroll_items_order_idx" ON "payroll_payroll_items" USING btree ("_order");
  CREATE INDEX "payroll_payroll_items_parent_id_idx" ON "payroll_payroll_items" USING btree ("_parent_id");
  CREATE INDEX "payroll_payroll_items_payroll_setting_idx" ON "payroll_payroll_items" USING btree ("payroll_setting_id");
  CREATE INDEX "payroll_employee_idx" ON "payroll" USING btree ("employee_id");
  CREATE INDEX "payroll_processed_by_idx" ON "payroll" USING btree ("processed_by_id");
  CREATE INDEX "payroll_updated_at_idx" ON "payroll" USING btree ("updated_at");
  CREATE INDEX "payroll_created_at_idx" ON "payroll" USING btree ("created_at");
  CREATE INDEX "payroll_settings_employee_idx" ON "payroll_settings" USING btree ("employee_id");
  CREATE INDEX "payroll_settings_updated_at_idx" ON "payroll_settings" USING btree ("updated_at");
  CREATE INDEX "payroll_settings_created_at_idx" ON "payroll_settings" USING btree ("created_at");
  CREATE INDEX "additional_payments_employee_idx" ON "additional_payments" USING btree ("employee_id");
  CREATE INDEX "additional_payments_processed_by_idx" ON "additional_payments" USING btree ("processed_by_id");
  CREATE INDEX "additional_payments_updated_at_idx" ON "additional_payments" USING btree ("updated_at");
  CREATE INDEX "additional_payments_created_at_idx" ON "additional_payments" USING btree ("created_at");
  CREATE UNIQUE INDEX "roles_name_idx" ON "roles" USING btree ("name");
  CREATE INDEX "roles_updated_at_idx" ON "roles" USING btree ("updated_at");
  CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");
  CREATE UNIQUE INDEX "departments_name_idx" ON "departments" USING btree ("name");
  CREATE INDEX "departments_manager_idx" ON "departments" USING btree ("manager_id");
  CREATE INDEX "departments_updated_at_idx" ON "departments" USING btree ("updated_at");
  CREATE INDEX "departments_created_at_idx" ON "departments" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_inventory_id_idx" ON "payload_locked_documents_rels" USING btree ("inventory_id");
  CREATE INDEX "payload_locked_documents_rels_leave_days_id_idx" ON "payload_locked_documents_rels" USING btree ("leave_days_id");
  CREATE INDEX "payload_locked_documents_rels_payroll_id_idx" ON "payload_locked_documents_rels" USING btree ("payroll_id");
  CREATE INDEX "payload_locked_documents_rels_payroll_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("payroll_settings_id");
  CREATE INDEX "payload_locked_documents_rels_additional_payments_id_idx" ON "payload_locked_documents_rels" USING btree ("additional_payments_id");
  CREATE INDEX "payload_locked_documents_rels_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("roles_id");
  CREATE INDEX "payload_locked_documents_rels_departments_id_idx" ON "payload_locked_documents_rels" USING btree ("departments_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "inventory" CASCADE;
  DROP TABLE "inventory_rels" CASCADE;
  DROP TABLE "leave_days" CASCADE;
  DROP TABLE "payroll_payroll_items" CASCADE;
  DROP TABLE "payroll" CASCADE;
  DROP TABLE "payroll_settings" CASCADE;
  DROP TABLE "additional_payments" CASCADE;
  DROP TABLE "roles" CASCADE;
  DROP TABLE "departments" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_employment_type";
  DROP TYPE "public"."enum_inventory_item_type";
  DROP TYPE "public"."enum_inventory_status";
  DROP TYPE "public"."enum_leave_days_type";
  DROP TYPE "public"."enum_leave_days_status";
  DROP TYPE "public"."enum_payroll_payroll_items_payroll_type";
  DROP TYPE "public"."enum_payroll_payroll_items_payment_type";
  DROP TYPE "public"."enum_payroll_period_month";
  DROP TYPE "public"."enum_payroll_status";
  DROP TYPE "public"."enum_payroll_settings_payroll_type";
  DROP TYPE "public"."enum_payroll_settings_payment_details_payment_type";
  DROP TYPE "public"."enum_payroll_settings_payment_details_payment_frequency";
  DROP TYPE "public"."enum_additional_payments_category";
  DROP TYPE "public"."enum_additional_payments_payment_type";
  DROP TYPE "public"."enum_additional_payments_period_month";
  DROP TYPE "public"."enum_additional_payments_status";
  DROP TYPE "public"."enum_roles_level";
  DROP TYPE "public"."enum_departments_category";
  DROP TYPE "public"."enum_departments_functional_type";
  DROP TYPE "public"."enum_departments_language_code";`)
}
