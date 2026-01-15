/**
 * OAuth Service
 *
 * Handles OAuth 2.0 flows for authentication providers
 */

import {
  googleOAuthConfig,
  microsoftOAuthConfig,
  oktaOAuthConfig,
  validateOAuthConfig,
  OAuthConfig,
} from '../config/oauth.config.js';

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email?: boolean;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string,
  config: OAuthConfig = googleOAuthConfig
): Promise<OAuthTokenResponse> {
  if (!validateOAuthConfig(config)) {
    throw new Error('Invalid OAuth configuration');
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`OAuth token exchange failed: ${error.error || response.statusText}`);
  }

  return response.json();
}

/**
 * Get user information from OAuth provider
 */
export async function getUserInfo(
  accessToken: string,
  config: OAuthConfig = googleOAuthConfig
): Promise<OAuthUserInfo> {
  const response = await fetch(config.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`);
  }

  const data = await response.json();

  // Handle different OAuth provider response formats
  if (config === microsoftOAuthConfig) {
    // Microsoft Graph API format
    return {
      id: data.id || data.userPrincipalName,
      email: data.mail || data.userPrincipalName,
      name: data.displayName || data.givenName || '',
      picture: undefined,
      verified_email: true, // Microsoft emails are verified
    };
  }

  if (config === oktaOAuthConfig) {
    // Okta format
    return {
      id: data.sub,
      email: data.email,
      name: data.name || '',
      picture: data.picture,
      verified_email: data.email_verified !== false,
    };
  }

  // Google format (default)
  return {
    id: data.id || data.sub,
    email: data.email,
    name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim(),
    picture: data.picture,
    verified_email: data.verified_email || data.email_verified,
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  config: OAuthConfig = googleOAuthConfig
): Promise<OAuthTokenResponse> {
  if (!validateOAuthConfig(config)) {
    throw new Error('Invalid OAuth configuration');
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Token refresh failed: ${error.error || response.statusText}`);
  }

  return response.json();
}
