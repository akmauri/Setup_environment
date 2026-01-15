# Database Read Replica Configuration

**Version**: 1.0  
**Date**: 2026-01-15  
**Purpose**: Configure read replicas for horizontal scaling of read operations

## Overview

MPCAS2 uses PostgreSQL 15+ with schema-per-tenant architecture. Read replicas enable horizontal scaling of read operations, improving performance for analytics, reporting, and read-heavy workloads.

## Architecture

### Primary Database

- **Role**: Master (read/write)
- **Location**: Primary region (us-east-1)
- **Connection**: Direct connection for writes

### Read Replicas

- **Role**: Replica (read-only)
- **Location**: Multiple regions for low latency
- **Connection**: Connection pooler routes read queries

## Configuration

### PostgreSQL Streaming Replication

**Primary Server (postgresql.conf)**:

```conf
wal_level = replica
max_wal_senders = 3
wal_keep_size = 1GB
hot_standby = on
```

**Replica Server (postgresql.conf)**:

```conf
hot_standby = on
```

**Replica Server (recovery.conf or postgresql.auto.conf)**:

```conf
primary_conninfo = 'host=primary-db-host port=5432 user=replication password=replication_password'
```

### Connection Pooling with Read/Write Splitting

**PgBouncer Configuration (pgbouncer.ini)**:

```ini
[databases]
mpcas2 = host=primary-db port=5432 dbname=mpcas2_dev
mpcas2_read = host=replica-db port=5432 dbname=mpcas2_dev

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

### Application-Level Read/Write Splitting

Update database connection to use read replicas for read queries:

```typescript
// packages/db/src/index.ts
const readPool = new Pool({
  connectionString: process.env.DATABASE_READ_URL || process.env.DATABASE_URL,
});

const writePool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = {
  // Use read replica for queries
  async query<T = unknown>(sql: Prisma.Sql | string): Promise<T[]> {
    const pool = process.env.USE_READ_REPLICA ? readPool : writePool;
    // ... implementation
  },

  // Always use primary for writes
  async execute(sql: Prisma.Sql | string): Promise<number> {
    // ... use writePool
  },
};
```

## AWS RDS Configuration

### Create Read Replica

```bash
aws rds create-db-instance-read-replica \
  --db-instance-identifier mpcas2-replica-1 \
  --source-db-instance-identifier mpcas2-primary \
  --db-instance-class db.t3.medium \
  --availability-zone us-east-1b
```

### Multi-AZ Read Replicas

For high availability, create read replicas in multiple availability zones:

- **Replica 1**: us-east-1a
- **Replica 2**: us-east-1b
- **Replica 3**: us-east-1c (optional)

## Connection String Configuration

### Environment Variables

```bash
# Primary (write)
DATABASE_URL=postgresql://user:pass@primary-db:5432/mpcas2_dev

# Read Replica (read)
DATABASE_READ_URL=postgresql://user:pass@replica-db:5432/mpcas2_dev

# PgBouncer (connection pooling)
DATABASE_POOL_URL=postgresql://user:pass@pgbouncer:6432/mpcas2_dev
```

## Application Integration

### Automatic Read/Write Splitting

```typescript
// Middleware to route read queries to replica
export async function tenantDbMiddleware(req, res, next) {
  // For GET requests, use read replica
  if (req.method === 'GET') {
    req.useReadReplica = true;
  }
  // ... rest of middleware
}
```

### Manual Replica Selection

```typescript
// Use read replica explicitly
const users = await db.query<User>(Prisma.sql`SELECT * FROM users`, { useReadReplica: true });
```

## Monitoring

- **Replication Lag**: Monitor lag between primary and replicas
- **Replica Health**: Monitor replica server health
- **Query Distribution**: Track read/write query distribution
- **Performance**: Monitor query performance on replicas

## Local Development

For local development, read replicas are optional:

```yaml
# docker-compose.yml (optional read replica)
services:
  postgres-replica:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: mpcas2
      POSTGRES_PASSWORD: mpcas2_dev_password
    command: >
      postgres
      -c wal_level=replica
      -c hot_standby=on
      -c primary_conninfo=host=postgres port=5432 user=replication
```

## Production Recommendations

1. **Use AWS RDS Read Replicas**: Managed read replicas with automatic failover
2. **Multi-Region Replicas**: Deploy replicas in multiple regions for global low latency
3. **Connection Pooling**: Use PgBouncer or RDS Proxy for connection management
4. **Monitoring**: Set up CloudWatch alarms for replication lag
5. **Auto-Scaling**: Automatically add/remove replicas based on read load

## Schema-Per-Tenant Considerations

- **Replication**: All tenant schemas are replicated automatically
- **Isolation**: Tenant data isolation maintained across replicas
- **Performance**: Read replicas improve performance for analytics queries
- **Backup**: Replicas can be used for backup without impacting primary
