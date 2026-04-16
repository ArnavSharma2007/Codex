module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
    '^lenis$': '<rootDir>/src/tests/__mocks__/fileMock.js',
  },
  testMatch: ['**/tests/**/*.test.jsx', '**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/tests/**'],
  verbose: true,
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
};

