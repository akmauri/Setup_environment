/**
 * User Service
 *
 * Handles user creation and retrieval in tenant schemas
 */

import { db } from '@mpcas2/db';
import { Prisma } from '@prisma/client';
import { getTenantSchemaName } from './tenant.service.js';
import { OAuthUserInfo } from './oauth.service.js';

export interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  provider: string;
  provider_id: string;
  role: string;
  email_verified: boolean;
  timezone: string | null;
  preferences: Record<string, unknown> | null;
  last_login_at: Date | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  name?: string;
  picture?: string;
  provider: string;
  provider_id: string;
  email_verified?: boolean;
  role?: string;
}

/**
 * Create or update user in tenant schema
 */
export async function createOrUpdateUser(
  tenantId: string,
  input: CreateUserInput,
  _oauthTokens?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  }
): Promise<User> {
  const schemaName = getTenantSchemaName(tenantId);

  // Set search_path to tenant schema
  await db.execute(`SET search_path TO ${schemaName}, public`);

  // Check if user exists (parameterized query)
  const existingUsers = await db.query<User>(
    Prisma.sql`
      SELECT * FROM users 
      WHERE email = ${input.email} 
      OR (provider = ${input.provider} AND provider_id = ${input.provider_id})
    `
  );

  if (existingUsers.length > 0) {
    // Update existing user
    const user = existingUsers[0];

    // Update existing user (parameterized query)
    if (
      input.name !== undefined ||
      input.picture !== undefined ||
      input.email_verified !== undefined
    ) {
      const updatedUser = await db.query<User>(
        Prisma.sql`
          UPDATE users 
          SET 
            name = COALESCE(${input.name || null}, name),
            picture = COALESCE(${input.picture || null}, picture),
            email_verified = COALESCE(${input.email_verified ?? null}, email_verified),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${user.id} 
          RETURNING *
        `
      );
      return updatedUser[0];
    }

    return user;
  }

  // Create new user (parameterized query)
  const newUsers = await db.query<User>(
    Prisma.sql`
      INSERT INTO users (email, name, picture, provider, provider_id, role, email_verified)
      VALUES (
        ${input.email},
        ${input.name || null},
        ${input.picture || null},
        ${input.provider},
        ${input.provider_id},
        ${input.role || 'user'},
        ${input.email_verified ?? false}
      )
      RETURNING *
    `
  );

  // TODO: Store OAuth tokens securely (encrypted) in a separate table
  // For now, we'll handle token storage in a future iteration

  return newUsers[0];
}

/**
 * Get user by email from tenant schema
 */
export async function getUserByEmail(tenantId: string, email: string): Promise<User | null> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  const users = await db.query<User>(Prisma.sql`SELECT * FROM users WHERE email = ${email}`);

  return users[0] || null;
}

/**
 * Get user by provider ID from tenant schema
 */
export async function getUserByProviderId(
  tenantId: string,
  provider: string,
  providerId: string
): Promise<User | null> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  const users = await db.query<User>(
    Prisma.sql`SELECT * FROM users WHERE provider = ${provider} AND provider_id = ${providerId}`
  );

  return users[0] || null;
}

/**
 * Get user by ID from tenant schema
 */
export async function getUserById(tenantId: string, userId: string): Promise<User | null> {
  // #region agent log
  try {
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/d5dd91a6-fd8a-4d48-998a-9a4a470e0c9a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'user.service.ts:146',
          message: 'getUserById called',
          data: { tenantId, userId },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'H',
        }),
      }).catch(() => {});
    }
  } catch (e) {
    /* Ignore agent log errors */
  }
  // #endregion
  const schemaName = getTenantSchemaName(tenantId);
  // #region agent log
  try {
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/d5dd91a6-fd8a-4d48-998a-9a4a470e0c9a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'user.service.ts:150',
          message: 'Setting search_path',
          data: { schemaName },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'H',
        }),
      }).catch(() => {});
    }
  } catch (e) {
    /* Ignore agent log errors */
  }
  // #endregion
  await db.execute(`SET search_path TO ${schemaName}, public`);

  // #region agent log
  try {
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/d5dd91a6-fd8a-4d48-998a-9a4a470e0c9a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'user.service.ts:153',
          message: 'Executing query',
          data: {},
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'H',
        }),
      }).catch(() => {});
    }
  } catch (e) {
    /* Ignore agent log errors */
  }
  // #endregion
  const users = await db.query<User>(
    Prisma.sql`SELECT * FROM users WHERE id = ${userId}::uuid AND deleted_at IS NULL`
  );
  // #region agent log
  try {
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/d5dd91a6-fd8a-4d48-998a-9a4a470e0c9a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'user.service.ts:157',
          message: 'Query completed',
          data: { usersFound: users.length },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'H',
        }),
      }).catch(() => {});
    }
  } catch (e) {
    /* Ignore agent log errors */
  }
  // #endregion

  return users[0] || null;
}

/**
 * Update user profile in tenant schema
 */
export interface UpdateUserProfileInput {
  name?: string;
  picture?: string;
  timezone?: string;
  preferences?: Record<string, unknown>;
}

export interface UserPreferences {
  notifications?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  dateFormat?: string;
}

export async function updateUserProfile(
  tenantId: string,
  userId: string,
  input: UpdateUserProfileInput
): Promise<User | null> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  // Check if user exists
  const existingUsers = await db.query<User>(Prisma.sql`SELECT * FROM users WHERE id = ${userId}`);

  if (existingUsers.length === 0) {
    return null;
  }

  // Update user profile (parameterized query)
  const preferencesJson = input.preferences ? JSON.stringify(input.preferences) : null;
  const updatedUsers = await db.query<User>(
    Prisma.sql`
      UPDATE users 
      SET 
        name = COALESCE(${input.name || null}, name),
        picture = COALESCE(${input.picture || null}, picture),
        timezone = COALESCE(${input.timezone || null}, timezone),
        preferences = COALESCE(${preferencesJson ? Prisma.raw(`'${preferencesJson}'::jsonb`) : Prisma.raw('NULL')}, preferences),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}::uuid
        AND deleted_at IS NULL
      RETURNING *
    `
  );

  return updatedUsers[0] || null;
}

/**
 * Handle OAuth user creation/update
 * Creates default tenant if user doesn't have one
 */
export async function handleOAuthUser(
  userInfo: OAuthUserInfo,
  provider: string = 'google',
  oauthTokens?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  }
): Promise<{ user: User; tenantId: string }> {
  // For MVP, create a default tenant per user
  // In production, this would be handled differently (user selects/creates tenant)

  // Check if user exists in any tenant (simplified - in production, use email-based tenant lookup)
  // For now, we'll create a default tenant for the first user
  // This is a simplified approach - production would have proper tenant management

  // Generate a tenant ID from email domain or use a default
  // For MVP, we'll use a simple approach: create tenant if needed

  // TODO: Implement proper tenant resolution logic
  // For now, using a simplified approach - this should be improved
  // In production, users would select/create tenants through proper UI

  // Import tenant service and Prisma
  const { createTenant } = await import('./tenant.service.js');
  const { prisma } = await import('@mpcas2/db');

  // For MVP: Create a default tenant per user (simplified)
  // In production: Users would have proper tenant management
  const emailDomain = userInfo.email.split('@')[1];
  const defaultTenantName = `Default Tenant for ${emailDomain}`;

  // Check if user already has a tenant (simplified - would use proper lookup)
  // For MVP, we'll create a tenant per user on first login
  // TODO: Implement proper tenant-user association table
  let tenantId: string;

  // Try to find existing tenant by email domain (simplified lookup)
  // In production, use proper user-tenant association table
  const existingTenants = await prisma.tenant.findMany({
    where: {
      name: {
        contains: emailDomain,
      },
    },
    take: 1,
  });

  if (existingTenants.length > 0) {
    tenantId = existingTenants[0].id;
  } else {
    // Create new tenant
    const tenant = await createTenant({
      name: defaultTenantName,
      tier: 'free',
    });
    tenantId = tenant.id;
  }

  // Create or update user in tenant schema
  const user = await createOrUpdateUser(
    tenantId,
    {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      provider,
      provider_id: userInfo.id,
      email_verified: userInfo.verified_email ?? false,
    },
    oauthTokens
  );

  return { user, tenantId };
}

/**
 * Log activity for user actions
 */
export async function logActivity(
  tenantId: string,
  userId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  changes: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  // Ensure activity_logs table exists
  await ensureActivityLogsTable(tenantId);

  const changesJson = JSON.stringify(changes);
  await db.execute(
    Prisma.sql`
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, changes, ip_address, user_agent)
      VALUES (
        ${userId}::uuid,
        ${action},
        ${entityType},
        ${entityId ? Prisma.raw(`${entityId}::uuid`) : Prisma.raw('NULL')},
        ${Prisma.raw(`'${changesJson}'::jsonb`)},
        ${ipAddress || null},
        ${userAgent || null}
      )
    `
  );
}

/**
 * Request email change (sends verification email to new address)
 */
export async function requestEmailChange(
  tenantId: string,
  userId: string,
  newEmail: string
): Promise<{ token: string; expiresAt: Date }> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  // Check if new email is already in use
  const existingUsers = await db.query<{ id: string }>(
    Prisma.sql`SELECT id FROM users WHERE email = ${newEmail} AND deleted_at IS NULL`
  );

  if (existingUsers.length > 0) {
    throw new Error('Email address is already in use');
  }

  // Generate verification token
  const { generateVerificationToken } = await import('./token.service.js');
  const token = generateVerificationToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

  // Store new email and verification token
  await db.execute(
    Prisma.sql`
      UPDATE users
      SET 
        new_email = ${newEmail},
        new_email_verification_token = ${token},
        new_email_verification_expires_at = ${Prisma.raw(`'${expiresAt.toISOString()}'::timestamp`)},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}::uuid
        AND deleted_at IS NULL
    `
  );

  return { token, expiresAt };
}

/**
 * Verify and complete email change
 */
export async function verifyEmailChange(
  tenantId: string,
  userId: string,
  token: string
): Promise<boolean> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  const users = await db.query<{ new_email: string }>(
    Prisma.sql`
      UPDATE users
      SET 
        email = new_email,
        new_email = NULL,
        new_email_verification_token = NULL,
        new_email_verification_expires_at = NULL,
        email_verified = false,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}::uuid
        AND new_email_verification_token = ${token}
        AND new_email_verification_expires_at > CURRENT_TIMESTAMP
        AND deleted_at IS NULL
      RETURNING new_email
    `
  );

  return users.length > 0;
}

/**
 * Soft delete user account (30 day retention)
 */
export async function deleteUserAccount(
  tenantId: string,
  userId: string,
  password: string
): Promise<boolean> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  // Get user and verify password
  const users = await db.query<{ id: string; password_hash: string | null }>(
    Prisma.sql`SELECT id, password_hash FROM users WHERE id = ${userId}::uuid AND deleted_at IS NULL`
  );

  if (users.length === 0) {
    return false;
  }

  const user = users[0];

  // Verify password (if user has password)
  if (user.password_hash) {
    const { verifyPassword } = await import('./password.service.js');
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      throw new Error('Invalid password');
    }
  }

  // Soft delete (set deleted_at to 30 days from now for retention)
  const deletedAt = new Date();
  deletedAt.setDate(deletedAt.getDate() + 30);

  await db.execute(
    Prisma.sql`
      UPDATE users
      SET deleted_at = ${Prisma.raw(`'${deletedAt.toISOString()}'::timestamp`)},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}::uuid
    `
  );

  return true;
}

/**
 * Export user data in JSON format (GDPR compliance)
 */
export async function exportUserData(
  tenantId: string,
  userId: string
): Promise<Record<string, unknown>> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  // Get user data
  const users = await db.query<User>(
    Prisma.sql`SELECT * FROM users WHERE id = ${userId}::uuid AND deleted_at IS NULL`
  );

  if (users.length === 0) {
    throw new Error('User not found');
  }

  const user = users[0];

  // Get activity logs
  await ensureActivityLogsTable(tenantId);
  const activityLogs = await db.query<Record<string, unknown>>(
    Prisma.sql`SELECT * FROM activity_logs WHERE user_id = ${userId}::uuid ORDER BY created_at DESC`
  );

  // Get sessions
  const { getUserSessions } = await import('./session.service.js');
  const sessions = await getUserSessions(tenantId, userId);

  // Compile export data
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      email_verified: user.email_verified,
      timezone: user.timezone,
      preferences: user.preferences,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    },
    activity_logs: activityLogs,
    sessions: sessions.map((s) => ({
      id: s.id,
      device_info: s.device_info,
      last_activity_at: s.last_activity_at,
      created_at: s.created_at,
    })),
    exported_at: new Date().toISOString(),
  };
}

/**
 * Ensure activity_logs table exists
 */
async function ensureActivityLogsTable(tenantId: string): Promise<void> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id UUID,
      changes JSONB DEFAULT '{}',
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON activity_logs(user_id);
    CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON activity_logs(action);
    CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs(created_at DESC);
  `);
}
