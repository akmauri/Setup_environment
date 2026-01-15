/**
 * Authentication Routes
 *
 * Handles OAuth flows, email/password authentication, 2FA, and token management
 */

import { Router, Request, Response } from 'express';
import {
  getOAuthAuthUrl,
  googleOAuthConfig,
  microsoftOAuthConfig,
  oktaOAuthConfig,
} from '../config/oauth.config.js';
import { exchangeCodeForToken, getUserInfo } from '../services/oauth.service.js';
import {
  registerUser,
  loginUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  enable2FA,
  verifyAndEnable2FA,
  disable2FA,
} from '../services/auth.service.js';
import { generateTokenPair, verifyRefreshToken } from '../services/jwt.service.js';
import { createAuthRateLimitMiddleware } from '../middleware/rateLimit.middleware.js';
import { handleOAuthUser } from '../services/user.service.js';
import { hashToken } from '../services/token.service.js';
import { deleteSessionByRefreshToken } from '../services/session.service.js';
import { getSessionByRefreshToken } from '../services/session.service.js';
import { verifyAccessToken } from '../services/jwt.service.js';

const router = Router();

// Apply stricter rate limiting to auth routes (5 attempts per 15 minutes)
router.use(createAuthRateLimitMiddleware());

/**
 * POST /api/v1/auth/register
 * Register a new user with email/password
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, createTenant, tenantName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email and password are required',
        },
      });
    }

    const result = await registerUser({
      email,
      password,
      name,
      createTenant,
      tenantName,
    });

    res.status(201).json({
      success: true,
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: {
        code: 'REGISTRATION_ERROR',
        message: error instanceof Error ? error.message : 'Registration failed',
      },
    });
  }
});

/**
 * POST /api/v1/auth/login
 * Login with email/password
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, totpCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email and password are required',
        },
      });
    }

    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ipAddress:
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.socket.remoteAddress ||
        'unknown',
    };

    const result = await loginUser({
      email,
      password,
      totpCode,
      deviceInfo,
    });

    if (result.requires2FA) {
      return res.status(200).json({
        success: true,
        requires2FA: true,
        user: result.user,
      });
    }

    res.json({
      success: true,
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      error: {
        code: 'LOGIN_ERROR',
        message: error instanceof Error ? error.message : 'Login failed',
      },
    });
  }
});

/**
 * GET /api/v1/auth/verify-email
 * Verify email with verification token
 */
router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token, tenantId } = req.query;

    if (!token || !tenantId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Token and tenantId are required',
        },
      });
    }

    const verified = await verifyEmail(tenantId as string, token as string);

    if (verified) {
      res.json({
        success: true,
        message: 'Email verified successfully',
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
    console.error('Email verification error:', error);
    res.status(500).json({
      error: {
        code: 'VERIFICATION_ERROR',
        message: error instanceof Error ? error.message : 'Verification failed',
      },
    });
  }
});

/**
 * POST /api/v1/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: {
          code: 'MISSING_EMAIL',
          message: 'Email is required',
        },
      });
    }

    await requestPasswordReset(email);

    // Always return success (don't reveal if user exists)
    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      error: {
        code: 'RESET_REQUEST_ERROR',
        message: error instanceof Error ? error.message : 'Failed to process reset request',
      },
    });
  }
});

/**
 * POST /api/v1/auth/reset-password
 * Reset password with reset token
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, tenantId, newPassword } = req.body;

    if (!token || !tenantId || !newPassword) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Token, tenantId, and newPassword are required',
        },
      });
    }

    const reset = await resetPassword(tenantId, token, newPassword);

    if (reset) {
      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } else {
      res.status(400).json({
        error: {
          code: 'RESET_FAILED',
          message: 'Invalid or expired reset token',
        },
      });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(400).json({
      error: {
        code: 'RESET_ERROR',
        message: error instanceof Error ? error.message : 'Password reset failed',
      },
    });
  }
});

/**
 * OAuth Routes
 */

/**
 * GET /api/v1/auth/:provider (google, microsoft, okta)
 * Initiates OAuth flow for a provider
 */
router.get('/:provider', (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const state = (req.query.state as string) || Math.random().toString(36).substring(7);

    if (!['google', 'microsoft', 'okta'].includes(provider)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PROVIDER',
          message: 'Invalid OAuth provider',
        },
      });
    }

    const authUrl = getOAuthAuthUrl(provider as 'google' | 'microsoft' | 'okta', state);

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
 * GET /api/v1/auth/callback/:provider
 * Handles OAuth callback from provider
 */
router.get('/callback/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { code, error } = req.query;

    if (!['google', 'microsoft', 'okta'].includes(provider)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PROVIDER',
          message: 'Invalid OAuth provider',
        },
      });
    }

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

    // Get provider config
    let config;
    switch (provider) {
      case 'google':
        config = googleOAuthConfig;
        break;
      case 'microsoft':
        config = microsoftOAuthConfig;
        break;
      case 'okta':
        config = oktaOAuthConfig;
        break;
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForToken(code as string, config);

    // Get user information
    const userInfo = await getUserInfo(tokenResponse.access_token, config);

    // Create or update user in database (creates tenant if needed)
    const { user, tenantId } = await handleOAuthUser(userInfo, provider, {
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_in: tokenResponse.expires_in,
    });

    // Generate JWT tokens
    const tokens = generateTokenPair({
      userId: user.id,
      tenantId: tenantId,
      email: user.email,
      role: user.role,
    });

    // In production, redirect to frontend with tokens
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
 * Refreshes access token using refresh token (with token rotation)
 */
router.post('/refresh', async (req: Request, res: Response) => {
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

    // Check if refresh token exists in session (token rotation)
    const refreshTokenHash = hashToken(refreshToken);
    const session = await getSessionByRefreshToken(payload.tenantId, refreshTokenHash);

    if (!session) {
      return res.status(401).json({
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token not found or already used',
        },
      });
    }

    // Delete old session (single-use token)
    await deleteSessionByRefreshToken(payload.tenantId, refreshTokenHash);

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: payload.userId,
      tenantId: payload.tenantId,
      email: payload.email,
      role: payload.role,
    });

    // Create new session with new refresh token
    const { createSession } = await import('../services/session.service.js');
    const newRefreshTokenHash = hashToken(tokens.refreshToken);
    await createSession(payload.tenantId, payload.userId, newRefreshTokenHash, {
      userAgent: req.headers['user-agent'],
      ipAddress:
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.socket.remoteAddress ||
        'unknown',
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

/**
 * POST /api/v1/auth/logout
 * Logout and invalidate refresh token
 */
router.post('/logout', async (req: Request, res: Response) => {
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

    // Verify token to get tenant ID
    const payload = verifyRefreshToken(refreshToken);
    const refreshTokenHash = hashToken(refreshToken);

    // Delete session
    await deleteSessionByRefreshToken(payload.tenantId, refreshTokenHash);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(401).json({
      error: {
        code: 'LOGOUT_ERROR',
        message: error instanceof Error ? error.message : 'Logout failed',
      },
    });
  }
});

/**
 * 2FA Routes
 */

/**
 * POST /api/v1/auth/2fa/enable
 * Enable 2FA for user
 */
router.post('/2fa/enable', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    const result = await enable2FA(payload.tenantId, payload.userId);

    res.json({
      success: true,
      secret: result.secret,
      qrCodeUrl: result.qrCodeUrl,
      manualEntryKey: result.manualEntryKey,
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(400).json({
      error: {
        code: '2FA_ENABLE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to enable 2FA',
      },
    });
  }
});

/**
 * POST /api/v1/auth/2fa/verify
 * Verify and enable 2FA
 */
router.post('/2fa/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    const { totpCode } = req.body;

    if (!totpCode) {
      return res.status(400).json({
        error: {
          code: 'MISSING_TOTP_CODE',
          message: 'TOTP code is required',
        },
      });
    }

    const verified = await verifyAndEnable2FA(payload.tenantId, payload.userId, totpCode);

    if (verified) {
      res.json({
        success: true,
        message: '2FA enabled successfully',
      });
    } else {
      res.status(400).json({
        error: {
          code: 'INVALID_TOTP_CODE',
          message: 'Invalid TOTP code',
        },
      });
    }
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(400).json({
      error: {
        code: '2FA_VERIFY_ERROR',
        message: error instanceof Error ? error.message : 'Failed to verify 2FA',
      },
    });
  }
});

/**
 * POST /api/v1/auth/2fa/disable
 * Disable 2FA for user
 */
router.post('/2fa/disable', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    await disable2FA(payload.tenantId, payload.userId);

    res.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(400).json({
      error: {
        code: '2FA_DISABLE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to disable 2FA',
      },
    });
  }
});

export default router;
