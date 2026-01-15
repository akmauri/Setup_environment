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
 * Microsoft OAuth 2.0 Configuration
 */
export const microsoftOAuthConfig: OAuthConfig = {
  clientId: process.env.MICROSOFT_CLIENT_ID || '',
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
  redirectUri:
    process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/microsoft',
  scopes: ['openid', 'profile', 'email', 'User.Read'],
  authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
};

/**
 * Okta OAuth 2.0 Configuration
 */
export const oktaOAuthConfig: OAuthConfig = {
  clientId: process.env.OKTA_CLIENT_ID || '',
  clientSecret: process.env.OKTA_CLIENT_SECRET || '',
  redirectUri: process.env.OKTA_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/okta',
  scopes: ['openid', 'profile', 'email'],
  authorizationUrl: process.env.OKTA_ISSUER ? `${process.env.OKTA_ISSUER}/v1/authorize` : '',
  tokenUrl: process.env.OKTA_ISSUER ? `${process.env.OKTA_ISSUER}/v1/token` : '',
  userInfoUrl: process.env.OKTA_ISSUER ? `${process.env.OKTA_ISSUER}/v1/userinfo` : '',
};

/**
 * Get OAuth authorization URL for a provider
 */
export function getOAuthAuthUrl(provider: 'google' | 'microsoft' | 'okta', state?: string): string {
  let config: OAuthConfig;
  let additionalParams: Record<string, string> = {};

  switch (provider) {
    case 'google':
      config = googleOAuthConfig;
      additionalParams = {
        access_type: 'offline',
        prompt: 'consent',
      };
      break;
    case 'microsoft':
      config = microsoftOAuthConfig;
      additionalParams = {
        response_mode: 'query',
      };
      break;
    case 'okta':
      config = oktaOAuthConfig;
      break;
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    ...additionalParams,
    ...(state && { state }),
  });

  return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * Get Google OAuth authorization URL (backward compatibility)
 */
export function getGoogleAuthUrl(state?: string): string {
  return getOAuthAuthUrl('google', state);
}
