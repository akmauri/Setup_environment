/**
 * Database Client
 *
 * Prisma client for database access
 * Supports multi-tenant schema-per-tenant architecture
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Singleton Prisma client instance
let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

// Create PostgreSQL connection pool
if (!global.__pgPool) {
  global.__pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}
const pgPool = global.__pgPool;

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pgPool);

// Prisma Client will read DATABASE_URL from environment variables
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
} else {
  // In development, reuse the same instance to avoid too many connections
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      adapter,
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

export { prisma };

/**
 * Get Prisma client for a specific tenant schema
 *
 * Note: Prisma doesn't natively support dynamic schemas.
 * For schema-per-tenant, we'll need to:
 * 1. Use raw SQL queries for tenant-specific operations
 * 2. Or use a connection string with search_path set to tenant schema
 *
 * This is a placeholder - will be implemented with tenant middleware
 */
export function getTenantPrismaClient(_tenantId: string): PrismaClient {
  // TODO: Implement tenant-specific client
  // For now, return the default client
  // In production, this should use a connection with search_path set to tenant schema
  return prisma;
}

/**
 * Database connection utilities
 */
export const db = {
  /**
   * Test database connection
   */
  async connect(): Promise<void> {
    try {
      await prisma.$connect();
      // Database connection successful
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('✅ Database connected successfully');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  },

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  },

  /**
   * Execute raw SQL query with parameterization
   * Use Prisma.sql template tag for safe parameterized queries
   */
  async query<T = unknown>(sql: Prisma.Sql | string): Promise<T[]> {
    if (typeof sql === 'string') {
      // For simple queries without parameters, use unsafe
      return prisma.$queryRawUnsafe<T[]>(sql);
    }
    return prisma.$queryRaw<T[]>(sql);
  },

  /**
   * Execute raw SQL command (INSERT, UPDATE, DELETE) with parameterization
   * Use Prisma.sql template tag for safe parameterized queries
   */
  async execute(sql: Prisma.Sql | string): Promise<number> {
    if (typeof sql === 'string') {
      // For simple commands without parameters, use unsafe
      const result = await prisma.$executeRawUnsafe(sql);
      return result as number;
    }
    const result = await prisma.$executeRaw(sql);
    return result as number;
  },
};

export default prisma;
