import fs from 'fs';
import MockAdapter from 'axios-mock-adapter/types';
import prisma from '../src/prisma';
import redisService from '../src/api/services/external/redis.service';
import { OSRS_HISCORES_URLS } from '../src/api/services/external/jagex.service';
import { PlayerType, METRICS, Metric, SKILLS } from '../src/utils';
import { SKIPPED_ACTIVITY_INDICES } from '../src/api/modules/snapshots/snapshot.utils';

type HiscoresMockConfig = {
  [playerType in PlayerType]?: {
    statusCode: number;
    rawData?: string;
  };
};

async function readFile(path: string) {
  return fs.readFileSync(path, { encoding: 'utf8' });
}

async function resetDatabase() {
  const modelNames = Object.keys(prisma).filter(k => !['_', '$'].includes(k[0]));

  for (const model of modelNames) {
    await prisma[model].deleteMany();
  }
}

async function resetRedis() {
  await redisService.flushAll();
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function registerCMLMock(adapter: MockAdapter, statusCode: number, rawData?: string) {
  return adapter.onGet(new RegExp(`crystalmathlabs.com`)).reply(statusCode, rawData || '');
}

function registerTempleMock(adapter: MockAdapter, statusCode: number, rawData?: string) {
  return adapter.onGet(new RegExp(`templeosrs.com`)).reply(statusCode, rawData || '');
}

function registerHiscoresMock(adapter: MockAdapter, config: HiscoresMockConfig) {
  let localAdapter = adapter;

  for (const [key, value] of Object.entries(config)) {
    localAdapter = localAdapter
      .onGet(new RegExp(OSRS_HISCORES_URLS[key]))
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
        let metricIndex = METRICS.indexOf(m.metric);

        // Account for skipped metrics
        if (metricIndex >= SKILLS.length + SKIPPED_ACTIVITY_INDICES.length) {
          // after the last skipped index, just add the total number of skips
          metricIndex += SKIPPED_ACTIVITY_INDICES.length;
        } else {
          // within the skipped indices range, add the number of skips before the current index
          metricIndex += SKIPPED_ACTIVITY_INDICES.filter(i => i + SKILLS.length < index).length;
        }

        if (metricIndex === index) {
          const bits = row.split(',');
          bits[bits.length - 1] = m.value.toString();
          modifiedRow = bits.join(',');
        }
      });

      return modifiedRow || row;
    })
    .join('\n');
}

export {
  resetDatabase,
  resetRedis,
  sleep,
  readFile,
  registerCMLMock,
  registerTempleMock,
  registerHiscoresMock,
  modifyRawHiscoresData
};
