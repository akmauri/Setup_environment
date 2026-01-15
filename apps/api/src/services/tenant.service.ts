/**
 * Tenant Service
 *
 * Manages tenant schema creation, deletion, and tenant context resolution
 */

import { prisma, db } from '@mpcas2/db';
import { Tenant, Prisma } from '@prisma/client';

export interface CreateTenantInput {
  name: string;
  subdomain?: string;
  tier?: string;
}

/**
 * Create a new tenant and its isolated schema
 */
export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  const { name, subdomain, tier = 'free' } = input;

  // Create tenant record in public schema
  const tenant = await prisma.tenant.create({
    data: {
      name,
      subdomain,
      tier,
      status: 'active',
      settings: {},
    },
  });

  // Create tenant schema
  await createTenantSchema(tenant.id);

  // Apply user table migration to new tenant schema
  await applyUserTableMigration(tenant.id);

  return tenant;
}

/**
 * Create isolated schema for a tenant
 */
export async function createTenantSchema(tenantId: string): Promise<void> {
  const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

  // Create schema
  await db.execute(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

  // Grant permissions to application user
  await db.execute(`GRANT ALL PRIVILEGES ON SCHEMA ${schemaName} TO mpcas2`);

  // Set default privileges for future tables
  await db.execute(
    `ALTER DEFAULT PRIVILEGES IN SCHEMA ${schemaName} GRANT ALL ON TABLES TO mpcas2`
  );
}

/**
 * Delete tenant schema (GDPR compliance)
 */
export async function deleteTenantSchema(tenantId: string): Promise<void> {
  const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

  // Drop schema and all its contents
  await db.execute(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);

  // Optionally soft delete tenant record
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { status: 'deleted' },
  });
}

/**
 * Get tenant schema name from tenant ID
 */
export function getTenantSchemaName(tenantId: string): string {
  return `tenant_${tenantId.replace(/-/g, '_')}`;
}

/**
 * Check if tenant schema exists
 */
export async function tenantSchemaExists(tenantId: string): Promise<boolean> {
  const schemaName = getTenantSchemaName(tenantId);
  // Schema names are safe - they're generated from UUIDs, but we'll use parameterized query for safety
  const result = await db.query<{ exists: boolean }>(
    Prisma.sql`
      SELECT EXISTS(
        SELECT 1 
        FROM information_schema.schemata 
        WHERE schema_name = ${schemaName}
      ) as exists
    `
  );
  return result[0]?.exists || false;
}

/**
 * Apply user table migration to tenant schema
 */
export async function applyUserTableMigration(tenantId: string): Promise<void> {
  const schemaName = getTenantSchemaName(tenantId);

  // Set search_path to tenant schema
  await db.execute(`SET search_path TO ${schemaName}, public`);

  // Apply user table migration
  const migrationSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255),
      picture VARCHAR(500),
      provider VARCHAR(50) NOT NULL DEFAULT 'google',
      provider_id VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      email_verified BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
    CREATE INDEX IF NOT EXISTS users_provider_id_idx ON users(provider, provider_id);
    CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at);

    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `;

  await db.execute(migrationSQL);
}
