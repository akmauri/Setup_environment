/**
 * Twitter Service
 *
 * Handles Twitter/X-specific OAuth and API operations (Twitter API v2)
 */

import { twitterOAuthConfig } from '../config/oauth.config.js';
import { OAuthTokenResponse } from './oauth.service.js';
import crypto from 'crypto';

export interface TwitterUserInfo {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
  verified?: boolean;
  followers_count?: number;
  following_count?: number;
  tweet_count?: number;
  description?: string;
  created_at?: string;
}

export interface TwitterTokenResponse extends OAuthTokenResponse {
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}

export interface TwitterRateLimit {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

/**
 * Generate code verifier and challenge for PKCE (Twitter requires PKCE)
 */
function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  return { codeVerifier, codeChallenge };
}

/**
 * Exchange authorization code for Twitter tokens
 */
export async function exchangeTwitterCode(
  code: string,
  codeVerifier?: string
): Promise<TwitterTokenResponse> {
  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: twitterOAuthConfig.clientId,
    redirect_uri: twitterOAuthConfig.redirectUri,
    ...(codeVerifier && { code_verifier: codeVerifier }),
  });

  const credentials = Buffer.from(
    `${twitterOAuthConfig.clientId}:${twitterOAuthConfig.clientSecret}`
  ).toString('base64');

  const response = await fetch(twitterOAuthConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Twitter token exchange failed: ${error.error_description || error.error || response.statusText}`
    );
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in || 7200, // Default 2 hours
    token_type: data.token_type || 'Bearer',
    scope: data.scope,
  };
}

/**
 * Refresh Twitter access token with rotation (new refresh token issued)
 */
export async function refreshTwitterToken(refreshToken: string): Promise<TwitterTokenResponse> {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    client_id: twitterOAuthConfig.clientId,
  });

  const credentials = Buffer.from(
    `${twitterOAuthConfig.clientId}:${twitterOAuthConfig.clientSecret}`
  ).toString('base64');

  const response = await fetch(twitterOAuthConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Twitter token refresh failed: ${error.error_description || error.error || response.statusText}`
    );
  }

  const data = await response.json();
  // Twitter issues a new refresh token on each refresh (rotation)
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token, // New refresh token
    expires_in: data.expires_in || 7200,
    token_type: data.token_type || 'Bearer',
    scope: data.scope,
  };
}

/**
 * Get Twitter user information
 */
export async function getTwitterUserInfo(accessToken: string): Promise<TwitterUserInfo> {
  const response = await fetch(
    `${twitterOAuthConfig.userInfoUrl}?user.fields=id,username,name,profile_image_url,verified,public_metrics,description,created_at`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to fetch Twitter user info: ${error.detail || error.title || response.statusText}`
    );
  }

  const data = await response.json();
  const user = data.data;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    profile_image_url: user.profile_image_url,
    verified: user.verified || false,
    followers_count: user.public_metrics?.followers_count,
    following_count: user.public_metrics?.following_count,
    tweet_count: user.public_metrics?.tweet_count,
    description: user.description,
    created_at: user.created_at,
  };
}

/**
 * Get rate limit information from Twitter API response headers
 */
export function parseRateLimitHeaders(headers: Headers): TwitterRateLimit | null {
  const limit = headers.get('x-rate-limit-limit');
  const remaining = headers.get('x-rate-limit-remaining');
  const reset = headers.get('x-rate-limit-reset');

  if (limit && remaining && reset) {
    return {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10),
    };
  }

  return null;
}

/**
 * Revoke Twitter token
 */
export async function revokeTwitterToken(token: string): Promise<void> {
  const body = new URLSearchParams({
    token,
    token_type_hint: 'access_token',
  });

  const credentials = Buffer.from(
    `${twitterOAuthConfig.clientId}:${twitterOAuthConfig.clientSecret}`
  ).toString('base64');

  const response = await fetch('https://api.twitter.com/2/oauth2/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: body.toString(),
  });

  if (!response.ok) {
    // Token revocation is best-effort, don't throw if it fails
    console.error('Failed to revoke Twitter token:', await response.text());
  }
}

/**
 * Validate Twitter token by making a test API call
 */
export async function validateTwitterToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${twitterOAuthConfig.userInfoUrl}?user.fields=id`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check if account is suspended or has permission issues
 */
export async function checkTwitterAccountStatus(accessToken: string): Promise<{
  suspended: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`${twitterOAuthConfig.userInfoUrl}?user.fields=id`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 403) {
      const error = await response.json().catch(() => ({}));
      return {
        suspended: true,
        error: error.detail || 'Account may be suspended or access denied',
      };
    }

    return { suspended: !response.ok };
  } catch {
    return { suspended: false };
  }
}

export { generatePKCE };
