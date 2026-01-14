# Drizzle ORM Database Guide

A comprehensive guide for working with Drizzle ORM in the TeamTrack project.

## Table of Contents

- [What is Drizzle?](#what-is-drizzle)
- [Available Commands](#available-commands)
- [Common Workflows](#common-workflows)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)

---

## What is Drizzle?

Drizzle ORM is a TypeScript-first ORM (Object-Relational Mapping) tool that provides:

- **Type Safety**: Full TypeScript support with auto-completion
- **Schema Definition**: Define your database schema in TypeScript
- **Query Builder**: Write SQL-like queries in TypeScript
- **Migration Management**: Track and apply database changes

---

## Available Commands

### 1. `pnpm db:push`

**What it does**: Pushes your schema changes directly to the database without creating migration files.

```bash
pnpm db:push
```

**When to use**:

- ✅ During initial development
- ✅ When you need quick schema changes
- ✅ In development environment
- ✅ **First time setup** (like we just did)

**When NOT to use**:

- ❌ In production
- ❌ When you need version control of schema changes
- ❌ When working in a team (use migrations instead)

**What happened when we ran it**:

- Read the schema from `drizzle/schema.ts`
- Connected to your PostgreSQL database
- Created all tables (roles, users, departments, payroll, inventory, etc.)
- Applied constraints and relationships

---

### 2. `pnpm db:studio`

**What it does**: Opens Drizzle Studio - a visual database browser in your web browser.

```bash
pnpm db:studio
```

**Features**:

- View all your tables and data
- Edit records directly
- Execute queries
- Browse relationships
- Usually opens at `https://local.drizzle.studio`

**Great for**:

- 👁️ Inspecting data
- 🔍 Debugging issues
- ✏️ Quick manual edits
- 📊 Understanding table relationships

---

### 3. `pnpm seed`

**What it does**: Populates your database with sample/initial data.

```bash
pnpm seed
```

**What it created in your database**:

- Default roles (Admin, Manager, Employee, etc.)
- Departments (Engineering, HR, Finance, etc.)
- 21 Marvel character users
- Payroll settings for each user
- Inventory items (laptops, phones, SIM cards)
- Leave records
- Sample payroll history

**When to use**:

- ✅ After fresh database setup
- ✅ For development/testing
- ✅ To reset to initial state
- ⚠️ Be careful: May duplicate data if run multiple times

---

## Common Workflows

### 🚀 First Time Setup

```bash
# 1. Make sure your .env file has correct DATABASE_URL
# 2. Push schema to create tables
pnpm db:push

# 3. Seed with sample data
pnpm seed

# 4. (Optional) Open Studio to view data
pnpm db:studio
```

---

### 🔄 After Schema Changes

**Scenario**: You modified files in `src/db/schema/` or `drizzle/schema.ts`

**Option A - Quick Push (Development)**:

```bash
pnpm db:push
```

**Option B - Proper Migrations (Recommended for Production)**:

```bash
# Generate migration file
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate
```

---

### 🧹 Reset Database

**Warning**: This will delete ALL data!

```bash
# Option 1: Drop and recreate (if you have access)
# Then:
pnpm db:push
pnpm seed

# Option 2: Use Drizzle Studio to manually delete records
pnpm db:studio
```

---

## Database Schema

### Where is the schema defined?

Your database schema is defined in TypeScript files:

**Main Schema File**:

- `src/db/schema.ts` - Main exports
- `src/db/schema/` - Individual table definitions

**Drizzle Files** (auto-generated):

- `drizzle/schema.ts` - Generated schema
- `drizzle/relations.ts` - Table relationships
- `drizzle/0000_*.sql` - Migration files

---

### Key Tables in Your Project

```typescript
// Users & Authentication
- users: User accounts
- accounts: OAuth accounts
- sessions: User sessions
- roles: User roles (Admin, Employee, etc.)

// Organization
- departments: Company departments
- teams: Teams within departments

// Payroll
- payroll_settings: Salary configurations
- payroll: Monthly payroll records

// Leave Management
- leaves: Leave requests and approvals

// Inventory
- inventory: Company assets (laptops, phones, etc.)

// Applications
- applications: Job applications
```

---

### How to View Schema

```typescript
// In code: src/db/schema.ts
import { users, departments, payroll } from '@/db/schema';

// In database: Use Drizzle Studio
pnpm db:studio
```

---

## Troubleshooting

### ❌ Error: "relation does not exist"

**Problem**: Database tables haven't been created yet.

**Solution**:

```bash
pnpm db:push
```

---

### ❌ Error: "connection refused" or "database doesn't exist"

**Problem**: Database connection issues.

**Check**:

1. Is PostgreSQL running?

   ```bash
   # If using Docker
   docker ps

   # Check if postgres is in the list
   ```

2. Is DATABASE_URL correct in `.env`?

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

3. Does the database exist?
   ```bash
   # Connect to postgres and create it
   createdb your_database_name
   ```

---

### ❌ Seed fails with duplicate key errors

**Problem**: Running seed multiple times creates duplicates.

**Solutions**:

**Option 1**: Clear specific tables first

```bash
pnpm db:studio
# Manually delete records
```

**Option 2**: Modify seed script to check for existing data

```typescript
// In src/seed/index.ts
const existingRoles = await db.select().from(roles)
if (existingRoles.length === 0) {
  // Only seed if empty
}
```

---

### 🔍 How to inspect what's in my database?

```bash
# Option 1: Drizzle Studio (Recommended)
pnpm db:studio

# Option 2: Direct PostgreSQL
psql $DATABASE_URL
\dt  # List tables
SELECT * FROM users;  # Query data
```

---

## Best Practices

### ✅ DO:

- Run `pnpm db:push` after modifying schema during development
- Use `pnpm db:studio` to inspect data
- Keep your `.env` file secure (never commit it)
- Use TypeScript types from schema for type safety

### ❌ DON'T:

- Don't run `db:push` in production (use migrations)
- Don't modify `drizzle/` folder manually (auto-generated)
- Don't share your DATABASE_URL publicly
- Don't run seed on production database

---

## Quick Reference

| Command                     | Purpose                      | When to Use              |
| --------------------------- | ---------------------------- | ------------------------ |
| `pnpm db:push`              | Apply schema to database     | Development, first setup |
| `pnpm db:studio`            | Open visual database browser | Inspect/edit data        |
| `pnpm seed`                 | Add sample data              | Initial setup, testing   |
| `pnpm drizzle-kit generate` | Create migration files       | Before production deploy |
| `pnpm drizzle-kit migrate`  | Run migrations               | Production updates       |

---

## Additional Resources

- **Drizzle Docs**: https://orm.drizzle.team/docs/overview
- **Your Schema**: `src/db/schema/`
- **Seed Script**: `src/seed/index.ts`
- **Config**: `drizzle.config.ts`

---

## Need Help?

1. Check the error message carefully
2. Verify DATABASE_URL in `.env`
3. Make sure PostgreSQL is running
4. Use `pnpm db:studio` to inspect current state
5. Check Drizzle documentation for specific queries

---

**Happy Database Managing! 🚀**
