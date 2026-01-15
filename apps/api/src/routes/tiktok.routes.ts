/**
 * TikTok OAuth Routes
 *
 * Handles TikTok account connection via OAuth
 */

import { Router, Response } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.js';
import { tiktokOAuthConfig, getOAuthAuthUrl } from '../config/oauth.config.js';
import {
  exchangeTikTokCode,
  getTikTokUserInfo,
  revokeTikTokToken,
  validateTikTokToken,
} from '../services/tiktok.service.js';
import {
  saveSocialAccount,
  getUserSocialAccounts,
  deleteSocialAccount,
  updateSocialAccountLabel,
  countUserSocialAccounts,
  getSocialAccountById,
} from '../services/social-account.service.js';
import { checkTierLimit } from '../services/tier.service.js';

const router = Router();

// Apply rate limiting
router.use(rateLimitMiddleware);

/**
 * GET /api/v1/social/tiktok/connect
 * Initiate TikTok OAuth flow
 */
router.get('/connect', verifyToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const state = `${tenantId}:${userId}:${Date.now()}`;
    const authUrl = getOAuthAuthUrl('tiktok', state);

    res.json({
      authUrl,
      state,
    });
  } catch (error) {
    console.error('TikTok OAuth initiation error:', error);
    res.status(500).json({
      error: {
        code: 'OAUTH_INIT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to initiate TikTok OAuth',
      },
    });
  }
});

/**
 * GET /api/v1/social/tiktok/callback
 * Handle TikTok OAuth callback
 */
router.get('/callback', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { code, error: oauthError } = req.query;

    if (oauthError) {
      return res.status(400).json({
        error: {
          code: 'OAUTH_ERROR',
          message: oauthError as string,
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

    // Check tier limits
    const accountCount = await countUserSocialAccounts(tenantId, userId, 'tiktok');
    const tierCheck = await checkTierLimit(tenantId, 'tiktok', accountCount);

    if (!tierCheck.allowed) {
      return res.status(403).json({
        error: {
          code: 'TIER_LIMIT_EXCEEDED',
          message: `You have reached the maximum number of TikTok accounts for your tier (${tierCheck.limit}). Upgrade to connect more accounts.`,
        },
      });
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeTikTokCode(code as string);

    // Get TikTok user information
    const userInfo = await getTikTokUserInfo(tokenResponse.access_token);

    // Note: TikTok API requires account to be Creator or Business and age 18+
    // This is enforced by TikTok during OAuth, but we should validate if possible
    // For now, if the OAuth succeeds, we assume the account meets requirements

    // Calculate token expiry
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + (tokenResponse.expires_in || 3600));

    // Calculate refresh token expiry if provided
    const refreshExpiresAt = tokenResponse.refresh_expires_in
      ? new Date(Date.now() + tokenResponse.refresh_expires_in * 1000)
      : undefined;

    // Save social account with encrypted tokens
    const account = await saveSocialAccount(tenantId, {
      userId,
      platform: 'tiktok',
      platformUserId: userInfo.open_id,
      username: userInfo.display_name || userInfo.open_id,
      displayName: userInfo.display_name,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpiresAt,
      scopes: tiktokOAuthConfig.scopes,
      metadata: {
        openId: userInfo.open_id,
        unionId: userInfo.union_id,
        avatarUrl: userInfo.avatar_url,
        bioDescription: userInfo.bio_description,
        followerCount: userInfo.follower_count,
        followingCount: userInfo.following_count,
        likesCount: userInfo.likes_count,
        videoCount: userInfo.video_count,
        profileDeepLink: userInfo.profile_deep_link,
        isVerified: userInfo.is_verified,
        accountType: userInfo.account_type || 'CREATOR',
        dailyUploadLimit: 20, // TikTok allows 20 videos per account per day
        refreshExpiresAt: refreshExpiresAt?.toISOString(),
      },
    });

    res.json({
      success: true,
      account: {
        id: account.id,
        platform: account.platform,
        username: account.username,
        display_name: account.display_name,
        label: account.label,
        metadata: account.metadata,
      },
    });
  } catch (error) {
    console.error('TikTok OAuth callback error:', error);
    res.status(500).json({
      error: {
        code: 'OAUTH_CALLBACK_ERROR',
        message: error instanceof Error ? error.message : 'TikTok OAuth callback failed',
      },
    });
  }
});

/**
 * GET /api/v1/social/tiktok/accounts
 * List connected TikTok accounts
 */
router.get('/accounts', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const accounts = await getUserSocialAccounts(tenantId, userId, 'tiktok');

    res.json({
      success: true,
      accounts: accounts.map((account) => ({
        id: account.id,
        platform: account.platform,
        platform_user_id: account.platform_user_id,
        username: account.username,
        display_name: account.display_name,
        label: account.label,
        metadata: account.metadata,
        token_expires_at: account.token_expires_at,
        is_active: account.is_active,
        created_at: account.created_at,
      })),
    });
  } catch (error) {
    console.error('List TikTok accounts error:', error);
    res.status(500).json({
      error: {
        code: 'LIST_ACCOUNTS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to list TikTok accounts',
      },
    });
  }
});

/**
 * DELETE /api/v1/social/tiktok/accounts/:accountId
 * Disconnect TikTok account
 */
router.delete(
  '/accounts/:accountId',
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const tenantId = req.user?.tenantId;
      const { accountId } = req.params;

      if (!userId || !tenantId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
      }

      // Get account to verify ownership and get tokens for revocation
      const account = await getSocialAccountById(tenantId, accountId);

      if (!account || account.user_id !== userId) {
        return res.status(404).json({
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'TikTok account not found',
          },
        });
      }

      // Revoke tokens
      try {
        if (account.decryptedAccessToken) {
          await revokeTikTokToken(account.decryptedAccessToken);
        }
      } catch (error) {
        console.error('Failed to revoke token (continuing with deletion):', error);
        // Continue with deletion even if revocation fails
      }

      // Delete account
      await deleteSocialAccount(tenantId, accountId);

      res.json({
        success: true,
        message: 'TikTok account disconnected successfully',
      });
    } catch (error) {
      console.error('Disconnect TikTok account error:', error);
      res.status(500).json({
        error: {
          code: 'DISCONNECT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to disconnect TikTok account',
        },
      });
    }
  }
);

/**
 * PUT /api/v1/social/tiktok/accounts/:accountId/label
 * Update account label
 */
router.put(
  '/accounts/:accountId/label',
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const tenantId = req.user?.tenantId;
      const { accountId } = req.params;
      const { label } = req.body;

      if (!userId || !tenantId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
      }

      if (typeof label !== 'string' || label.length > 255) {
        return res.status(400).json({
          error: {
            code: 'INVALID_LABEL',
            message: 'Label must be a string with max 255 characters',
          },
        });
      }

      // Verify account ownership
      const account = await getSocialAccountById(tenantId, accountId);
      if (!account || account.user_id !== userId) {
        return res.status(404).json({
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'TikTok account not found',
          },
        });
      }

      const updated = await updateSocialAccountLabel(tenantId, accountId, label);

      res.json({
        success: true,
        account: {
          id: updated?.id,
          label: updated?.label,
        },
      });
    } catch (error) {
      console.error('Update account label error:', error);
      res.status(500).json({
        error: {
          code: 'UPDATE_LABEL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update account label',
        },
      });
    }
  }
);

/**
 * GET /api/v1/social/tiktok/accounts/:accountId/health
 * Check token health for a specific account
 */
router.get(
  '/accounts/:accountId/health',
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const tenantId = req.user?.tenantId;
      const { accountId } = req.params;

      if (!userId || !tenantId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
      }

      const account = await getSocialAccountById(tenantId, accountId);

      if (!account || account.user_id !== userId) {
        return res.status(404).json({
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'TikTok account not found',
          },
        });
      }

      const isValid = await validateTikTokToken(account.decryptedAccessToken);
      const isExpired = account.token_expires_at
        ? new Date(account.token_expires_at) < new Date()
        : false;

      res.json({
        success: true,
        health: {
          valid: isValid,
          expired: isExpired,
          expires_at: account.token_expires_at,
          needs_refresh: !isValid || isExpired,
        },
      });
    } catch (error) {
      console.error('Token health check error:', error);
      res.status(500).json({
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check token health',
        },
      });
    }
  }
);

export default router;
