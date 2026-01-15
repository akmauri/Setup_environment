/**
 * OAuth Configuration
 *
 * Centralized configuration for OAuth providers
 * Supports Google OAuth 2.0 and can be extended for other providers
 */

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

/**
 * Google OAuth 2.0 Configuration
 */
export const googleOAuthConfig: OAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google',
  scopes: [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
  authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
};

/**
 * Validate OAuth configuration
 */
export function validateOAuthConfig(config: OAuthConfig): boolean {
  return !!(
    config.clientId &&
    config.clientSecret &&
    config.redirectUri &&
    config.scopes.length > 0
  );
}

/**
 * Get Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state?: string): string {
  const config = googleOAuthConfig;
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    ...(state && { state }),
  });

  return `${config.authorizationUrl}?${params.toString()}`;
}
