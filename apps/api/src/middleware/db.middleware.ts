/**
 * Database Middleware
 *
 * Sets PostgreSQL search_path to tenant schema based on JWT token
 * This enables schema-per-tenant architecture
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/jwt.service.js';
import { getTenantSchemaName } from '../services/tenant.service.js';
import { db } from '@mpcas2/db';

/**
 * Extract tenant ID from JWT token
 */
function extractTenantIdFromToken(req: Request): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    return payload.tenantId;
  } catch (error) {
    return null;
  }
}

/**
 * Extract tenant ID from subdomain (fallback)
 */
function extractTenantIdFromSubdomain(_req: Request): string | null {
  // In development, subdomain might be localhost:3000
  // In production, it would be tenant.example.com
  // For now, we'll need to query the database to find tenant by subdomain
  // This is a placeholder - implement subdomain lookup if needed
  return null;
}

/**
 * Database middleware that sets tenant context
 *
 * This middleware:
 * 1. Extracts tenant_id from JWT token (preferred)
 * 2. Falls back to subdomain if no token
 * 3. Sets PostgreSQL search_path to tenant schema
 * 4. Adds tenant_id to request object for use in routes
 */
export async function tenantDbMiddleware(
  req: Request & { tenantId?: string; tenantSchema?: string },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract tenant ID
    let tenantId = extractTenantIdFromToken(req);

    if (!tenantId) {
      tenantId = extractTenantIdFromSubdomain(req);
    }

    if (!tenantId) {
      // No tenant context - allow public schema access only
      await db.execute('SET search_path TO public');
      return next();
    }

    // Get tenant schema name
    const tenantSchema = getTenantSchemaName(tenantId);

    // Set search_path to tenant schema (with public as fallback)
    await db.execute(`SET search_path TO ${tenantSchema}, public`);

    // Add tenant context to request
    req.tenantId = tenantId;
    req.tenantSchema = tenantSchema;

    next();
  } catch (error) {
    console.error('Database middleware error:', error);
    res.status(500).json({ error: 'Database context error' });
  }
}

/**
 * Require tenant context middleware
 *
 * Use this middleware on routes that require tenant context
 */
export function requireTenant(
  req: Request & { tenantId?: string },
  res: Response,
  next: NextFunction
): void {
  if (!req.tenantId) {
    res.status(401).json({ error: 'Tenant context required' });
    return;
  }
  next();
}
