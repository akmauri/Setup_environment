/**
 * Instagram Service
 *
 * Handles Instagram-specific OAuth and API operations via Facebook Graph API
 */

import { facebookOAuthConfig } from '../config/oauth.config.js';
import { exchangeCodeForToken, OAuthTokenResponse } from './oauth.service.js';

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
    username?: string;
  };
}

export interface InstagramAccountInfo {
  id: string;
  username: string;
  account_type?: 'BUSINESS' | 'CREATOR' | 'PERSONAL';
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
  is_verified?: boolean;
}

/**
 * Exchange authorization code for Facebook tokens
 */
export async function exchangeFacebookCode(code: string): Promise<OAuthTokenResponse> {
  return exchangeCodeForToken(code, facebookOAuthConfig);
}

/**
 * Exchange short-lived token for long-lived token (60 days)
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${facebookOAuthConfig.clientId}&client_secret=${facebookOAuthConfig.clientSecret}&fb_exchange_token=${shortLivedToken}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to exchange for long-lived token: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    expires_in: data.expires_in || 5184000, // 60 days in seconds
  };
}

/**
 * Get Facebook Pages for user
 */
export async function getFacebookPages(accessToken: string): Promise<FacebookPage[]> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to fetch Facebook Pages: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Get Instagram account connected to Facebook Page
 */
export async function getInstagramAccountFromPage(
  pageId: string,
  pageAccessToken: string
): Promise<InstagramAccountInfo> {
  // First, get the Instagram Business Account ID from the page
  const pageResponse = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account{id,username}`,
    {
      headers: {
        Authorization: `Bearer ${pageAccessToken}`,
      },
    }
  );

  if (!pageResponse.ok) {
    const error = await pageResponse.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to fetch Instagram account from page: ${error.error?.message || pageResponse.statusText}`
    );
  }

  const pageData = await pageResponse.json();

  if (!pageData.instagram_business_account) {
    throw new Error('No Instagram account connected to this Facebook Page');
  }

  const instagramAccountId = pageData.instagram_business_account.id;

  // Get Instagram account details
  const instagramResponse = await fetch(
    `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=id,username,account_type,profile_picture_url,followers_count,media_count`,
    {
      headers: {
        Authorization: `Bearer ${pageAccessToken}`,
      },
    }
  );

  if (!instagramResponse.ok) {
    const error = await instagramResponse.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to fetch Instagram account info: ${error.error?.message || instagramResponse.statusText}`
    );
  }

  const instagramData = await instagramResponse.json();

  // Check if account is Professional (Business or Creator)
  if (instagramData.account_type !== 'BUSINESS' && instagramData.account_type !== 'CREATOR') {
    throw new Error(
      'Instagram account must be a Professional account (Business or Creator) to connect'
    );
  }

  // Get verification status (requires separate API call)
  let isVerified = false;
  try {
    const verificationResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=is_verified`,
      {
        headers: {
          Authorization: `Bearer ${pageAccessToken}`,
        },
      }
    );
    if (verificationResponse.ok) {
      const verificationData = await verificationResponse.json();
      isVerified = verificationData.is_verified || false;
    }
  } catch {
    // Verification status is optional, continue if it fails
  }

  return {
    id: instagramData.id,
    username: instagramData.username || '',
    account_type: instagramData.account_type as 'BUSINESS' | 'CREATOR' | 'PERSONAL',
    profile_picture_url: instagramData.profile_picture_url,
    followers_count: instagramData.followers_count
      ? parseInt(instagramData.followers_count, 10)
      : undefined,
    media_count: instagramData.media_count ? parseInt(instagramData.media_count, 10) : undefined,
    is_verified: isVerified,
  };
}

/**
 * Refresh long-lived Instagram token
 */
export async function refreshInstagramToken(
  longLivedToken: string
): Promise<{ access_token: string; expires_in: number }> {
  // Facebook long-lived tokens can be refreshed by exchanging again
  // This extends the token for another 60 days
  return exchangeForLongLivedToken(longLivedToken);
}

/**
 * Revoke Instagram/Facebook token
 */
export async function revokeInstagramToken(token: string): Promise<void> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/permissions?access_token=${token}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    // Token revocation is best-effort, don't throw if it fails
    console.error('Failed to revoke Instagram token:', await response.text());
  }
}

/**
 * Validate Instagram token by making a test API call
 */
export async function validateInstagramToken(accessToken: string): Promise<boolean> {
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
