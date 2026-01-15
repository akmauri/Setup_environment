/**
 * User Profile Routes
 *
 * Handles user profile viewing and updating
 */

import { Router, Response } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.js';
import { getUserById, updateUserProfile } from '../services/user.service.js';

const router = Router();

// #region agent log
try {
  if (typeof fetch !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/d5dd91a6-fd8a-4d48-998a-9a4a470e0c9a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'user.routes.ts:12',
        message: 'Router created',
        data: { rateLimitExists: !!rateLimitMiddleware, verifyTokenExists: !!verifyToken },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'E',
      }),
    }).catch(() => {});
  }
} catch (e) {
  /* Ignore agent log errors */
}
// #endregion

// Apply rate limiting to all user routes
router.use(rateLimitMiddleware);

// All user routes require authentication
router.use(verifyToken);

/**
 * GET /api/v1/user/profile
 * Get current user's profile
 */
router.get('/profile', async (req: AuthenticatedRequest, res: Response) => {
  // #region agent log
  try {
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/d5dd91a6-fd8a-4d48-998a-9a4a470e0c9a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'user.routes.ts:24',
          message: 'GET /profile handler called',
          data: { hasUser: !!req.user, userId: req.user?.userId, tenantId: req.user?.tenantId },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'F',
        }),
      }).catch(() => {});
    }
  } catch (e) {
    /* Ignore agent log errors */
  }
  // #endregion
  try {
    // User ID and tenant ID are set by verifyToken middleware
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required',
        },
      });
    }

    // Get user profile
    // #region agent log
    try {
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/d5dd91a6-fd8a-4d48-998a-9a4a470e0c9a', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'user.routes.ts:40',
            message: 'Calling getUserById',
            data: { tenantId, userId, getUserByIdExists: !!getUserById },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'G',
          }),
        }).catch(() => {});
      }
    } catch (e) {
      /* Ignore agent log errors */
    }
    // #endregion
    const user = await getUserById(tenantId, userId);
    // #region agent log
    try {
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/d5dd91a6-fd8a-4d48-998a-9a4a470e0c9a', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'user.routes.ts:42',
            message: 'getUserById returned',
            data: { userFound: !!user, userId: user?.id },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'G',
          }),
        }).catch(() => {});
      }
    } catch (e) {
      /* Ignore agent log errors */
    }
    // #endregion

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found',
        },
      });
    }

    // Return user profile (exclude sensitive fields)
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: {
        code: 'PROFILE_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch profile',
      },
    });
  }
});

/**
 * PUT /api/v1/user/profile
 * Update current user's profile
 */
router.put('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // User ID and tenant ID are set by verifyToken middleware
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required',
        },
      });
    }

    const { name, picture } = req.body;

    // Validate input
    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Name must be a string',
        },
      });
    }

    if (picture !== undefined && typeof picture !== 'string') {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Picture must be a string (URL)',
        },
      });
    }

    // Validate name length if provided
    if (name !== undefined && name.length > 255) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Name must be 255 characters or less',
        },
      });
    }

    // Update user profile
    const updatedUser = await updateUserProfile(tenantId, userId, {
      name,
      picture,
    });

    if (!updatedUser) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found',
        },
      });
    }

    // Return updated user profile
    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        picture: updatedUser.picture,
        role: updatedUser.role,
        email_verified: updatedUser.email_verified,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: {
        code: 'PROFILE_UPDATE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to update profile',
      },
    });
  }
});

export default router;
