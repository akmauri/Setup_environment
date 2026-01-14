/** @type {import('jest').Config} */
module.exports = {
  projects: [
    '<rootDir>/apps/web',
    '<rootDir>/apps/api',
    '<rootDir>/packages/shared',
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**',
    '!**/coverage/**',
  ],
};
