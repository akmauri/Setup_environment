/**
 * Twitter/X OAuth Routes
 *
 * Handles Twitter/X account connection via OAuth (Twitter API v2)
 */

import { Router, Response } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.js';
import { twitterOAuthConfig, getOAuthAuthUrl } from '../config/oauth.config.js';
import {
  exchangeTwitterCode,
  revokeTwitterToken,
  validateTwitterToken,
  checkTwitterAccountStatus,
  parseRateLimitHeaders,
} from '../services/twitter.service.js';
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
 * GET /api/v1/social/twitter/connect
 * Initiate Twitter OAuth flow
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
    const authUrl = getOAuthAuthUrl('twitter', state);

    res.json({
      authUrl,
      state,
    });
  } catch (error) {
    console.error('Twitter OAuth initiation error:', error);
    res.status(500).json({
      error: {
        code: 'OAUTH_INIT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to initiate Twitter OAuth',
      },
    });
  }
});

/**
 * GET /api/v1/social/twitter/callback
 * Handle Twitter OAuth callback
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
    const accountCount = await countUserSocialAccounts(tenantId, userId, 'twitter');
    const tierCheck = await checkTierLimit(tenantId, 'twitter', accountCount);

    if (!tierCheck.allowed) {
      return res.status(403).json({
        error: {
          code: 'TIER_LIMIT_EXCEEDED',
          message: `You have reached the maximum number of Twitter accounts for your tier (${tierCheck.limit}). Upgrade to connect more accounts.`,
        },
      });
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeTwitterCode(code as string);

    // Get Twitter user information
    const userInfoResponse = await fetch(
      `${twitterOAuthConfig.userInfoUrl}?user.fields=id,username,name,profile_image_url,verified,public_metrics,description,created_at`,
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      const error = await userInfoResponse.json().catch(() => ({}));
      // Check for suspended account or permission issues
      if (userInfoResponse.status === 403) {
        return res.status(403).json({
          error: {
            code: 'ACCOUNT_SUSPENDED',
            message: error.detail || 'Account may be suspended or access denied',
          },
        });
      }
      throw new Error(error.detail || error.title || 'Failed to fetch Twitter user info');
    }

    const userData = await userInfoResponse.json();
    const userInfo = userData.data;

    // Parse rate limit headers
    const rateLimit = parseRateLimitHeaders(userInfoResponse.headers);

    // Calculate token expiry
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + (tokenResponse.expires_in || 7200));

    // Save social account with encrypted tokens
    const account = await saveSocialAccount(tenantId, {
      userId,
      platform: 'twitter',
      platformUserId: userInfo.id,
      username: userInfo.username,
      displayName: userInfo.name,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpiresAt,
      scopes: twitterOAuthConfig.scopes,
      metadata: {
        userId: userInfo.id,
        username: userInfo.username,
        name: userInfo.name,
        profileImageUrl: userInfo.profile_image_url,
        verified: userInfo.verified || false,
        followersCount: userInfo.public_metrics?.followers_count,
        followingCount: userInfo.public_metrics?.following_count,
        tweetCount: userInfo.public_metrics?.tweet_count,
        description: userInfo.description,
        createdAt: userInfo.created_at,
        rateLimit: rateLimit
          ? {
              limit: rateLimit.limit,
              remaining: rateLimit.remaining,
              reset: rateLimit.reset,
            }
          : null,
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
    console.error('Twitter OAuth callback error:', error);
    res.status(500).json({
      error: {
        code: 'OAUTH_CALLBACK_ERROR',
        message: error instanceof Error ? error.message : 'Twitter OAuth callback failed',
      },
    });
  }
});

/**
 * GET /api/v1/social/twitter/accounts
 * List connected Twitter accounts
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

    const accounts = await getUserSocialAccounts(tenantId, userId, 'twitter');

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
    console.error('List Twitter accounts error:', error);
    res.status(500).json({
      error: {
        code: 'LIST_ACCOUNTS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to list Twitter accounts',
      },
    });
  }
});

/**
 * DELETE /api/v1/social/twitter/accounts/:accountId
 * Disconnect Twitter account
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
            message: 'Twitter account not found',
          },
        });
      }

      // Revoke tokens
      try {
        if (account.decryptedAccessToken) {
          await revokeTwitterToken(account.decryptedAccessToken);
        }
      } catch (error) {
        console.error('Failed to revoke token (continuing with deletion):', error);
        // Continue with deletion even if revocation fails
      }

      // Delete account
      await deleteSocialAccount(tenantId, accountId);

      res.json({
        success: true,
        message: 'Twitter account disconnected successfully',
      });
    } catch (error) {
      console.error('Disconnect Twitter account error:', error);
      res.status(500).json({
        error: {
          code: 'DISCONNECT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to disconnect Twitter account',
        },
      });
    }
  }
);

/**
 * PUT /api/v1/social/twitter/accounts/:accountId/label
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
            message: 'Twitter account not found',
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
 * GET /api/v1/social/twitter/accounts/:accountId/health
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
            message: 'Twitter account not found',
          },
        });
      }

      const isValid = await validateTwitterToken(account.decryptedAccessToken);
      const isExpired = account.token_expires_at
        ? new Date(account.token_expires_at) < new Date()
        : false;

      // Check account status
      const accountStatus = await checkTwitterAccountStatus(account.decryptedAccessToken);

      res.json({
        success: true,
        health: {
          valid: isValid,
          expired: isExpired,
          expires_at: account.token_expires_at,
          needs_refresh: !isValid || isExpired,
          suspended: accountStatus.suspended,
          error: accountStatus.error,
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
