# Database Backup Strategy

**Version**: 1.0  
**Date**: 2026-01-15  
**Purpose**: Define backup and recovery strategy for multi-tenant PostgreSQL database

## Overview

MPCAS2 uses a schema-per-tenant architecture with PostgreSQL 15+. This document outlines the backup strategy to ensure data safety and compliance with GDPR requirements.

## Backup Requirements

### Daily Snapshots

- **Frequency**: Daily at 2:00 AM UTC
- **Retention**: 30 days
- **Method**: PostgreSQL `pg_dump` with custom format
- **Storage**: AWS S3 or equivalent object storage

### Point-in-Time Recovery (PITR)

- **WAL Archiving**: Continuous Write-Ahead Log archiving enabled
- **Retention**: 7 days of WAL files
- **Recovery Point Objective (RPO)**: < 1 hour
- **Recovery Time Objective (RTO)**: < 4 hours

## Implementation

### Automated Daily Backups

```bash
# Backup script (run via cron or scheduled task)
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/postgres"
S3_BUCKET="mpcas2-db-backups"

# Create daily snapshot
pg_dump -Fc -h localhost -U mpcas2 -d mpcas2_dev \
  -f "${BACKUP_DIR}/daily_${DATE}.dump"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/daily_${DATE}.dump" \
  "s3://${S3_BUCKET}/daily/${DATE}.dump"

# Cleanup old backups (keep 30 days)
find "${BACKUP_DIR}" -name "daily_*.dump" -mtime +30 -delete
```

### WAL Archiving Configuration

**postgresql.conf**:

```conf
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://mpcas2-db-backups/wal/%f'
archive_timeout = 300
```

### Tenant-Specific Backup

For GDPR compliance, tenant data can be exported individually:

```sql
-- Export tenant schema
pg_dump -n tenant_{tenant_id} -Fc database_name > tenant_backup.dump
```

## Recovery Procedures

### Full Database Recovery

```bash
# Stop PostgreSQL
systemctl stop postgresql

# Restore from snapshot
pg_restore -d mpcas2_dev -Fc daily_20260115.dump

# Replay WAL files for point-in-time recovery
# (if needed)
```

### Point-in-Time Recovery

```bash
# Create recovery.conf
echo "restore_command = 'aws s3 cp s3://mpcas2-db-backups/wal/%f %p'" > recovery.conf
echo "recovery_target_time = '2026-01-15 14:30:00'" >> recovery.conf

# Start PostgreSQL (will automatically recover)
systemctl start postgresql
```

### Tenant Schema Recovery

```bash
# Restore specific tenant schema
pg_restore -d mpcas2_dev -n tenant_{tenant_id} -Fc tenant_backup.dump
```

## Monitoring

- **Backup Success**: Monitor backup job completion
- **Storage Usage**: Monitor S3 bucket size
- **WAL Archiving**: Monitor WAL file archiving success
- **Alerts**: Set up alerts for backup failures

## Compliance

- **GDPR**: Tenant data can be exported and deleted on request
- **Retention**: 30 days for daily backups, 7 days for WAL files
- **Encryption**: All backups encrypted at rest (S3 server-side encryption)

## Production Recommendations

1. **Use AWS RDS**: Managed PostgreSQL with automated backups
2. **Enable Automated Backups**: RDS automated backups with 7-35 day retention
3. **Enable PITR**: Continuous backup with 1-hour RPO
4. **Cross-Region Replication**: Replicate backups to secondary region
5. **Regular Testing**: Test restore procedures quarterly

## Local Development

For local development, backups are optional but recommended:

```bash
# Manual backup
pg_dump -Fc -U mpcas2 -d mpcas2_dev > backup_$(date +%Y%m%d).dump

# Restore
pg_restore -d mpcas2_dev -Fc backup_20260115.dump
```
