/**
 * Social Account Service
 *
 * Handles storage and retrieval of social media account connections
 * with encrypted token storage
 */

import { db } from '@mpcas2/db';
import { Prisma } from '@prisma/client';
import { getTenantSchemaName } from './tenant.service.js';
import { encrypt, decrypt } from './encryption.service.js';

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: string;
  platform_user_id: string;
  username: string | null;
  display_name: string | null;
  access_token: string; // Encrypted
  refresh_token: string | null; // Encrypted
  token_expires_at: Date | null;
  scopes: string[] | null;
  metadata: Record<string, unknown> | null;
  label: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSocialAccountInput {
  userId: string;
  platform: string;
  platformUserId: string;
  username?: string;
  displayName?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  scopes?: string[];
  metadata?: Record<string, unknown>;
  label?: string;
}

/**
 * Ensure social_accounts table exists with label column
 */
async function ensureSocialAccountsTable(tenantId: string): Promise<void> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS social_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      platform VARCHAR(50) NOT NULL,
      platform_user_id VARCHAR(255) NOT NULL,
      username VARCHAR(255),
      display_name VARCHAR(255),
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      token_expires_at TIMESTAMP(3),
      scopes TEXT[],
      metadata JSONB DEFAULT '{}',
      label VARCHAR(255),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, platform, platform_user_id)
    );

    CREATE INDEX IF NOT EXISTS social_accounts_user_id_idx ON social_accounts(user_id);
    CREATE INDEX IF NOT EXISTS social_accounts_platform_idx ON social_accounts(platform);
    CREATE INDEX IF NOT EXISTS social_accounts_active_idx ON social_accounts(is_active);

    -- Add label column if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = '${schemaName}' 
                     AND table_name = 'social_accounts' 
                     AND column_name = 'label') THEN
        ALTER TABLE social_accounts ADD COLUMN label VARCHAR(255);
      END IF;
    END $$;
  `);
}

/**
 * Create or update social account with encrypted tokens
 */
export async function saveSocialAccount(
  tenantId: string,
  input: CreateSocialAccountInput
): Promise<SocialAccount> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  await ensureSocialAccountsTable(tenantId);

  // Encrypt tokens before storage
  const encryptedAccessToken = encrypt(input.accessToken);
  const encryptedRefreshToken = input.refreshToken ? encrypt(input.refreshToken) : null;

  // Check if account already exists
  const existing = await db.query<SocialAccount>(
    Prisma.sql`
      SELECT * FROM social_accounts
      WHERE user_id = ${input.userId}::uuid
        AND platform = ${input.platform}
        AND platform_user_id = ${input.platformUserId}
    `
  );

  if (existing.length > 0) {
    // Update existing account
    const tokenExpiresAtValue = input.tokenExpiresAt
      ? Prisma.raw(`'${input.tokenExpiresAt.toISOString()}'::timestamp`)
      : Prisma.raw('NULL');
    const scopesValue = input.scopes
      ? Prisma.raw(
          `ARRAY[${input.scopes.map((s) => `'${s.replace(/'/g, "''")}'`).join(',')}]::TEXT[]`
        )
      : Prisma.raw('NULL');
    const metadataValue = input.metadata
      ? Prisma.raw(`'${JSON.stringify(input.metadata).replace(/'/g, "''")}'::jsonb`)
      : Prisma.raw('NULL');

    const updated = await db.query<SocialAccount>(
      Prisma.sql`
        UPDATE social_accounts
        SET 
          username = COALESCE(${input.username || null}, username),
          display_name = COALESCE(${input.displayName || null}, display_name),
          access_token = ${encryptedAccessToken},
          refresh_token = COALESCE(${encryptedRefreshToken || null}, refresh_token),
          token_expires_at = COALESCE(${tokenExpiresAtValue}, token_expires_at),
          scopes = COALESCE(${scopesValue}, scopes),
          metadata = COALESCE(${metadataValue}, metadata),
          label = COALESCE(${input.label || null}, label),
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}::uuid
        RETURNING *
      `
    );
    return updated[0];
  }

  // Create new account
  const tokenExpiresAtValue = input.tokenExpiresAt
    ? Prisma.raw(`'${input.tokenExpiresAt.toISOString()}'::timestamp`)
    : Prisma.raw('NULL');
  const scopesValue = input.scopes
    ? Prisma.raw(
        `ARRAY[${input.scopes.map((s) => `'${s.replace(/'/g, "''")}'`).join(',')}]::TEXT[]`
      )
    : Prisma.raw('NULL');
  const metadataValue = input.metadata
    ? Prisma.raw(`'${JSON.stringify(input.metadata).replace(/'/g, "''")}'::jsonb`)
    : Prisma.raw('NULL');

  const created = await db.query<SocialAccount>(
    Prisma.sql`
      INSERT INTO social_accounts (
        user_id, platform, platform_user_id, username, display_name,
        access_token, refresh_token, token_expires_at, scopes, metadata, label
      )
      VALUES (
        ${input.userId}::uuid,
        ${input.platform},
        ${input.platformUserId},
        ${input.username || null},
        ${input.displayName || null},
        ${encryptedAccessToken},
        ${encryptedRefreshToken || null},
        ${tokenExpiresAtValue},
        ${scopesValue},
        ${metadataValue},
        ${input.label || null}
      )
      RETURNING *
    `
  );

  return created[0];
}

/**
 * Get social account by ID with decrypted tokens
 */
export async function getSocialAccountById(
  tenantId: string,
  accountId: string
): Promise<
  (SocialAccount & { decryptedAccessToken: string; decryptedRefreshToken: string | null }) | null
> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  const accounts = await db.query<SocialAccount>(
    Prisma.sql`SELECT * FROM social_accounts WHERE id = ${accountId}::uuid AND is_active = true`
  );

  if (accounts.length === 0) {
    return null;
  }

  const account = accounts[0];

  // Decrypt tokens
  try {
    const decryptedAccessToken = decrypt(account.access_token);
    const decryptedRefreshToken = account.refresh_token ? decrypt(account.refresh_token) : null;

    return {
      ...account,
      decryptedAccessToken,
      decryptedRefreshToken,
    };
  } catch (error) {
    console.error('Failed to decrypt tokens:', error);
    return null;
  }
}

/**
 * Get all social accounts for a user (without decrypted tokens for security)
 */
export async function getUserSocialAccounts(
  tenantId: string,
  userId: string,
  platform?: string
): Promise<Omit<SocialAccount, 'access_token' | 'refresh_token'>[]> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  let query: Prisma.Sql;
  if (platform) {
    query = Prisma.sql`
      SELECT id, user_id, platform, platform_user_id, username, display_name,
             token_expires_at, scopes, metadata, label, is_active, created_at, updated_at
      FROM social_accounts
      WHERE user_id = ${userId}::uuid
        AND platform = ${platform}
        AND is_active = true
      ORDER BY created_at DESC
    `;
  } else {
    query = Prisma.sql`
      SELECT id, user_id, platform, platform_user_id, username, display_name,
             token_expires_at, scopes, metadata, label, is_active, created_at, updated_at
      FROM social_accounts
      WHERE user_id = ${userId}::uuid
        AND is_active = true
      ORDER BY created_at DESC
    `;
  }

  return db.query<Omit<SocialAccount, 'access_token' | 'refresh_token'>>(query);
}

/**
 * Delete social account connection
 */
export async function deleteSocialAccount(tenantId: string, accountId: string): Promise<boolean> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  const result = await db.execute(
    Prisma.sql`
      DELETE FROM social_accounts
      WHERE id = ${accountId}::uuid
    `
  );

  return result > 0;
}

/**
 * Update social account label
 */
export async function updateSocialAccountLabel(
  tenantId: string,
  accountId: string,
  label: string
): Promise<SocialAccount | null> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  const updated = await db.query<SocialAccount>(
    Prisma.sql`
      UPDATE social_accounts
      SET label = ${label}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${accountId}::uuid
      RETURNING *
    `
  );

  return updated[0] || null;
}

/**
 * Count social accounts for a user by platform
 */
export async function countUserSocialAccounts(
  tenantId: string,
  userId: string,
  platform: string
): Promise<number> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  const result = await db.query<{ count: string }>(
    Prisma.sql`
      SELECT COUNT(*)::text as count
      FROM social_accounts
      WHERE user_id = ${userId}::uuid
        AND platform = ${platform}
        AND is_active = true
    `
  );

  return parseInt(result[0]?.count || '0', 10);
}
