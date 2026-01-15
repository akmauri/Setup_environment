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
  const users = await db.query<User>(Prisma.sql`SELECT * FROM users WHERE id = ${userId}`);
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
  const updatedUsers = await db.query<User>(
    Prisma.sql`
      UPDATE users 
      SET 
        name = COALESCE(${input.name || null}, name),
        picture = COALESCE(${input.picture || null}, picture),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId} 
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
