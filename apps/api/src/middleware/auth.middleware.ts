/**
 * Authentication Middleware
 *
 * JWT verification and protected route handling
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../services/jwt.service.js';

/**
 * Extend Request type to include user payload
 */
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

/**
 * JWT Verification Middleware
 *
 * Verifies JWT access token and attaches user payload to request
 */
export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'NO_TOKEN',
          message: 'Authorization token required',
        },
      });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    // Attach user payload to request
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof Error && error.message === 'Token expired') {
      res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired',
        },
      });
      return;
    }

    res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or malformed token',
      },
    });
  }
}

/**
 * Protected Route Wrapper
 *
 * Combines token verification with optional role checking
 */
export function requireAuth(roles?: string[]) {
  return [
    verifyToken,
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      // Check role if specified
      if (roles && roles.length > 0) {
        if (!req.user.role || !roles.includes(req.user.role)) {
          res.status(403).json({
            error: {
              code: 'FORBIDDEN',
              message: 'Insufficient permissions',
            },
          });
          return;
        }
      }

      next();
    },
  ];
}
