import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  testEnvironment: 'node',
  transform: { '^.+\\.ts?$': 'ts-jest' }
};

export default config;
