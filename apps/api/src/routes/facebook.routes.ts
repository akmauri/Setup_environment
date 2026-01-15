/**
 * Facebook OAuth Routes
 *
 * Handles Facebook Page connection via OAuth
 */

import { Router, Response } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.js';
import { facebookPagesOAuthConfig, getOAuthAuthUrl } from '../config/oauth.config.js';
import {
  exchangeFacebookCode,
  exchangeForLongLivedUserToken,
  getFacebookPagesForUser,
  getFacebookPageInfo,
  getPageAccessToken,
  revokeFacebookToken,
  validateFacebookToken,
  getInstagramAccountForPage,
} from '../services/facebook.service.js';
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
 * GET /api/v1/social/facebook/connect
 * Initiate Facebook OAuth flow
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
    // Use facebook and override scopes for Pages
    const baseAuthUrl = getOAuthAuthUrl('facebook', state);
    const params = new URLSearchParams(baseAuthUrl.split('?')[1]);
    params.set('scope', facebookPagesOAuthConfig.scopes.join(','));
    const authUrl = `${facebookPagesOAuthConfig.authorizationUrl}?${params.toString()}`;

    res.json({
      authUrl,
      state,
    });
  } catch (error) {
    console.error('Facebook OAuth initiation error:', error);
    res.status(500).json({
      error: {
        code: 'OAUTH_INIT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to initiate Facebook OAuth',
      },
    });
  }
});

/**
 * GET /api/v1/social/facebook/callback
 * Handle Facebook OAuth callback
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

    const { code, error: oauthError, page_id } = req.query;

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

    if (!page_id) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PAGE_ID',
          message: 'Facebook Page ID is required',
        },
      });
    }

    // Check tier limits
    const accountCount = await countUserSocialAccounts(tenantId, userId, 'facebook');
    const tierCheck = await checkTierLimit(tenantId, 'facebook', accountCount);

    if (!tierCheck.allowed) {
      return res.status(403).json({
        error: {
          code: 'TIER_LIMIT_EXCEEDED',
          message: `You have reached the maximum number of Facebook Pages for your tier (${tierCheck.limit}). Upgrade to connect more pages.`,
        },
      });
    }

    // Exchange code for short-lived user token
    const tokenResponse = await exchangeFacebookCode(code as string);

    // Exchange for long-lived user token
    const longLivedUserToken = await exchangeForLongLivedUserToken(tokenResponse.access_token);

    // Get Page Access Token (long-lived, never expires)
    const pageAccessToken = await getPageAccessToken(
      page_id as string,
      longLivedUserToken.access_token
    );

    // Get Facebook Page information
    const pageInfo = await getFacebookPageInfo(page_id as string, pageAccessToken);

    // Check if Instagram account is connected to this page
    const instagramAccount = await getInstagramAccountForPage(page_id as string, pageAccessToken);

    // Page Access Tokens never expire (unless revoked)
    // Set a far future date for tracking purposes
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setFullYear(tokenExpiresAt.getFullYear() + 100); // Far future

    // Save Facebook Page account
    const account = await saveSocialAccount(tenantId, {
      userId,
      platform: 'facebook',
      platformUserId: pageInfo.id,
      username: pageInfo.name,
      displayName: pageInfo.name,
      accessToken: pageAccessToken, // Long-lived Page Access Token
      refreshToken: pageAccessToken, // Page tokens don't need refresh
      tokenExpiresAt,
      scopes: facebookPagesOAuthConfig.scopes,
      metadata: {
        pageId: pageInfo.id,
        pageName: pageInfo.name,
        category: pageInfo.category,
        picture: pageInfo.picture?.data?.url,
        followersCount: pageInfo.followers_count || pageInfo.fan_count,
        link: pageInfo.link,
        verified: pageInfo.verified || false,
        instagramAccountId: instagramAccount?.id || null,
        instagramUsername: instagramAccount?.username || null,
        canCrosspostToInstagram: !!instagramAccount,
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
    console.error('Facebook OAuth callback error:', error);
    res.status(500).json({
      error: {
        code: 'OAUTH_CALLBACK_ERROR',
        message: error instanceof Error ? error.message : 'Facebook OAuth callback failed',
      },
    });
  }
});

/**
 * GET /api/v1/social/facebook/pages
 * Get Facebook Pages for user (for selection)
 */
router.get('/pages', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { access_token } = req.query;

    if (!access_token) {
      return res.status(400).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Access token is required',
        },
      });
    }

    const pages = await getFacebookPagesForUser(access_token as string);

    res.json({
      success: true,
      pages: pages.map((page) => ({
        id: page.id,
        name: page.name,
        category: page.category,
        picture: page.picture?.data?.url,
        followersCount: page.followers_count || page.fan_count,
        link: page.link,
        verified: page.verified || false,
      })),
    });
  } catch (error) {
    console.error('Get Facebook Pages error:', error);
    res.status(500).json({
      error: {
        code: 'GET_PAGES_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get Facebook Pages',
      },
    });
  }
});

/**
 * GET /api/v1/social/facebook/accounts
 * List connected Facebook Pages
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

    const accounts = await getUserSocialAccounts(tenantId, userId, 'facebook');

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
    console.error('List Facebook accounts error:', error);
    res.status(500).json({
      error: {
        code: 'LIST_ACCOUNTS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to list Facebook accounts',
      },
    });
  }
});

/**
 * DELETE /api/v1/social/facebook/accounts/:accountId
 * Disconnect Facebook Page
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
            message: 'Facebook Page not found',
          },
        });
      }

      // Revoke tokens
      try {
        if (account.decryptedAccessToken) {
          await revokeFacebookToken(account.decryptedAccessToken);
        }
      } catch (error) {
        console.error('Failed to revoke token (continuing with deletion):', error);
        // Continue with deletion even if revocation fails
      }

      // Delete account
      await deleteSocialAccount(tenantId, accountId);

      res.json({
        success: true,
        message: 'Facebook Page disconnected successfully',
      });
    } catch (error) {
      console.error('Disconnect Facebook Page error:', error);
      res.status(500).json({
        error: {
          code: 'DISCONNECT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to disconnect Facebook Page',
        },
      });
    }
  }
);

/**
 * PUT /api/v1/social/facebook/accounts/:accountId/label
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
            message: 'Facebook Page not found',
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
 * GET /api/v1/social/facebook/accounts/:accountId/health
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
            message: 'Facebook Page not found',
          },
        });
      }

      const isValid = await validateFacebookToken(account.decryptedAccessToken);
      // Page Access Tokens never expire (unless revoked)
      const isExpired = false;

      res.json({
        success: true,
        health: {
          valid: isValid,
          expired: isExpired,
          expires_at: account.token_expires_at,
          needs_refresh: !isValid, // Page tokens don't expire, but can be revoked
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
