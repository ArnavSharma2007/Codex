module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['**/*.js', '!**/node_modules/**', '!**/tests/**', '!jest.config.js'],
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  testTimeout: 30000,
  reporters: ['default'],
  verbose: true,
};

