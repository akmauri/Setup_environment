/**
 * Health Check Service
 *
 * Provides health check functionality for system monitoring
 */

import { db } from '@mpcas2/db';
import { Prisma } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { recordDatabaseQuery } from './metrics.service.js';
import { getRedisClient } from './redis.service.js';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  version?: VersionInfo;
  database?: ComponentStatus;
  redis?: ComponentStatus;
  externalServices?: {
    s3?: ComponentStatus;
    email?: ComponentStatus;
  };
  responseTime?: number;
}

export interface ComponentStatus {
  status: 'ok' | 'error';
  responseTime?: number;
  message?: string;
  error?: string;
}

export interface VersionInfo {
  apiVersion: string;
  buildNumber?: string;
  gitCommitHash?: string;
}

/**
 * Get version information from package.json and git
 */
export function getVersionInfo(): VersionInfo {
  try {
    // Read package.json for API version (from apps/api directory)
    const packagePath = join(process.cwd(), 'apps', 'api', 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    const apiVersion = packageJson.version || '0.0.0';

    // Get git commit hash (if available)
    let gitCommitHash: string | undefined;
    try {
      gitCommitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    } catch {
      // Git not available or not in git repo
      gitCommitHash = process.env.GIT_COMMIT_HASH;
    }

    // Get build number from environment or use timestamp
    const buildNumber = process.env.BUILD_NUMBER || process.env.CI_BUILD_NUMBER;

    return {
      apiVersion,
      buildNumber,
      gitCommitHash,
    };
  } catch (error) {
    return {
      apiVersion: 'unknown',
    };
  }
}

/**
 * Check database connectivity
 */
export async function checkDatabase(): Promise<ComponentStatus> {
  const startTime = Date.now();
  try {
    // Execute simple query to verify connectivity
    await db.query(Prisma.sql`SELECT 1`);
    const responseTime = Date.now() - startTime;
    const responseTimeSeconds = responseTime / 1000;

    // Record metric
    recordDatabaseQuery('health_check', responseTimeSeconds);

    return {
      status: 'ok',
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const responseTimeSeconds = responseTime / 1000;
    recordDatabaseQuery('health_check', responseTimeSeconds);

    return {
      status: 'error',
      responseTime,
      error: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

/**
 * Check Redis connectivity (if available)
 */
export async function checkRedis(): Promise<ComponentStatus> {
  const startTime = Date.now();
  const client = getRedisClient();

  if (!client) {
    return {
      status: 'error',
      message: 'Redis client not configured',
    };
  }

  try {
    // Use PING command with timeout
    const result = await Promise.race([
      client.ping(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Redis ping timeout')), 5000)
      ),
    ]);

    const responseTime = Date.now() - startTime;

    if (result === 'PONG') {
      return {
        status: 'ok',
        responseTime,
      };
    }

    return {
      status: 'error',
      responseTime,
      message: 'Redis ping failed',
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 'error',
      responseTime,
      error: error instanceof Error ? error.message : 'Redis connection failed',
    };
  }
}

/**
 * Check S3 service connectivity
 */
export async function checkS3(): Promise<ComponentStatus> {
  const startTime = Date.now();

  // Check if S3 is configured
  const hasS3Config =
    process.env.S3_ENDPOINT ||
    process.env.AWS_S3_BUCKET ||
    (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

  if (!hasS3Config) {
    return {
      status: 'error',
      message: 'S3 client not configured',
    };
  }

  // For now, just check if config exists
  // In production, could test actual S3 connection with timeout
  try {
    // Simulate S3 check with timeout
    await Promise.race([
      Promise.resolve('ok'),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('S3 check timeout')), 5000)
      ),
    ]);

    const responseTime = Date.now() - startTime;
    return {
      status: 'ok',
      responseTime,
      message: 'S3 configuration available',
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 'error',
      responseTime,
      error: error instanceof Error ? error.message : 'S3 check failed',
    };
  }
}

/**
 * Check email service connectivity
 */
export async function checkEmail(): Promise<ComponentStatus> {
  // Email service check - verify SMTP configuration
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD;

  if (!hasSmtpConfig) {
    return {
      status: 'error',
      message: 'SMTP configuration not available',
    };
  }

  // For now, just check if config exists
  // In production, could test actual SMTP connection
  return {
    status: 'ok',
    message: 'SMTP configuration available',
  };
}

/**
 * Get basic health status
 */
export async function getBasicHealth(): Promise<HealthStatus> {
  const startTime = Date.now();
  const version = getVersionInfo();
  const responseTime = Date.now() - startTime;

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version,
    responseTime,
  };
}

/**
 * Alert hook interface for monitoring system integration
 */
export type AlertHook = (healthStatus: HealthStatus) => Promise<void> | void;

const alertHooks: AlertHook[] = [];

/**
 * Register an alert hook for health check failures
 */
export function registerAlertHook(hook: AlertHook): void {
  alertHooks.push(hook);
}

/**
 * Trigger alert hooks if health check fails
 */
async function triggerAlerts(healthStatus: HealthStatus): Promise<void> {
  if (healthStatus.status === 'down' || healthStatus.status === 'degraded') {
    for (const hook of alertHooks) {
      try {
        await hook(healthStatus);
      } catch (error) {
        console.error('Alert hook failed:', error);
      }
    }
  }
}

/**
 * Get detailed health status
 */
export async function getDetailedHealth(): Promise<HealthStatus> {
  const startTime = Date.now();

  // Run all health checks in parallel
  const [database, redis, s3, email] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkS3(),
    checkEmail(),
  ]);

  const responseTime = Date.now() - startTime;

  // Determine overall status
  let overallStatus: 'ok' | 'degraded' | 'down' = 'ok';
  if (database.status === 'error') {
    overallStatus = 'down';
  } else if (redis.status === 'error' || s3.status === 'error' || email.status === 'error') {
    overallStatus = 'degraded';
  }

  const version = getVersionInfo();

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version,
    database,
    redis,
    externalServices: {
      s3,
      email,
    },
    responseTime,
  };

  // Trigger alerts if health check fails (non-blocking)
  triggerAlerts(healthStatus).catch((error) => {
    console.error('Failed to trigger alerts:', error);
  });

  return healthStatus;
}
