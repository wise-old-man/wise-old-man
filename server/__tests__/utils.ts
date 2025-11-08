import MockAdapter from 'axios-mock-adapter/types';
import fs from 'fs';
import prisma from '../src/prisma';
import { getBaseHiscoresUrl, HiscoresDataSchema } from '../src/services/jagex.service';
import { PlayerType, SKILLS } from '../src/types';

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
  const modelNames = Object.keys(prisma).filter(k => k !== 'constructor' && !['_', '$'].includes(k[0]));

  for (const model of modelNames) {
    await prisma[model].deleteMany();
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function registerHiscoresMock(adapter: MockAdapter, config: HiscoresMockConfig) {
  let localAdapter = adapter;

  for (const [key, value] of Object.entries(config)) {
    localAdapter = localAdapter
      .onGet(new RegExp(getBaseHiscoresUrl(key as PlayerType)))
      .reply(value.statusCode, value.rawData || '');
  }

  return localAdapter;
}

export function emptyHiscoresData(rawData: string) {
  const parsed = HiscoresDataSchema.parse(JSON.parse(rawData));

  for (const skill of parsed.skills) {
    skill.xp = 0;
    skill.level = 1;
    skill.rank = -1;
  }

  for (const activity of parsed.activities) {
    activity.score = 0;
    activity.rank = -1;
  }

  return JSON.stringify(parsed);
}

export function modifyRawHiscoresData(
  rawData: string,
  modifications: Array<{ hiscoresMetricName: string; value: number }>
) {
  const parsed = HiscoresDataSchema.parse(JSON.parse(rawData));

  for (const modification of modifications) {
    if (
      modification.hiscoresMetricName === 'Runecraft' ||
      SKILLS.includes(modification.hiscoresMetricName.toLowerCase())
    ) {
      for (const skill of parsed.skills) {
        if (skill.name === modification.hiscoresMetricName) {
          skill.xp = modification.value;
        }
      }
    } else {
      for (const activity of parsed.activities) {
        if (activity.name === modification.hiscoresMetricName) {
          activity.score = modification.value;
        }
      }
    }
  }

  return JSON.stringify(parsed);
}

export { readFile, registerHiscoresMock, resetDatabase, sleep };
