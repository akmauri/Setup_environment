/**
 * Prometheus Metrics Service
 *
 * Provides Prometheus metrics for monitoring
 */

import { Registry, Counter, Histogram, Gauge } from 'prom-client';

// Create a Registry to register metrics
export const register = new Registry();

// Add default metrics (CPU, memory, etc.)
// Note: prom-client's collectDefaultMetrics requires Node.js 14+
// For now, we'll create custom metrics

/**
 * HTTP request counter
 */
export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

/**
 * HTTP request duration histogram
 */
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

/**
 * Health check status gauge
 */
export const healthCheckStatus = new Gauge({
  name: 'health_check_status',
  help: 'Health check status (1 = ok, 0.5 = degraded, 0 = down)',
  labelNames: ['check_type'],
  registers: [register],
});

/**
 * Database connection status gauge
 */
export const databaseStatus = new Gauge({
  name: 'database_status',
  help: 'Database connection status (1 = connected, 0 = disconnected)',
  registers: [register],
});

/**
 * Database query duration histogram
 */
export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [register],
});

/**
 * Update health check metrics
 */
export function updateHealthCheckMetrics(
  checkType: string,
  status: 'ok' | 'degraded' | 'down'
): void {
  const value = status === 'ok' ? 1 : status === 'degraded' ? 0.5 : 0;
  healthCheckStatus.set({ check_type: checkType }, value);
}

/**
 * Update database status metric
 */
export function updateDatabaseStatus(connected: boolean): void {
  databaseStatus.set(connected ? 1 : 0);
}

/**
 * Record database query duration
 */
export function recordDatabaseQuery(queryType: string, durationSeconds: number): void {
  databaseQueryDuration.observe({ query_type: queryType }, durationSeconds);
}
