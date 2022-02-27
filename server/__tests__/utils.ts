import fs from 'fs';
import { PlayerType } from '@wise-old-man/utils';
import MockAdapter from 'axios-mock-adapter/types';
import prisma from '../src/prisma';
import { OSRS_HISCORES } from '../src/api/constants';

async function readFile(path: string) {
  const content = await fs.readFileSync(path, { encoding: 'utf8' });
  return content;
}

async function resetDatabase() {
  const modelNames = Object.keys(prisma).filter(k => !k.startsWith('_'));
  await Promise.all(modelNames.map(async model => prisma[model].deleteMany()));
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function registerCMLMock(adapter: MockAdapter, statusCode: number, rawData?: string) {
  return adapter.onGet(new RegExp(`crystalmathlabs.com`)).reply(statusCode, rawData || '');
}

type HiscoresMockConfig = {
  [playerType in PlayerType]?: {
    statusCode: number;
    rawData?: string;
  };
};

function registerHiscoresMock(adapter: MockAdapter, config: HiscoresMockConfig) {
  let localAdapter = adapter;

  for (const [key, value] of Object.entries(config)) {
    localAdapter = localAdapter
      .onGet(new RegExp(OSRS_HISCORES[key]))
      .reply(value.statusCode, value.rawData || '');
  }

  return localAdapter;
}

export { resetDatabase, sleep, readFile, registerCMLMock, registerHiscoresMock };
