/**
 * Authentication Routes Integration Tests
 */

import request from 'supertest';
import express from 'express';
import authRoutes from '../auth.routes.js';

// Mock OAuth and JWT services before importing routes
jest.mock('../../services/oauth.service.js');
jest.mock('../../services/user.service.js');
jest.mock('../../services/jwt.service.js');
jest.mock('../../middleware/rateLimit.middleware.js', () => ({
  rateLimitMiddleware: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

describe('Auth Routes', () => {
  describe('GET /api/v1/auth/google', () => {
    it('should return OAuth URL', async () => {
      const response = await request(app).get('/api/v1/auth/google').expect(200);

      expect(response.body).toHaveProperty('authUrl');
      expect(response.body).toHaveProperty('state');
      expect(response.body.authUrl).toContain('accounts.google.com');
    });
  });

  describe('GET /api/v1/auth/callback/google', () => {
    it('should handle OAuth callback with valid code', async () => {
      const { exchangeCodeForToken } = require('../../services/oauth.service.js');
      const { getUserInfo } = require('../../services/oauth.service.js');
      const { handleOAuthUser } = require('../../services/user.service.js');
      const { generateTokenPair } = require('../../services/jwt.service.js');

      exchangeCodeForToken.mockResolvedValueOnce({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
      });

      getUserInfo.mockResolvedValueOnce({
        id: 'google-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/pic.jpg',
      });

      handleOAuthUser.mockResolvedValueOnce({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
        tenantId: 'tenant-456',
      });

      generateTokenPair.mockReturnValueOnce({
        accessToken: 'jwt-access-token',
        refreshToken: 'jwt-refresh-token',
        expiresIn: 900,
      });

      const response = await request(app)
        .get('/api/v1/auth/callback/google?code=test-code')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.tokens).toBeDefined();
    });

    it('should return error for missing code', async () => {
      const response = await request(app).get('/api/v1/auth/callback/google').expect(400);

      expect(response.body.error.code).toBe('MISSING_CODE');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const { verifyRefreshToken } = require('../../services/jwt.service.js');
      const { generateTokenPair } = require('../../services/jwt.service.js');

      verifyRefreshToken.mockReturnValueOnce({
        userId: 'user-123',
        tenantId: 'tenant-456',
        email: 'test@example.com',
        role: 'user',
      });

      generateTokenPair.mockReturnValueOnce({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tokens).toBeDefined();
    });

    it('should return error for missing refresh token', async () => {
      const response = await request(app).post('/api/v1/auth/refresh').send({}).expect(400);

      expect(response.body.error.code).toBe('MISSING_REFRESH_TOKEN');
    });
  });
});
