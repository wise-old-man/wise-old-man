import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  testEnvironment: 'node',
  transform: { '^.+\\.ts?$': 'ts-jest' },
  testPathIgnorePatterns: ['.d.ts', '.js']
};

export default config;
