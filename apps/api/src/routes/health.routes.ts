/**
 * Health Check Routes
 *
 * Provides health check endpoints for monitoring
 */

import { Router, Request, Response } from 'express';
import NodeCache from 'node-cache';
import { getBasicHealth, getDetailedHealth } from '../services/health.service.js';
import {
  register,
  updateHealthCheckMetrics,
  updateDatabaseStatus,
} from '../services/metrics.service.js';

const router = Router();

// Cache for health check results (30 second TTL)
const cache = new NodeCache({ stdTTL: 30 });

/**
 * GET /health
 * Basic health check endpoint
 */
router.get('/health', async (_req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // Check cache first
    const cached = cache.get<Awaited<ReturnType<typeof getBasicHealth>>>('basic');
    if (cached) {
      return res.json(cached);
    }

    // Get fresh health status
    const health = await getBasicHealth();
    const responseTime = Date.now() - startTime;
    health.responseTime = responseTime;

    // Cache the result
    cache.set('basic', health);

    // Update metrics
    updateHealthCheckMetrics('basic', health.status);

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'down',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
    });
  }
});

/**
 * GET /health/detailed
 * Detailed health check endpoint with component status
 */
router.get('/health/detailed', async (_req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // Check cache first
    const cached = cache.get<Awaited<ReturnType<typeof getDetailedHealth>>>('detailed');
    if (cached) {
      return res.json(cached);
    }

    // Get fresh detailed health status
    const health = await getDetailedHealth();
    const responseTime = Date.now() - startTime;
    health.responseTime = responseTime;

    // Cache the result
    cache.set('detailed', health);

    // Update metrics
    updateHealthCheckMetrics('detailed', health.status);
    if (health.database) {
      updateDatabaseStatus(health.database.status === 'ok');
    }

    // Return appropriate status code based on health
    const statusCode = health.status === 'down' ? 503 : health.status === 'degraded' ? 200 : 200;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'down',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Detailed health check failed',
    });
  }
});

/**
 * GET /metrics
 * Prometheus metrics endpoint
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate metrics',
    });
  }
});

export default router;
