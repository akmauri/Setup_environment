/**
 * Session Service
 *
 * Manages user sessions with device information and activity tracking
 */

import { db } from '@mpcas2/db';
import { Prisma } from '@prisma/client';
import { getTenantSchemaName } from './tenant.service.js';

export interface Session {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  device_info: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
  };
  last_activity_at: Date;
  created_at: Date;
  expires_at: Date;
}

/**
 * Create a new session
 */
export async function createSession(
  tenantId: string,
  userId: string,
  refreshTokenHash: string,
  deviceInfo: Session['device_info']
): Promise<Session> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  // Create sessions table if it doesn't exist
  await ensureSessionsTable(tenantId);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  const sessions = await db.query<Session>(
    Prisma.sql`
      INSERT INTO sessions (user_id, refresh_token_hash, device_info, last_activity_at, expires_at)
      VALUES (
        ${userId}::uuid,
        ${refreshTokenHash},
        ${JSON.stringify(deviceInfo)}::jsonb,
        CURRENT_TIMESTAMP,
        ${expiresAt.toISOString()}::timestamp
      )
      RETURNING *
    `
  );

  return sessions[0];
}

/**
 * Get session by refresh token hash
 */
export async function getSessionByRefreshToken(
  tenantId: string,
  refreshTokenHash: string
): Promise<Session | null> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  const sessions = await db.query<Session>(
    Prisma.sql`
      SELECT * FROM sessions
      WHERE refresh_token_hash = ${refreshTokenHash}
        AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1
    `
  );

  return sessions[0] || null;
}

/**
 * Update session last activity
 */
export async function updateSessionActivity(tenantId: string, sessionId: string): Promise<void> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  await db.execute(
    Prisma.sql`
      UPDATE sessions
      SET last_activity_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionId}::uuid
    `
  );
}

/**
 * Delete session (logout)
 */
export async function deleteSession(tenantId: string, sessionId: string): Promise<void> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  await db.execute(
    Prisma.sql`
      DELETE FROM sessions
      WHERE id = ${sessionId}::uuid
    `
  );
}

/**
 * Delete session by refresh token hash
 */
export async function deleteSessionByRefreshToken(
  tenantId: string,
  refreshTokenHash: string
): Promise<void> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  await db.execute(
    Prisma.sql`
      DELETE FROM sessions
      WHERE refresh_token_hash = ${refreshTokenHash}
    `
  );
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(tenantId: string, userId: string): Promise<Session[]> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  const sessions = await db.query<Session>(
    Prisma.sql`
      SELECT * FROM sessions
      WHERE user_id = ${userId}::uuid
        AND expires_at > CURRENT_TIMESTAMP
      ORDER BY last_activity_at DESC
    `
  );

  return sessions;
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(tenantId: string): Promise<number> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  const result = await db.execute(
    Prisma.sql`
      DELETE FROM sessions
      WHERE expires_at < CURRENT_TIMESTAMP
    `
  );

  return result;
}

/**
 * Ensure sessions table exists in tenant schema
 */
async function ensureSessionsTable(tenantId: string): Promise<void> {
  const schemaName = getTenantSchemaName(tenantId);
  await db.execute(`SET search_path TO ${schemaName}, public`);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
      device_info JSONB DEFAULT '{}',
      last_activity_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP(3) NOT NULL
    );

    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS sessions_refresh_token_hash_idx ON sessions(refresh_token_hash);
    CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
  `);
}
