/**
 * Token Refresh Service
 *
 * Handles automatic token refresh for social media accounts
 */

import { getSocialAccountById, saveSocialAccount } from './social-account.service.js';
import { refreshYouTubeToken } from './youtube.service.js';
import { refreshInstagramToken } from './instagram.service.js';
import { refreshTikTokToken } from './tiktok.service.js';
import { refreshTwitterToken } from './twitter.service.js';
import { refreshLinkedInToken } from './linkedin.service.js';

/**
 * Refresh token for a social account
 */
export async function refreshAccountToken(
  tenantId: string,
  accountId: string,
  platform: string
): Promise<{ success: boolean; newExpiresAt?: Date; error?: string }> {
  try {
    const account = await getSocialAccountById(tenantId, accountId);

    if (!account || account.platform !== platform) {
      return { success: false, error: 'Account not found' };
    }

    if (!account.decryptedRefreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    // Refresh token based on platform
    let tokenResponse: { access_token: string; refresh_token?: string; expires_in: number };
    switch (platform) {
      case 'youtube':
        tokenResponse = await refreshYouTubeToken(account.decryptedRefreshToken);
        break;
      case 'instagram': {
        // Instagram/Facebook uses the same token for access and refresh
        const instagramResponse = await refreshInstagramToken(account.decryptedRefreshToken);
        tokenResponse = {
          access_token: instagramResponse.access_token,
          refresh_token: instagramResponse.access_token, // Facebook uses same token
          expires_in: instagramResponse.expires_in,
        };
        break;
      }
      case 'tiktok': {
        const tiktokResponse = await refreshTikTokToken(account.decryptedRefreshToken);
        tokenResponse = {
          access_token: tiktokResponse.access_token,
          refresh_token: tiktokResponse.refresh_token || tiktokResponse.access_token,
          expires_in: tiktokResponse.expires_in,
        };
        break;
      }
      case 'twitter': {
        // Twitter implements refresh token rotation (new refresh token on each refresh)
        const twitterResponse = await refreshTwitterToken(account.decryptedRefreshToken);
        tokenResponse = {
          access_token: twitterResponse.access_token,
          refresh_token: twitterResponse.refresh_token || twitterResponse.access_token,
          expires_in: twitterResponse.expires_in,
        };
        break;
      }
      case 'linkedin': {
        const linkedinResponse = await refreshLinkedInToken(account.decryptedRefreshToken);
        tokenResponse = {
          access_token: linkedinResponse.access_token,
          refresh_token: linkedinResponse.refresh_token || linkedinResponse.access_token,
          expires_in: linkedinResponse.expires_in,
        };
        break;
      }
      default:
        return { success: false, error: `Unsupported platform: ${platform}` };
    }

    // Calculate new expiry
    const newExpiresAt = new Date();
    newExpiresAt.setSeconds(newExpiresAt.getSeconds() + (tokenResponse.expires_in || 3600));

    // Update account with new tokens (token rotation - old refresh token is invalidated)
    await saveSocialAccount(tenantId, {
      userId: account.user_id,
      platform: account.platform,
      platformUserId: account.platform_user_id,
      username: account.username || undefined,
      displayName: account.display_name || undefined,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || tokenResponse.access_token, // Use access token as refresh if not provided
      tokenExpiresAt: newExpiresAt,
      scopes: account.scopes || undefined,
      metadata: (account.metadata as Record<string, unknown>) || undefined,
      label: account.label || undefined,
    });

    return { success: true, newExpiresAt };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed',
    };
  }
}

/**
 * Check if token needs refresh (5 minutes before expiry)
 */
export function shouldRefreshToken(expiresAt: Date | null): boolean {
  if (!expiresAt) {
    return false;
  }

  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  return expiresAt <= fiveMinutesFromNow;
}

/**
 * Auto-refresh tokens for accounts that need it
 */
export async function autoRefreshTokens(
  _tenantId: string,
  _userId: string,
  _platform: string
): Promise<void> {
  // This would be called by a background job or scheduled task
  // For now, it's available as a utility function
  // In production, this would query all accounts and refresh those that need it
}
