module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@controllers/(.*)': '<rootDir>/src/api/controllers/$1',
    '@services/(.*)': '<rootDir>/src/api/services/$1',
    '@routes/(.*)': '<rootDir>/src/api/routes/$1'
  }
};
