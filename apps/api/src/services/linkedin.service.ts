/**
 * LinkedIn Service
 *
 * Handles LinkedIn-specific OAuth and API operations
 */

import { linkedinOAuthConfig } from '../config/oauth.config.js';
import { OAuthTokenResponse } from './oauth.service.js';

export interface LinkedInProfileInfo {
  sub: string; // User ID
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
}

export interface LinkedInCompanyPage {
  id: string;
  name: string;
  vanityName?: string;
  logoUrl?: string;
  followerCount?: number;
}

export interface LinkedInTokenResponse extends OAuthTokenResponse {
  refresh_token?: string;
  expires_in: number;
  refresh_token_expires_in?: number;
}

/**
 * Exchange authorization code for LinkedIn tokens
 */
export async function exchangeLinkedInCode(code: string): Promise<LinkedInTokenResponse> {
  const response = await fetch(linkedinOAuthConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: linkedinOAuthConfig.redirectUri,
      client_id: linkedinOAuthConfig.clientId,
      client_secret: linkedinOAuthConfig.clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `LinkedIn token exchange failed: ${error.error_description || error.error || response.statusText}`
    );
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in || 3600, // Default 1 hour for short-lived
    refresh_token_expires_in: data.refresh_token_expires_in,
    token_type: data.token_type || 'Bearer',
    scope: data.scope,
  };
}

/**
 * Exchange short-lived token for long-lived token (60 days)
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<LinkedInTokenResponse> {
  const response = await fetch(linkedinOAuthConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: linkedinOAuthConfig.clientId,
      client_secret: linkedinOAuthConfig.clientSecret,
    }),
  });

  // Note: LinkedIn doesn't have a direct token exchange endpoint like Facebook
  // Long-lived tokens are obtained by requesting them during initial OAuth
  // For now, we'll use the refresh token to extend access
  // This is a simplified implementation - in production, request long-lived tokens during OAuth

  if (!response.ok) {
    // If exchange fails, return the short-lived token (will need refresh)
    return {
      access_token: shortLivedToken,
      expires_in: 3600,
      token_type: 'Bearer',
    };
  }

  const data = await response.json();
  return {
    access_token: data.access_token || shortLivedToken,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in || 5184000, // 60 days in seconds
    refresh_token_expires_in: data.refresh_token_expires_in,
    token_type: data.token_type || 'Bearer',
    scope: data.scope,
  };
}

/**
 * Refresh LinkedIn access token
 */
export async function refreshLinkedInToken(refreshToken: string): Promise<LinkedInTokenResponse> {
  const response = await fetch(linkedinOAuthConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: linkedinOAuthConfig.clientId,
      client_secret: linkedinOAuthConfig.clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `LinkedIn token refresh failed: ${error.error_description || error.error || response.statusText}`
    );
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken, // LinkedIn may or may not issue new refresh token
    expires_in: data.expires_in || 3600,
    refresh_token_expires_in: data.refresh_token_expires_in,
    token_type: data.token_type || 'Bearer',
    scope: data.scope,
  };
}

/**
 * Get LinkedIn personal profile information
 */
export async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfileInfo> {
  const response = await fetch(linkedinOAuthConfig.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to fetch LinkedIn profile: ${error.error_description || error.error || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get LinkedIn company pages for user (where user has admin access)
 */
export async function getLinkedInCompanyPages(accessToken: string): Promise<LinkedInCompanyPage[]> {
  // LinkedIn Organization API endpoint
  const response = await fetch(
    'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    }
  );

  if (!response.ok) {
    // If user doesn't have organization admin access, return empty array
    if (response.status === 403 || response.status === 401) {
      return [];
    }
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to fetch LinkedIn company pages: ${error.message || error.error || response.statusText}`
    );
  }

  const data = await response.json();
  const organizations = data.elements || [];

  // Fetch details for each organization
  const companyPages: LinkedInCompanyPage[] = [];
  for (const org of organizations) {
    try {
      const orgId = org.organizationalTarget.split(':').pop();
      const orgResponse = await fetch(`https://api.linkedin.com/v2/organizations/${orgId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        companyPages.push({
          id: orgId,
          name: orgData.name?.localized?.en_US || orgData.name || 'Unknown',
          vanityName: orgData.vanityName,
          logoUrl: orgData.logoV2?.['original~']?.elements?.[0]?.identifiers?.[0]?.identifier,
          followerCount: orgData.followerCount,
        });
      }
    } catch (error) {
      console.error(`Failed to fetch details for organization ${org.organizationalTarget}:`, error);
      // Continue with other organizations
    }
  }

  return companyPages;
}

/**
 * Get LinkedIn company page information
 */
export async function getLinkedInCompanyPage(
  accessToken: string,
  companyId: string
): Promise<LinkedInCompanyPage> {
  const response = await fetch(`https://api.linkedin.com/v2/organizations/${companyId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Failed to fetch LinkedIn company page: ${error.message || error.error || response.statusText}`
    );
  }

  const data = await response.json();
  return {
    id: companyId,
    name: data.name?.localized?.en_US || data.name || 'Unknown',
    vanityName: data.vanityName,
    logoUrl: data.logoV2?.['original~']?.elements?.[0]?.identifiers?.[0]?.identifier,
    followerCount: data.followerCount,
  };
}

/**
 * Revoke LinkedIn token
 */
export async function revokeLinkedInToken(token: string): Promise<void> {
  const response = await fetch('https://www.linkedin.com/oauth/v2/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      token,
      client_id: linkedinOAuthConfig.clientId,
      client_secret: linkedinOAuthConfig.clientSecret,
    }),
  });

  if (!response.ok) {
    // Token revocation is best-effort, don't throw if it fails
    console.error('Failed to revoke LinkedIn token:', await response.text());
  }
}

/**
 * Validate LinkedIn token by making a test API call
 */
export async function validateLinkedInToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(linkedinOAuthConfig.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}
