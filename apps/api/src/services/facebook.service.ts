/**
 * Facebook Service
 *
 * Handles Facebook-specific OAuth and API operations for Facebook Pages
 */

import { facebookPagesOAuthConfig } from '../config/oauth.config.js';
import { exchangeCodeForToken, OAuthTokenResponse } from './oauth.service.js';

export interface FacebookPageInfo {
  id: string;
  name: string;
  access_token: string; // Long-lived Page Access Token
  category?: string;
  picture?: {
    data: {
      url: string;
    };
  };
  followers_count?: number;
  fan_count?: number;
  link?: string;
  verified?: boolean;
}

export interface FacebookUserPages {
  data: FacebookPageInfo[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
  };
}

export interface FacebookTokenResponse extends Omit<OAuthTokenResponse, 'expires_in'> {
  expires_in: number;
}

/**
 * Exchange authorization code for Facebook user token
 */
export async function exchangeFacebookCode(code: string): Promise<FacebookTokenResponse> {
  return exchangeCodeForToken(code, facebookPagesOAuthConfig);
}

/**
 * Exchange short-lived user token for long-lived user token
 */
export async function exchangeForLongLivedUserToken(
  shortLivedToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${facebookPagesOAuthConfig.clientId}&client_secret=${facebookPagesOAuthConfig.clientSecret}&fb_exchange_token=${shortLivedToken}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to exchange for long-lived user token: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    expires_in: data.expires_in || 5184000, // 60 days in seconds
  };
}

/**
 * Get Facebook Pages for user (where user has Admin or Editor role)
 */
export async function getFacebookPagesForUser(
  userAccessToken: string
): Promise<FacebookPageInfo[]> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,category,picture,followers_count,fan_count,link,is_verified&limit=100`,
    {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to fetch Facebook Pages: ${error.error?.message || response.statusText}`
    );
  }

  const data: FacebookUserPages = await response.json();
  return data.data || [];
}

/**
 * Get Facebook Page information
 */
export async function getFacebookPageInfo(
  pageId: string,
  pageAccessToken: string
): Promise<FacebookPageInfo> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}?fields=id,name,access_token,category,picture,followers_count,fan_count,link,is_verified`,
    {
      headers: {
        Authorization: `Bearer ${pageAccessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to fetch Facebook Page info: ${error.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Exchange user token for Page Access Token (long-lived, never expires)
 */
export async function getPageAccessToken(pageId: string, userAccessToken: string): Promise<string> {
  // Get page access token from /me/accounts endpoint
  const pages = await getFacebookPagesForUser(userAccessToken);
  const page = pages.find((p) => p.id === pageId);

  if (!page) {
    throw new Error('Facebook Page not found or user does not have access');
  }

  // Page Access Tokens from /me/accounts are already long-lived
  // They never expire unless revoked
  return page.access_token;
}

/**
 * Validate Facebook token by making a test API call
 */
export async function validateFacebookToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://graph.facebook.com/v18.0/me', {
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
 * Revoke Facebook token
 */
export async function revokeFacebookToken(token: string): Promise<void> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/permissions?access_token=${token}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    // Token revocation is best-effort, don't throw if it fails
    console.error('Failed to revoke Facebook token:', await response.text());
  }
}

/**
 * Check if Instagram account is connected to Facebook Page
 */
export async function getInstagramAccountForPage(
  pageId: string,
  pageAccessToken: string
): Promise<{ id: string; username?: string } | null> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account{id,username}`,
      {
        headers: {
          Authorization: `Bearer ${pageAccessToken}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.instagram_business_account || null;
  } catch {
    return null;
  }
}
