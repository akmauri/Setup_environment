/**
 * Pinterest Service
 *
 * Handles Pinterest-specific OAuth and API operations
 */

import { pinterestOAuthConfig } from '../config/oauth.config.js';
import { exchangeCodeForToken, OAuthTokenResponse } from './oauth.service.js';

export interface PinterestUserInfo {
  username: string;
  account_type?: 'BUSINESS' | 'PERSONAL';
  profile_image?: string;
  follower_count?: number;
  pin_count?: number;
  board_count?: number;
}

export interface PinterestBoard {
  id: string;
  name: string;
  description?: string;
  pin_count?: number;
  privacy?: 'PUBLIC' | 'SECRET';
}

export interface PinterestTokenResponse extends OAuthTokenResponse {
  refresh_token?: string;
  expires_in: number;
}

/**
 * Exchange authorization code for Pinterest tokens
 */
export async function exchangePinterestCode(code: string): Promise<PinterestTokenResponse> {
  return exchangeCodeForToken(code, pinterestOAuthConfig);
}

/**
 * Refresh Pinterest access token
 */
export async function refreshPinterestToken(refreshToken: string): Promise<PinterestTokenResponse> {
  const response = await fetch(pinterestOAuthConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${pinterestOAuthConfig.clientId}:${pinterestOAuthConfig.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Pinterest token refresh failed: ${error.error_description || error.error || response.statusText}`
    );
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_in: data.expires_in || 3600,
    token_type: data.token_type || 'Bearer',
    scope: data.scope,
  };
}

/**
 * Get Pinterest user information
 */
export async function getPinterestUserInfo(accessToken: string): Promise<PinterestUserInfo> {
  const response = await fetch(pinterestOAuthConfig.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to fetch Pinterest user info: ${error.message || error.error || response.statusText}`
    );
  }

  const data = await response.json();
  return {
    username: data.username || '',
    account_type: data.account_type as 'BUSINESS' | 'PERSONAL' | undefined,
    profile_image: data.profile_image,
    follower_count: data.follower_count ? parseInt(data.follower_count, 10) : undefined,
    pin_count: data.pin_count ? parseInt(data.pin_count, 10) : undefined,
    board_count: data.board_count ? parseInt(data.board_count, 10) : undefined,
  };
}

/**
 * Get Pinterest boards for user
 */
export async function getPinterestBoards(accessToken: string): Promise<PinterestBoard[]> {
  const response = await fetch('https://api.pinterest.com/v5/boards', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to fetch Pinterest boards: ${error.message || error.error || response.statusText}`
    );
  }

  const data = await response.json();
  return (data.items || []).map(
    (board: {
      id: string;
      name: string;
      description?: string;
      pin_count?: string;
      privacy?: string;
    }) => ({
      id: board.id,
      name: board.name,
      description: board.description,
      pin_count: board.pin_count ? parseInt(board.pin_count, 10) : undefined,
      privacy: board.privacy,
    })
  );
}

/**
 * Revoke Pinterest token
 */
export async function revokePinterestToken(token: string): Promise<void> {
  const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // Token revocation is best-effort, don't throw if it fails
    console.error('Failed to revoke Pinterest token:', await response.text());
  }
}

/**
 * Validate Pinterest token by making a test API call
 */
export async function validatePinterestToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(pinterestOAuthConfig.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}
