module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js', '**/__tests__/**/*.js'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/**/*.{js,ts}',
      '!src/tests/**/*.js'
    ],
    verbose: true
  };