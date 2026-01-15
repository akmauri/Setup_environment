# Migration Rollback Guide

**Version**: 1.0  
**Date**: 2026-01-15  
**Purpose**: Document migration rollback procedures for Prisma migrations

## Overview

Prisma migrations support rollback through manual SQL or by creating new migrations. This guide documents the rollback procedures for both public schema and tenant schema migrations.

## Prisma Migration Rollback

### Check Migration Status

```bash
cd packages/db
npm run db:migrate:status
```

### Rollback Last Migration (Manual)

Prisma doesn't have built-in rollback, but you can:

1. **Create a new migration that reverses changes**:

   ```bash
   npm run db:migrate:create rollback_previous_migration
   ```

2. **Manually edit the migration file** to reverse changes

3. **Apply the rollback migration**:
   ```bash
   npm run db:migrate:deploy
   ```

### Rollback Public Schema Migration

**Example: Rollback shared_data tables**

```sql
-- Create rollback migration: 20260115000001_rollback_shared_data.sql
DROP TRIGGER IF EXISTS update_platforms_updated_at ON public.platforms;
DROP TRIGGER IF EXISTS update_timezones_updated_at ON public.timezones;
DROP TRIGGER IF EXISTS update_countries_updated_at ON public.countries;

DROP TABLE IF EXISTS public.platforms;
DROP TABLE IF EXISTS public.timezones;
DROP TABLE IF EXISTS public.countries;

DROP FUNCTION IF EXISTS public.update_updated_at_column();
```

### Rollback Tenant Schema Migration

**For tenant schemas**, rollback requires:

1. **Identify affected tenants**:

   ```sql
   SELECT schema_name
   FROM information_schema.schemata
   WHERE schema_name LIKE 'tenant_%';
   ```

2. **Apply rollback to each tenant schema**:

   ```sql
   -- For each tenant
   SET search_path TO tenant_{id}, public;

   -- Drop tables in reverse order (respecting foreign keys)
   DROP TABLE IF EXISTS notifications CASCADE;
   DROP TABLE IF EXISTS comments CASCADE;
   DROP TABLE IF EXISTS team_members CASCADE;
   DROP TABLE IF EXISTS teams CASCADE;
   DROP TABLE IF EXISTS analytics CASCADE;
   DROP TABLE IF EXISTS publish_jobs CASCADE;
   DROP TABLE IF EXISTS workflows CASCADE;
   DROP TABLE IF EXISTS social_accounts CASCADE;
   DROP TABLE IF EXISTS content CASCADE;
   -- Keep users table (required)
   ```

## Testing Rollback

### Test Procedure

1. **Create test tenant**:

   ```typescript
   const tenant = await createTenant({ name: 'Test Tenant' });
   ```

2. **Verify schema exists**:

   ```typescript
   const exists = await tenantSchemaExists(tenant.id);
   ```

3. **Apply migration**:

   ```typescript
   await applyTenantSchemaMigration(tenant.id);
   ```

4. **Verify tables created**:

   ```sql
   SET search_path TO tenant_{id}, public;
   \dt  -- List tables
   ```

5. **Rollback migration**:

   ```sql
   -- Apply rollback SQL
   ```

6. **Verify rollback successful**:
   ```sql
   \dt  -- Should show fewer tables
   ```

## Automated Rollback Function

```typescript
/**
 * Rollback tenant schema to previous state
 * WARNING: This will delete all data in tenant schema
 */
export async function rollbackTenantSchema(
  tenantId: string,
  targetMigration?: string
): Promise<void> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  // Rollback in reverse order (respecting foreign keys)
  const rollbackSQL = `
    DROP TABLE IF EXISTS notifications CASCADE;
    DROP TABLE IF EXISTS comments CASCADE;
    DROP TABLE IF EXISTS team_members CASCADE;
    DROP TABLE IF EXISTS teams CASCADE;
    DROP TABLE IF EXISTS analytics CASCADE;
    DROP TABLE IF EXISTS publish_jobs CASCADE;
    DROP TABLE IF EXISTS workflows CASCADE;
    DROP TABLE IF EXISTS social_accounts CASCADE;
    DROP TABLE IF EXISTS content CASCADE;
    -- Users table kept (required for authentication)
  `;

  await db.execute(rollbackSQL);
}
```

## Best Practices

1. **Always test rollback** before applying to production
2. **Backup before rollback** - rollback may delete data
3. **Document rollback steps** in migration files
4. **Use transactions** when possible for atomic rollback
5. **Version control** - keep rollback migrations in version control

## Production Rollback Procedure

1. **Stop application** (prevent new writes)
2. **Backup database** (full backup before rollback)
3. **Test rollback** on staging environment first
4. **Apply rollback migration** to production
5. **Verify rollback** successful
6. **Restart application**
7. **Monitor** for issues

## Migration History

Track migration history in `public.migrations` table:

```sql
SELECT * FROM public.migrations ORDER BY applied_at DESC;
```

## Rollback Checklist

- [ ] Backup database
- [ ] Test rollback on staging
- [ ] Document rollback steps
- [ ] Create rollback migration file
- [ ] Apply rollback migration
- [ ] Verify rollback successful
- [ ] Update migration history
- [ ] Test application functionality
