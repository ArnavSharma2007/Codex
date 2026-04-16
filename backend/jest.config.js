module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['**/*.js', '!**/node_modules/**', '!**/tests/**', '!jest.config.js'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  testTimeout: 30000,
  reporters: ['default'],
  verbose: true,
};

