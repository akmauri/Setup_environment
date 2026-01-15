/**
 * Pinterest OAuth Routes
 */

import { Router, Response } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.js';
import { getOAuthAuthUrl } from '../config/oauth.config.js';
import {
  exchangePinterestCode,
  getPinterestUserInfo,
  getPinterestBoards,
  revokePinterestToken,
  validatePinterestToken,
} from '../services/pinterest.service.js';
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
router.use(rateLimitMiddleware);

router.get('/connect', verifyToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    if (!userId || !tenantId) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }
    const state = `${tenantId}:${userId}:${Date.now()}`;
    const authUrl = getOAuthAuthUrl('pinterest', state);
    res.json({ authUrl, state });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'OAUTH_INIT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to initiate Pinterest OAuth',
      },
    });
  }
});

router.get('/callback', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    if (!userId || !tenantId) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }
    const { code, error: oauthError } = req.query;
    if (oauthError) {
      return res
        .status(400)
        .json({ error: { code: 'OAUTH_ERROR', message: oauthError as string } });
    }
    if (!code) {
      return res
        .status(400)
        .json({ error: { code: 'MISSING_CODE', message: 'Authorization code is required' } });
    }
    const accountCount = await countUserSocialAccounts(tenantId, userId, 'pinterest');
    const tierCheck = await checkTierLimit(tenantId, 'pinterest', accountCount);
    if (!tierCheck.allowed) {
      return res.status(403).json({
        error: {
          code: 'TIER_LIMIT_EXCEEDED',
          message: `You have reached the maximum number of Pinterest accounts for your tier (${tierCheck.limit}).`,
        },
      });
    }
    const tokenResponse = await exchangePinterestCode(code as string);
    const userInfo = await getPinterestUserInfo(tokenResponse.access_token);
    const boards = await getPinterestBoards(tokenResponse.access_token);
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + (tokenResponse.expires_in || 3600));
    const account = await saveSocialAccount(tenantId, {
      userId,
      platform: 'pinterest',
      platformUserId: userInfo.username,
      username: userInfo.username,
      displayName: userInfo.username,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpiresAt,
      scopes: ['pins:read', 'pins:write', 'boards:read', 'boards:write'],
      metadata: {
        accountType: userInfo.account_type,
        profileImage: userInfo.profile_image,
        followerCount: userInfo.follower_count,
        pinCount: userInfo.pin_count,
        boardCount: userInfo.board_count,
        boards: boards.map((b) => ({ id: b.id, name: b.name, pinCount: b.pin_count })),
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
    res.status(500).json({
      error: {
        code: 'OAUTH_CALLBACK_ERROR',
        message: error instanceof Error ? error.message : 'Pinterest OAuth callback failed',
      },
    });
  }
});

router.get('/accounts', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    if (!userId || !tenantId) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }
    const accounts = await getUserSocialAccounts(tenantId, userId, 'pinterest');
    res.json({
      success: true,
      accounts: accounts.map((a) => ({
        id: a.id,
        platform: a.platform,
        username: a.username,
        display_name: a.display_name,
        label: a.label,
        metadata: a.metadata,
        token_expires_at: a.token_expires_at,
        is_active: a.is_active,
        created_at: a.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'LIST_ACCOUNTS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to list Pinterest accounts',
      },
    });
  }
});

router.delete(
  '/accounts/:accountId',
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const tenantId = req.user?.tenantId;
      const { accountId } = req.params;
      if (!userId || !tenantId) {
        return res
          .status(401)
          .json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      }
      const account = await getSocialAccountById(tenantId, accountId);
      if (!account || account.user_id !== userId) {
        return res
          .status(404)
          .json({ error: { code: 'ACCOUNT_NOT_FOUND', message: 'Pinterest account not found' } });
      }
      try {
        if (account.decryptedAccessToken) {
          await revokePinterestToken(account.decryptedAccessToken);
        }
      } catch (error) {
        console.error('Failed to revoke token (continuing with deletion):', error);
      }
      await deleteSocialAccount(tenantId, accountId);
      res.json({ success: true, message: 'Pinterest account disconnected successfully' });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'DISCONNECT_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to disconnect Pinterest account',
        },
      });
    }
  }
);

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
        return res
          .status(401)
          .json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      }
      if (typeof label !== 'string' || label.length > 255) {
        return res.status(400).json({
          error: {
            code: 'INVALID_LABEL',
            message: 'Label must be a string with max 255 characters',
          },
        });
      }
      const account = await getSocialAccountById(tenantId, accountId);
      if (!account || account.user_id !== userId) {
        return res
          .status(404)
          .json({ error: { code: 'ACCOUNT_NOT_FOUND', message: 'Pinterest account not found' } });
      }
      const updated = await updateSocialAccountLabel(tenantId, accountId, label);
      res.json({ success: true, account: { id: updated?.id, label: updated?.label } });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'UPDATE_LABEL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update account label',
        },
      });
    }
  }
);

router.get(
  '/accounts/:accountId/health',
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const tenantId = req.user?.tenantId;
      const { accountId } = req.params;
      if (!userId || !tenantId) {
        return res
          .status(401)
          .json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      }
      const account = await getSocialAccountById(tenantId, accountId);
      if (!account || account.user_id !== userId) {
        return res
          .status(404)
          .json({ error: { code: 'ACCOUNT_NOT_FOUND', message: 'Pinterest account not found' } });
      }
      const isValid = await validatePinterestToken(account.decryptedAccessToken);
      const isExpired = account.token_expires_at
        ? new Date(account.token_expires_at) < new Date()
        : false;
      res.json({
        success: true,
        health: {
          valid: isValid,
          expired: isExpired,
          expires_at: account.token_expires_at,
          needs_refresh: isExpired || !isValid,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check token health',
        },
      });
    }
  }
);

router.get(
  '/accounts/:accountId/boards',
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const tenantId = req.user?.tenantId;
      const { accountId } = req.params;
      if (!userId || !tenantId) {
        return res
          .status(401)
          .json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      }
      const account = await getSocialAccountById(tenantId, accountId);
      if (!account || account.user_id !== userId) {
        return res
          .status(404)
          .json({ error: { code: 'ACCOUNT_NOT_FOUND', message: 'Pinterest account not found' } });
      }
      const boards = await getPinterestBoards(account.decryptedAccessToken);
      res.json({
        success: true,
        boards: boards.map((b) => ({
          id: b.id,
          name: b.name,
          description: b.description,
          pin_count: b.pin_count,
          privacy: b.privacy,
        })),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'GET_BOARDS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get Pinterest boards',
        },
      });
    }
  }
);

export default router;
