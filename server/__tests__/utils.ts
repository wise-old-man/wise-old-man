import fs from 'fs';
import { Metric, METRICS } from '@wise-old-man/utils';
import MockAdapter from 'axios-mock-adapter/types';
import prisma, { PlayerTypeEnum } from '../src/prisma';
import { OSRS_HISCORES } from '../src/api/constants';

type HiscoresMockConfig = {
  [playerType in PlayerTypeEnum]?: {
    statusCode: number;
    rawData?: string;
  };
};

async function readFile(path: string) {
  return fs.readFileSync(path, { encoding: 'utf8' });
}

async function resetDatabase() {
  const modelNames = Object.keys(prisma).filter(k => !k.startsWith('_'));
  await Promise.all(modelNames.map(model => prisma[model].deleteMany()));
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function registerCMLMock(adapter: MockAdapter, statusCode: number, rawData?: string) {
  return adapter.onGet(new RegExp(`crystalmathlabs.com`)).reply(statusCode, rawData || '');
}

function registerHiscoresMock(adapter: MockAdapter, config: HiscoresMockConfig) {
  let localAdapter = adapter;

  for (const [key, value] of Object.entries(config)) {
    localAdapter = localAdapter
      .onGet(new RegExp(OSRS_HISCORES[key]))
      .reply(value.statusCode, value.rawData || '');
  }

  return localAdapter;
}

function modifyRawHiscoresData(rawData: string, modifications: { metric: Metric; value: number }[]): string {
  return rawData
    .split('\n')
    .map((row, index) => {
      let modifiedRow;

      modifications.forEach(m => {
        if (METRICS.indexOf(m.metric) === index) {
          const bits = row.split(',');
          bits[bits.length - 1] = m.value.toString();
          modifiedRow = bits.join(',');
        }
      });

      return modifiedRow || row;
    })
    .join('\n');
}

export { resetDatabase, sleep, readFile, registerCMLMock, registerHiscoresMock, modifyRawHiscoresData };
