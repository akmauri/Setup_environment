/**
 * Instagram OAuth Routes
 *
 * Handles Instagram account connection via Facebook OAuth
 */

import { Router, Response } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.js';
import { facebookOAuthConfig, getOAuthAuthUrl } from '../config/oauth.config.js';
import {
  exchangeFacebookCode,
  exchangeForLongLivedToken,
  getFacebookPages,
  getInstagramAccountFromPage,
  revokeInstagramToken,
  validateInstagramToken,
} from '../services/instagram.service.js';
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
 * GET /api/v1/social/instagram/connect
 * Initiate Instagram OAuth flow via Facebook Login
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
    const authUrl = getOAuthAuthUrl('facebook', state);

    res.json({
      authUrl,
      state,
    });
  } catch (error) {
    console.error('Instagram OAuth initiation error:', error);
    res.status(500).json({
      error: {
        code: 'OAUTH_INIT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to initiate Instagram OAuth',
      },
    });
  }
});

/**
 * GET /api/v1/social/instagram/callback
 * Handle Instagram OAuth callback
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

    // Check tier limits
    const accountCount = await countUserSocialAccounts(tenantId, userId, 'instagram');
    const tierCheck = await checkTierLimit(tenantId, 'instagram', accountCount);

    if (!tierCheck.allowed) {
      return res.status(403).json({
        error: {
          code: 'TIER_LIMIT_EXCEEDED',
          message: `You have reached the maximum number of Instagram accounts for your tier (${tierCheck.limit}). Upgrade to connect more accounts.`,
        },
      });
    }

    // Exchange code for short-lived token
    const tokenResponse = await exchangeFacebookCode(code as string);

    // Get Facebook Pages
    const pages = await getFacebookPages(tokenResponse.access_token);

    // Filter pages that have Instagram accounts connected
    const pagesWithInstagram = pages.filter((page) => page.instagram_business_account);

    if (pagesWithInstagram.length === 0) {
      return res.status(400).json({
        error: {
          code: 'NO_INSTAGRAM_ACCOUNTS',
          message:
            'No Instagram accounts found. Please ensure you have an Instagram Professional account connected to a Facebook Page.',
        },
      });
    }

    // If page_id is provided, use that page; otherwise, use the first one
    const selectedPageId = (page_id as string) || pagesWithInstagram[0].id;
    const selectedPage = pagesWithInstagram.find((p) => p.id === selectedPageId);

    if (!selectedPage) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PAGE',
          message: 'Selected Facebook Page not found or does not have an Instagram account',
        },
      });
    }

    try {
      // Get Instagram account information
      const instagramInfo = await getInstagramAccountFromPage(
        selectedPage.id,
        selectedPage.access_token
      );

      // Exchange short-lived token for long-lived token (60 days)
      const longLivedToken = await exchangeForLongLivedToken(selectedPage.access_token);

      // Calculate token expiry (60 days)
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + longLivedToken.expires_in);

      // Save social account with encrypted tokens
      const account = await saveSocialAccount(tenantId, {
        userId,
        platform: 'instagram',
        platformUserId: instagramInfo.id,
        username: instagramInfo.username,
        displayName: instagramInfo.username,
        accessToken: longLivedToken.access_token,
        refreshToken: longLivedToken.access_token, // Facebook uses same token for refresh
        tokenExpiresAt,
        scopes: facebookOAuthConfig.scopes,
        metadata: {
          accountId: instagramInfo.id,
          accountType: instagramInfo.account_type,
          profilePictureUrl: instagramInfo.profile_picture_url,
          followersCount: instagramInfo.followers_count,
          mediaCount: instagramInfo.media_count,
          isVerified: instagramInfo.is_verified,
          facebookPageId: selectedPage.id,
          facebookPageName: selectedPage.name,
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
      // Handle specific Instagram errors
      if (error instanceof Error) {
        if (error.message.includes('Professional account')) {
          return res.status(400).json({
            error: {
              code: 'NOT_PROFESSIONAL_ACCOUNT',
              message:
                'Instagram account must be a Professional account (Business or Creator) to connect.',
            },
          });
        }
        if (error.message.includes('No Instagram account connected')) {
          return res.status(400).json({
            error: {
              code: 'PAGE_NOT_CONNECTED',
              message:
                'This Facebook Page does not have an Instagram account connected. Please connect an Instagram account to your Facebook Page first.',
            },
          });
        }
      }

      throw error;
    }
  } catch (error) {
    console.error('Instagram OAuth callback error:', error);
    res.status(500).json({
      error: {
        code: 'OAUTH_CALLBACK_ERROR',
        message: error instanceof Error ? error.message : 'Instagram OAuth callback failed',
      },
    });
  }
});

/**
 * GET /api/v1/social/instagram/pages
 * Get Facebook Pages with Instagram accounts (for selection)
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

    const pages = await getFacebookPages(access_token as string);
    const pagesWithInstagram = pages.filter((page) => page.instagram_business_account);

    res.json({
      success: true,
      pages: pagesWithInstagram.map((page) => ({
        id: page.id,
        name: page.name,
        instagram_account: page.instagram_business_account
          ? {
              id: page.instagram_business_account.id,
              username: page.instagram_business_account.username,
            }
          : null,
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
 * GET /api/v1/social/instagram/accounts
 * List connected Instagram accounts
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

    const accounts = await getUserSocialAccounts(tenantId, userId, 'instagram');

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
    console.error('List Instagram accounts error:', error);
    res.status(500).json({
      error: {
        code: 'LIST_ACCOUNTS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to list Instagram accounts',
      },
    });
  }
});

/**
 * DELETE /api/v1/social/instagram/accounts/:accountId
 * Disconnect Instagram account
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
            message: 'Instagram account not found',
          },
        });
      }

      // Revoke tokens
      try {
        if (account.decryptedAccessToken) {
          await revokeInstagramToken(account.decryptedAccessToken);
        }
      } catch (error) {
        console.error('Failed to revoke token (continuing with deletion):', error);
        // Continue with deletion even if revocation fails
      }

      // Delete account
      await deleteSocialAccount(tenantId, accountId);

      res.json({
        success: true,
        message: 'Instagram account disconnected successfully',
      });
    } catch (error) {
      console.error('Disconnect Instagram account error:', error);
      res.status(500).json({
        error: {
          code: 'DISCONNECT_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to disconnect Instagram account',
        },
      });
    }
  }
);

/**
 * PUT /api/v1/social/instagram/accounts/:accountId/label
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
            message: 'Instagram account not found',
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
 * GET /api/v1/social/instagram/accounts/:accountId/health
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
            message: 'Instagram account not found',
          },
        });
      }

      const isValid = await validateInstagramToken(account.decryptedAccessToken);
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
