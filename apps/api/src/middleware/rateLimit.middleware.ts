/**
 * Rate Limiting Middleware
 *
 * Simple in-memory rate limiting for auth endpoints
 * In production, use Redis-based rate limiting
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Configuration
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Max requests per window

/**
 * Get client identifier (IP address)
 */
function getClientId(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/**
 * Rate limiting middleware
 *
 * Limits requests per IP address within a time window
 */
export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const clientId = getClientId(req);
  const now = Date.now();

  // Get or create rate limit entry
  let entry = store[clientId];

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetTime: now + WINDOW_MS,
    };
    store[clientId] = entry;
  }

  // Increment request count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter,
      },
    });
    return;
  }

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - entry.count));
  res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

  next();
}

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60 * 1000); // Clean up every minute
