/**
 * TikTok Service
 *
 * Handles TikTok-specific OAuth and API operations
 */

import { tiktokOAuthConfig } from '../config/oauth.config.js';
import { OAuthTokenResponse } from './oauth.service.js';

export interface TikTokUserInfo {
  open_id: string;
  union_id?: string;
  avatar_url?: string;
  display_name?: string;
  bio_description?: string;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
  video_count?: number;
  profile_deep_link?: string;
  is_verified?: boolean;
  account_type?: 'CREATOR' | 'BUSINESS' | 'PERSONAL';
  age?: number;
}

export interface TikTokTokenResponse extends OAuthTokenResponse {
  refresh_token?: string;
  refresh_expires_in?: number;
  expires_in: number;
}

/**
 * Exchange authorization code for TikTok tokens
 */
export async function exchangeTikTokCode(code: string): Promise<TikTokTokenResponse> {
  const response = await fetch(tiktokOAuthConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: tiktokOAuthConfig.clientId,
      client_secret: tiktokOAuthConfig.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: tiktokOAuthConfig.redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `TikTok token exchange failed: ${error.error_description || error.error || response.statusText}`
    );
  }

  const data = await response.json();
  return {
    access_token: data.data?.access_token || data.access_token,
    refresh_token: data.data?.refresh_token || data.refresh_token,
    expires_in: data.data?.expires_in || data.expires_in || 3600,
    refresh_expires_in: data.data?.refresh_expires_in || data.refresh_expires_in,
    token_type: data.data?.token_type || data.token_type || 'Bearer',
    scope: data.data?.scope || data.scope,
  };
}

/**
 * Refresh TikTok access token
 */
export async function refreshTikTokToken(refreshToken: string): Promise<TikTokTokenResponse> {
  const response = await fetch(tiktokOAuthConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: tiktokOAuthConfig.clientId,
      client_secret: tiktokOAuthConfig.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `TikTok token refresh failed: ${error.error_description || error.error || response.statusText}`
    );
  }

  const data = await response.json();
  return {
    access_token: data.data?.access_token || data.access_token,
    refresh_token: data.data?.refresh_token || data.refresh_token,
    expires_in: data.data?.expires_in || data.expires_in || 3600,
    refresh_expires_in: data.data?.refresh_expires_in || data.refresh_expires_in,
    token_type: data.data?.token_type || data.token_type || 'Bearer',
    scope: data.data?.scope || data.scope,
  };
}

/**
 * Get TikTok user information
 */
export async function getTikTokUserInfo(accessToken: string): Promise<TikTokUserInfo> {
  const response = await fetch(
    `${tiktokOAuthConfig.userInfoUrl}?fields=open_id,union_id,avatar_url,display_name,bio_description,follower_count,following_count,likes_count,video_count,profile_deep_link,is_verified`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to fetch TikTok user info: ${error.error?.message || error.error_description || response.statusText}`
    );
  }

  const data = await response.json();
  const userData = data.data?.user || data.user || data;

  // Validate account type and age
  // Note: TikTok API may not directly return account_type and age in user.info.basic scope
  // These would need to be checked via additional API calls or inferred from other data
  // For now, we'll store what we can get and validate what's available

  return {
    open_id: userData.open_id,
    union_id: userData.union_id,
    avatar_url: userData.avatar_url,
    display_name: userData.display_name,
    bio_description: userData.bio_description,
    follower_count: userData.follower_count ? parseInt(userData.follower_count, 10) : undefined,
    following_count: userData.following_count ? parseInt(userData.following_count, 10) : undefined,
    likes_count: userData.likes_count ? parseInt(userData.likes_count, 10) : undefined,
    video_count: userData.video_count ? parseInt(userData.video_count, 10) : undefined,
    profile_deep_link: userData.profile_deep_link,
    is_verified: userData.is_verified || false,
    // Account type and age would need additional API calls or scopes
    // For MVP, we'll assume Creator/Business if they can use the API (requires 18+)
    account_type: 'CREATOR' as const, // Default assumption, would need validation
    age: undefined, // Would need additional API call or scope
  };
}

/**
 * Revoke TikTok token
 */
export async function revokeTikTokToken(token: string): Promise<void> {
  const response = await fetch('https://open.tiktokapis.com/v2/oauth/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: tiktokOAuthConfig.clientId,
      client_secret: tiktokOAuthConfig.clientSecret,
      token,
    }),
  });

  if (!response.ok) {
    // Token revocation is best-effort, don't throw if it fails
    console.error('Failed to revoke TikTok token:', await response.text());
  }
}

/**
 * Validate TikTok token by making a test API call
 */
export async function validateTikTokToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${tiktokOAuthConfig.userInfoUrl}?fields=open_id`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}
