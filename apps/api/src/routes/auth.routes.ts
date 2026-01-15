/**
 * Authentication Routes
 *
 * Handles OAuth flows and authentication endpoints
 */

import { Router, Request, Response } from 'express';
import { getGoogleAuthUrl } from '../config/oauth.config.js';
import { exchangeCodeForToken, getUserInfo } from '../services/oauth.service.js';
import { generateTokenPair, verifyRefreshToken } from '../services/jwt.service.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.js';
import { handleOAuthUser } from '../services/user.service.js';

const router = Router();

// Apply rate limiting to all auth routes
router.use(rateLimitMiddleware);

/**
 * GET /api/v1/auth/google
 * Initiates Google OAuth flow
 */
router.get('/google', (req: Request, res: Response) => {
  try {
    // Generate state for CSRF protection (in production, store in session)
    const state = (req.query.state as string) || Math.random().toString(36).substring(7);

    const authUrl = getGoogleAuthUrl(state);

    res.json({
      authUrl,
      state,
    });
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    res.status(500).json({
      error: {
        code: 'OAUTH_INIT_ERROR',
        message: 'Failed to initiate OAuth flow',
      },
    });
  }
});

/**
 * GET /api/v1/auth/callback/google
 * Handles OAuth callback from Google
 */
router.get('/callback/google', async (req: Request, res: Response) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.status(400).json({
        error: {
          code: 'OAUTH_ERROR',
          message: error,
        },
      });
    }

    if (!code) {
      return res.status(400).json({
        error: {
          code: 'MISSING_CODE',
          message: 'Authorization code is required',
        },
      });
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForToken(code as string);

    // Get user information
    const userInfo = await getUserInfo(tokenResponse.access_token);

    // Create or update user in database (creates tenant if needed)
    const { user, tenantId } = await handleOAuthUser(userInfo, 'google', {
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_in: tokenResponse.expires_in,
    });

    // Generate JWT tokens with actual user and tenant data
    const tokens = generateTokenPair({
      userId: user.id,
      tenantId: tenantId,
      email: user.email,
      role: user.role,
    });

    // In production, redirect to frontend with tokens
    // For now, return JSON response
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({
      error: {
        code: 'OAUTH_CALLBACK_ERROR',
        message: error instanceof Error ? error.message : 'OAuth callback failed',
      },
    });
  }
});

/**
 * POST /api/v1/auth/refresh
 * Refreshes access token using refresh token
 */
router.post('/refresh', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token is required',
        },
      });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: payload.userId,
      tenantId: payload.tenantId,
      email: payload.email,
      role: payload.role,
    });

    res.json({
      success: true,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: {
        code: 'REFRESH_TOKEN_ERROR',
        message: error instanceof Error ? error.message : 'Failed to refresh token',
      },
    });
  }
});

export default router;
