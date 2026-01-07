# Implementation Checklist

## ✅ Completed Tasks

### 1. Database Schema Updates

- [x] Updated `users` table - all timestamp → text with ISO format
- [x] Updated `departments` table - createdAt, updatedAt
- [x] Updated `user_departments` table - createdAt
- [x] Updated `accounts` table - expires_at
- [x] Updated `sessions` table - expires
- [x] Updated `verification_tokens` table - expires
- [x] Updated `applicants` table - availabilityDate, applicationDate, createdAt, updatedAt
- [x] Updated `inventory` table - purchaseDate, warrantyExpiry, createdAt, updatedAt
- [x] Updated `leave_days` table - startDate, endDate, createdAt, updatedAt
- [x] Updated `media` table - createdAt, updatedAt
- [x] Updated `payroll_settings` table - startDate, endDate, createdAt, updatedAt
- [x] Updated `payroll` table - paymentDate, processedAt, createdAt, updatedAt
- [x] Updated `roles` table - createdAt, updatedAt

### 2. Migration

- [x] Generated migration file: `drizzle/0000_eager_krista_starr.sql`
- [ ] **TODO:** Apply migration to database (run `pnpm drizzle-kit migrate`)

### 3. Component Updates

- [x] Removed `SerializableUser` type from `user-form.tsx`
- [x] Simplified date transformations in `user-form.tsx`
- [x] Removed unused `formatDateForInput` import
- [x] Updated `User` type in `user-form.tsx`
- [x] Updated `User` type in `user-list.tsx`
- [x] Updated `User` type in `profile-card.tsx`
- [x] Updated `User` type in `table.tsx`
- [x] Updated `Department` type in `departments/page.tsx`
- [x] Updated `Department` type in `department-list.tsx`
- [x] Updated `Department` type in `department-form.tsx`

### 4. Page Updates

- [x] Removed serialization in `users/[id]/edit/page.tsx`
- [x] Verified `users/page.tsx` - already working correctly
- [x] Verified `users/[id]/page.tsx` - already working correctly
- [x] Verified `users/new/page.tsx` - already using `toISOString()`

### 5. Utility Updates

- [x] Simplified `formatDate` function in `date-utils.ts`
- [x] Simplified `formatDateForInput` function in `date-utils.ts`
- [x] Updated `parseDate` function signature
- [x] Updated `isPastDate` function signature
- [x] Updated `isFutureDate` function signature

### 6. Verification

- [x] No TypeScript errors
- [x] All type definitions updated
- [x] Code reduction: ~85 lines removed

---

## 🔄 Next Steps (To Complete Implementation)

### 1. Apply Database Migration

```bash
# 1. Backup database first
pg_dump team_track > backup_$(date +%Y%m%d).sql

# 2. Apply migration
pnpm drizzle-kit migrate

# 3. Verify migration
psql team_track -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('birth_date', 'joined_at', 'created_at');"
```

### 2. Test User Flows

- [ ] Create new user
- [ ] Edit existing user
- [ ] View user profile
- [ ] Verify dates display correctly
- [ ] Test form validation
- [ ] Test date pickers

### 3. Test Other Features

- [ ] Department management (create/edit)
- [ ] Applicant forms
- [ ] Inventory management
- [ ] Leave requests
- [ ] Payroll generation

### 4. Seed Data (If Needed)

If you need to regenerate seed data with correct ISO strings:

```bash
pnpm seed
```

---

## 📊 Impact Summary

### Code Changes

- **13 schema files** updated (all tables)
- **7 component files** updated (type definitions)
- **1 page file** updated (removed serialization)
- **1 utility file** simplified (date-utils.ts)

### Lines of Code

- **Removed:** ~85 lines of boilerplate
- **Modified:** ~150 lines for type updates
- **Net reduction:** Cleaner, simpler codebase

### Type Safety

- ✅ All TypeScript errors resolved
- ✅ Consistent types throughout application
- ✅ No more Date vs string confusion

---

## 🚨 Important Notes

### Breaking Changes

This refactoring changes the database schema. The migration will:

- Convert all `timestamp` columns to `text`
- Preserve existing data by casting to ISO strings
- Update default value functions to use `new Date().toISOString()`

### Rollback Plan

If you need to rollback:

1. Restore from database backup
2. Revert all schema files to use `timestamp`
3. Regenerate migration with `pnpm drizzle-kit generate`

### Production Deployment

Before deploying to production:

1. Test thoroughly in development
2. Run migration in staging environment first
3. Verify all date displays are correct
4. Check form submissions work properly
5. Test date calculations (age, leave days, etc.)

---

## 🎯 Expected Results

### Before

```typescript
// Complex serialization everywhere
const serializableUser = {
  ...user,
  birthDate: user.birthDate?.toISOString(),
  joinedAt: user.joinedAt?.toISOString(),
  // ... 4+ more conversions
}
<UserForm initialData={serializableUser} />
```

### After

```typescript
// Simple and direct
<UserForm initialData={user} />
```

### Benefits

- ✅ Zero serialization overhead
- ✅ Cleaner, more maintainable code
- ✅ Fewer opportunities for bugs
- ✅ Better developer experience
- ✅ Works naturally with RSC

---

## 📝 Testing Checklist

### Manual Testing

- [ ] Open users page - verify list loads
- [ ] Click "Add User" - verify form opens
- [ ] Fill in all fields including dates
- [ ] Submit form - verify user created
- [ ] Edit user - verify dates populate correctly
- [ ] Save changes - verify updates work
- [ ] View user profile - verify dates display properly

### Date-Specific Tests

- [ ] Birth date: Pick date from calendar
- [ ] Joined date: Verify defaults to today for new users
- [ ] Work permit expiry: Test optional date field
- [ ] Verify date format in form inputs (YYYY-MM-DD)
- [ ] Verify date display in profile (Month DD, YYYY)

### Edge Cases

- [ ] Empty/null dates handled correctly
- [ ] Invalid dates rejected by validation
- [ ] Timezone handling (ISO strings preserve timezone)
- [ ] Date calculations still work (age, leave days)

---

## 🐛 Common Issues & Solutions

### Issue: Migration fails

**Solution:** Check database connection, ensure you have ALTER permissions

### Issue: Dates show as "[object Object]"

**Solution:** Verify component is using `string` type, not `Date`

### Issue: Date picker not working

**Solution:** Ensure value is in YYYY-MM-DD format (use `.split('T')[0]`)

### Issue: Form validation fails

**Solution:** Zod schema already expects strings, should work fine

---

## 📚 Reference

### Date Format Standards

- **Database:** ISO 8601 full format: `2024-01-07T15:30:00.000Z`
- **Date-only fields:** ISO 8601 date: `2024-01-07`
- **Form inputs:** HTML5 date format: `YYYY-MM-DD`
- **Display:** Localized format: `January 7, 2024`

### Conversion Functions

```typescript
// ISO string → Display
new Date(isoString).toLocaleDateString()
// or
formatDate(isoString)

// ISO string → Form input
isoString.split('T')[0]

// Current date → ISO
new Date().toISOString()

// Form input → ISO (for storage)
formData.get('birthDate') // Already in YYYY-MM-DD format
```

---

## ✅ Ready to Deploy

Once you've:

1. Applied the migration
2. Tested all user flows
3. Verified dates work correctly
4. No errors in console

Then this refactoring is complete! 🎉
