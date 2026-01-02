import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_applicants_education_level" AS ENUM('high-school', 'associate', 'bachelor', 'master', 'phd', 'other');
  CREATE TYPE "public"."enum_applicants_current_employment_status" AS ENUM('employed', 'unemployed', 'notice-period', 'student');
  CREATE TYPE "public"."enum_applicants_source" AS ENUM('website', 'linkedin', 'referral', 'job-board', 'other');
  CREATE TYPE "public"."enum_applicants_status" AS ENUM('new', 'under-review', 'shortlisted', 'interview-scheduled', 'rejected', 'hired');
  CREATE TABLE "applicants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"linked_in_url" varchar,
  	"portfolio_url" varchar,
  	"position_applied_for" varchar NOT NULL,
  	"years_of_experience" numeric NOT NULL,
  	"education_level" "enum_applicants_education_level" NOT NULL,
  	"current_employment_status" "enum_applicants_current_employment_status" DEFAULT 'unemployed' NOT NULL,
  	"expected_salary" numeric,
  	"availability_date" timestamp(3) with time zone,
  	"source" "enum_applicants_source",
  	"bio" varchar NOT NULL,
  	"cv_id" integer NOT NULL,
  	"status" "enum_applicants_status" DEFAULT 'new' NOT NULL,
  	"application_date" timestamp(3) with time zone NOT NULL,
  	"internal_notes" jsonb,
  	"consent_to_data_storage" boolean DEFAULT false NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "applicants_id" integer;
  ALTER TABLE "applicants" ADD CONSTRAINT "applicants_cv_id_media_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "applicants_email_idx" ON "applicants" USING btree ("email");
  CREATE INDEX "applicants_cv_idx" ON "applicants" USING btree ("cv_id");
  CREATE INDEX "applicants_updated_at_idx" ON "applicants" USING btree ("updated_at");
  CREATE INDEX "applicants_created_at_idx" ON "applicants" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_applicants_fk" FOREIGN KEY ("applicants_id") REFERENCES "public"."applicants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_applicants_id_idx" ON "payload_locked_documents_rels" USING btree ("applicants_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "applicants" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "applicants" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_applicants_fk";
  
  DROP INDEX "payload_locked_documents_rels_applicants_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "applicants_id";
  DROP TYPE "public"."enum_applicants_education_level";
  DROP TYPE "public"."enum_applicants_current_employment_status";
  DROP TYPE "public"."enum_applicants_source";
  DROP TYPE "public"."enum_applicants_status";`)
}
