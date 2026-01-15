/**
 * OAuth Service Tests
 */

import { exchangeCodeForToken, getUserInfo, refreshAccessToken } from '../oauth.service.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('OAuth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange authorization code for tokens', async () => {
      const mockResponse = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await exchangeCodeForToken('test-code');

      expect(result.access_token).toBe(mockResponse.access_token);
      expect(result.refresh_token).toBe(mockResponse.refresh_token);
      expect(result.expires_in).toBe(mockResponse.expires_in);
    });

    it('should throw error on failed token exchange', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({ error: 'invalid_grant' }),
      });

      await expect(exchangeCodeForToken('invalid-code')).rejects.toThrow();
    });
  });

  describe('getUserInfo', () => {
    it('should fetch user information from OAuth provider', async () => {
      const mockUserInfo = {
        id: 'google-user-123',
        email: 'user@example.com',
        name: 'Test User',
        picture: 'https://example.com/pic.jpg',
        verified_email: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserInfo,
      });

      const result = await getUserInfo('test-access-token');

      expect(result.id).toBe(mockUserInfo.id);
      expect(result.email).toBe(mockUserInfo.email);
      expect(result.name).toBe(mockUserInfo.name);
      expect(result.picture).toBe(mockUserInfo.picture);
    });

    it('should throw error on failed user info fetch', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(getUserInfo('invalid-token')).rejects.toThrow();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token using refresh token', async () => {
      const mockResponse = {
        access_token: 'new-access-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await refreshAccessToken('test-refresh-token');

      expect(result.access_token).toBe(mockResponse.access_token);
      expect(result.expires_in).toBe(mockResponse.expires_in);
    });

    it('should throw error on failed token refresh', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'invalid_grant' }),
      });

      await expect(refreshAccessToken('invalid-refresh-token')).rejects.toThrow();
    });
  });
});
