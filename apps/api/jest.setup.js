// Jest setup file
// Set up test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-min-32-chars-long-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-chars-long-for-testing';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';
