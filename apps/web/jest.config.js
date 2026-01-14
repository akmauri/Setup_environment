const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@mpcas2/shared$': '<rootDir>/../../packages/shared/src',
    '^@mpcas2/ui$': '<rootDir>/../../packages/ui/src',
  },
};

module.exports = createJestConfig(config);
