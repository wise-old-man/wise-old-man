import { z } from 'zod';
import csv from 'csvtojson';
import { getMetricRankKey, getMetricValueKey } from '@wise-old-man/utils';
import { Activities, Bosses, MetricEnum, Skills, Snapshot } from '../../../../prisma';
import { ServerError } from '../../../errors';
import { SnapshotDataSource } from '../snapshot.types';

const inputSchema = z.object({
  playerId: z.number().int().positive(),
  rawCSV: z.string().nonempty(),
  source: z.nativeEnum(SnapshotDataSource).default(SnapshotDataSource.HISCORES)
});

type BuildSnapshotParams = z.infer<typeof inputSchema>;

async function buildSnapshot(payload: BuildSnapshotParams): Promise<Snapshot> {
  const { playerId, rawCSV, source } = inputSchema.parse(payload);

  if (source === SnapshotDataSource.CRYSTAL_MATH_LABS) {
    return await buildFromCML(playerId, rawCSV);
  }

  return await buildFromRS(playerId, rawCSV);
}

async function buildFromRS(playerId: number, rawCSV: string) {
  // Convert the CSV text into an array of values
  // Ex: for skills, each row is [rank, level, experience]
  const rows = await csv({ noheader: true, output: 'csv' }).fromString(rawCSV);

  // If a new skill/activity/boss was added to the hiscores,
  // prevent any further snapshot saves to prevent incorrect DB data
  if (rows.length !== Skills.length + Activities.length + Bosses.length) {
    throw new ServerError('The OSRS Hiscores were updated. Please wait for a fix.');
  }

  const snapshotFields: any = {
    playerId,
    createdAt: new Date()
  };

  // Populate the skills' values with the values from the csv
  Skills.forEach((s, i) => {
    const [rank, , experience] = rows[i];
    const expNum = parseInt(experience);

    snapshotFields[getMetricRankKey(s as any)] = parseInt(rank);
    snapshotFields[getMetricValueKey(s as any)] = s === MetricEnum.OVERALL && expNum === 0 ? -1 : expNum;
  });

  // Populate the activities' values with the values from the csv
  Activities.forEach((s, i) => {
    const [rank, score] = rows[Skills.length + i];
    snapshotFields[getMetricRankKey(s as any)] = parseInt(rank);
    snapshotFields[getMetricValueKey(s as any)] = parseInt(score);
  });

  // Populate the bosses' values with the values from the csv
  Bosses.forEach((s, i) => {
    const [rank, kills] = rows[Skills.length + Activities.length + i];
    snapshotFields[getMetricRankKey(s as any)] = parseInt(rank);
    snapshotFields[getMetricValueKey(s as any)] = parseInt(kills);
  });

  return snapshotFields;
}

async function buildFromCML(playerId: number, rawCSV: string) {
  // CML separates the data "blocks" by a space, for whatever reason.
  // These blocks are the datapoint timestamp, and the experience and rank arrays respectively.
  const rows = rawCSV.split(' ');
  const [timestamp, experienceCSV, ranksCSV] = rows;

  // Convert the experience and rank from CSV data into arrays
  const exps = (await csv({ noheader: true, output: 'csv' }).fromString(experienceCSV))[0];
  const ranks = (await csv({ noheader: true, output: 'csv' }).fromString(ranksCSV))[0];

  // If a new skill/activity/boss was added to the CML API,
  // prevent any further snapshot saves to prevent incorrect DB data
  if (exps.length !== Skills.length || ranks.length !== Skills.length) {
    throw new ServerError('The CML API was updated. Please wait for a fix.');
  }

  const snapshotFields: any = {
    playerId,
    importedAt: new Date(),
    // CML stores timestamps in seconds, we need milliseconds
    createdAt: new Date(parseInt(timestamp, 10) * 1000)
  };

  // Populate the skills' values with experience and rank data
  Skills.forEach((s, i) => {
    snapshotFields[getMetricRankKey(s as any)] = parseInt(ranks[i]);
    snapshotFields[getMetricValueKey(s as any)] = parseInt(exps[i]);
  });

  return snapshotFields;
}

export { buildSnapshot };
