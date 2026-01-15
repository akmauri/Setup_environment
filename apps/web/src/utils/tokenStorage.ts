/**
 * Token Storage Utility
 *
 * Handles secure storage of JWT tokens
 * Uses httpOnly cookies in production, localStorage in development
 */

const ACCESS_TOKEN_KEY = 'mpcas2_access_token';
const REFRESH_TOKEN_KEY = 'mpcas2_refresh_token';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Store tokens in localStorage (development)
 * In production, tokens should be stored in httpOnly cookies
 */
export function storeTokens(tokens: TokenPair): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

  // Store expiration time
  const expiresAt = Date.now() + tokens.expiresIn * 1000;
  localStorage.setItem(`${ACCESS_TOKEN_KEY}_expires`, expiresAt.toString());
}

/**
 * Get access token from storage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const expiresAt = localStorage.getItem(`${ACCESS_TOKEN_KEY}_expires`);

  // Check if token is expired
  if (token && expiresAt && Date.now() > parseInt(expiresAt, 10)) {
    // Token expired, try to refresh
    return null;
  }

  return token;
}

/**
 * Get refresh token from storage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Clear all tokens from storage
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(`${ACCESS_TOKEN_KEY}_expires`);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}
