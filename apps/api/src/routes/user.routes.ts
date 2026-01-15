/**
 * User Profile Routes
 *
 * Handles user profile viewing and updating
 */

import { Router, Response } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.js';
import {
  getUserById,
  updateUserProfile,
  requestEmailChange,
  verifyEmailChange,
  deleteUserAccount,
  exportUserData,
  logActivity,
} from '../services/user.service.js';
import { sendVerificationEmail } from '../services/email.service.js';
import { prisma } from '@mpcas2/db';

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

    // Get tenant for subscription tier
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { tier: true },
    });

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
        timezone: user.timezone,
        preferences: user.preferences,
        subscription_tier: tenant?.tier || 'free',
        created_at: user.created_at,
        last_login_at: user.last_login_at,
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

    const { name, picture, timezone, preferences } = req.body;

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

    if (timezone !== undefined && typeof timezone !== 'string') {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Timezone must be a string',
        },
      });
    }

    if (preferences !== undefined && typeof preferences !== 'object') {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Preferences must be an object',
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

    // Get old user data for activity log
    const oldUser = await getUserById(tenantId, userId);
    const changes: Record<string, unknown> = {};

    if (name !== undefined && name !== oldUser?.name)
      changes.name = { from: oldUser?.name, to: name };
    if (picture !== undefined && picture !== oldUser?.picture)
      changes.picture = { from: oldUser?.picture, to: picture };
    if (timezone !== undefined && timezone !== oldUser?.timezone)
      changes.timezone = { from: oldUser?.timezone, to: timezone };
    if (preferences !== undefined)
      changes.preferences = { from: oldUser?.preferences, to: preferences };

    // Update user profile
    const updatedUser = await updateUserProfile(tenantId, userId, {
      name,
      picture,
      timezone,
      preferences,
    });

    // Log activity
    if (Object.keys(changes).length > 0) {
      const ipAddress =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.socket.remoteAddress ||
        'unknown';
      await logActivity(
        tenantId,
        userId,
        'profile_updated',
        'user',
        userId,
        changes,
        ipAddress,
        req.headers['user-agent']
      );
    }

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
        timezone: updatedUser.timezone,
        preferences: updatedUser.preferences,
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

/**
 * POST /api/v1/user/change-email
 * Request email change (sends verification email to new address)
 */
router.post('/change-email', async (req: AuthenticatedRequest, res: Response) => {
  try {
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

    const { newEmail } = req.body;

    if (!newEmail || typeof newEmail !== 'string') {
      return res.status(400).json({
        error: {
          code: 'MISSING_EMAIL',
          message: 'New email address is required',
        },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_EMAIL',
          message: 'Invalid email format',
        },
      });
    }

    const { token, expiresAt } = await requestEmailChange(tenantId, userId, newEmail);

    // Send verification email
    await sendVerificationEmail(newEmail, token, tenantId, 'email_change');

    res.json({
      success: true,
      message: 'Verification email sent to new address',
      expiresAt,
    });
  } catch (error) {
    console.error('Change email error:', error);
    res.status(400).json({
      error: {
        code: 'EMAIL_CHANGE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to request email change',
      },
    });
  }
});

/**
 * POST /api/v1/user/verify-email-change
 * Verify and complete email change
 */
router.post('/verify-email-change', async (req: AuthenticatedRequest, res: Response) => {
  try {
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

    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Verification token is required',
        },
      });
    }

    const verified = await verifyEmailChange(tenantId, userId, token);

    if (verified) {
      // Log activity
      const ipAddress =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.socket.remoteAddress ||
        'unknown';
      await logActivity(
        tenantId,
        userId,
        'email_changed',
        'user',
        userId,
        { action: 'email_verified' },
        ipAddress,
        req.headers['user-agent']
      );

      res.json({
        success: true,
        message: 'Email changed successfully',
      });
    } else {
      res.status(400).json({
        error: {
          code: 'VERIFICATION_FAILED',
          message: 'Invalid or expired verification token',
        },
      });
    }
  } catch (error) {
    console.error('Verify email change error:', error);
    res.status(500).json({
      error: {
        code: 'VERIFICATION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to verify email change',
      },
    });
  }
});

/**
 * DELETE /api/v1/user/account
 * Delete user account (soft delete with 30 day retention)
 */
router.delete('/account', async (req: AuthenticatedRequest, res: Response) => {
  try {
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

    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        error: {
          code: 'MISSING_PASSWORD',
          message: 'Password confirmation is required',
        },
      });
    }

    const deleted = await deleteUserAccount(tenantId, userId, password);

    if (deleted) {
      // Log activity
      const ipAddress =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.socket.remoteAddress ||
        'unknown';
      await logActivity(
        tenantId,
        userId,
        'account_deleted',
        'user',
        userId,
        { action: 'soft_delete', retention_days: 30 },
        ipAddress,
        req.headers['user-agent']
      );

      res.json({
        success: true,
        message: 'Account deleted successfully. Data will be permanently removed after 30 days.',
      });
    } else {
      res.status(400).json({
        error: {
          code: 'DELETE_FAILED',
          message: 'Failed to delete account',
        },
      });
    }
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(400).json({
      error: {
        code: 'DELETE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to delete account',
      },
    });
  }
});

/**
 * GET /api/v1/user/export
 * Export user data in JSON format (GDPR compliance)
 */
router.get('/export', async (req: AuthenticatedRequest, res: Response) => {
  try {
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

    const exportData = await exportUserData(tenantId, userId);

    // Log activity
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';
    await logActivity(
      tenantId,
      userId,
      'data_exported',
      'user',
      userId,
      { action: 'gdpr_export' },
      ipAddress,
      req.headers['user-agent']
    );

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      error: {
        code: 'EXPORT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to export user data',
      },
    });
  }
});

export default router;
