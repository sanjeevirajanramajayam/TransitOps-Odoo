module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/dist/tests/**/*.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000
}
