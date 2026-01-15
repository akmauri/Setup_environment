# Health Check System

## Description

Implement comprehensive health check endpoints for system monitoring and diagnostics.

## Requirements

- Basic health check endpoint returns operational status
- Detailed health check endpoint returns component status (database, Redis, external services)
- Version information included in health checks
- Response time performance targets (100ms basic, 500ms detailed)
- Caching to prevent excessive database queries
- Prometheus metrics endpoint for monitoring integration

## Acceptance Criteria

- [ ] `/health` endpoint returns 200 OK with basic status when system is operational
- [ ] `/health/detailed` endpoint returns database connection status
- [ ] `/health/detailed` endpoint returns Redis connection status
- [ ] `/health/detailed` endpoint returns external service status (S3, email)
- [ ] Health check includes version information (API version, build number, git commit hash)
- [ ] Database query executed to verify connectivity with response time logged
- [ ] Redis ping executed to verify cache connectivity
- [ ] Health check endpoint responds within 100ms for basic check
- [ ] Health check endpoint responds within 500ms for detailed check
- [ ] Health check results cached for 30 seconds
- [ ] Prometheus metrics endpoint at `/metrics`
- [ ] Health check failures trigger alerts to monitoring system (optional integration)

## Dependencies

- Database connection (`@mpcas2/db`)
- Redis client (if available)
- Express server setup
- Environment variables for version/build info

## Technical Notes

- Use in-memory cache for health check results (30 second TTL)
- Database check should execute simple query (SELECT 1)
- Redis check should use PING command
- External service checks should be non-blocking with timeouts
- Version info can come from package.json and git
- Prometheus metrics can use `prom-client` library
- Consider using `node-cache` or similar for result caching
