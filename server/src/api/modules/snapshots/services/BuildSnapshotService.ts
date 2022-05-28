import { z } from 'zod';
import csv from 'csvtojson';
import {
  BOSSES,
  ACTIVITIES,
  Metric,
  SKILLS,
  getMetricRankKey,
  getMetricValueKey
} from '../../../../utils/metrics';
import { Snapshot } from '../../../../prisma';
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
  if (rows.length !== SKILLS.length + ACTIVITIES.length + BOSSES.length) {
    throw new ServerError('The OSRS Hiscores were updated. Please wait for a fix.');
  }

  const snapshotFields: any = {
    playerId,
    createdAt: new Date()
  };

  // Populate the skills' values with the values from the csv
  SKILLS.forEach((s, i) => {
    const [rank, , experience] = rows[i];
    const expNum = parseInt(experience);

    snapshotFields[getMetricRankKey(s)] = parseInt(rank);
    snapshotFields[getMetricValueKey(s)] = s === Metric.OVERALL && expNum === 0 ? -1 : expNum;
  });

  // Populate the activities' values with the values from the csv
  ACTIVITIES.forEach((s, i) => {
    const [rank, score] = rows[SKILLS.length + i];
    snapshotFields[getMetricRankKey(s)] = parseInt(rank);
    snapshotFields[getMetricValueKey(s)] = parseInt(score);
  });

  // Populate the bosses' values with the values from the csv
  BOSSES.forEach((s, i) => {
    const [rank, kills] = rows[SKILLS.length + ACTIVITIES.length + i];
    snapshotFields[getMetricRankKey(s)] = parseInt(rank);
    snapshotFields[getMetricValueKey(s)] = parseInt(kills);
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
  if (exps.length !== SKILLS.length || ranks.length !== SKILLS.length) {
    throw new ServerError('The CML API was updated. Please wait for a fix.');
  }

  const snapshotFields: any = {
    playerId,
    importedAt: new Date(),
    // CML stores timestamps in seconds, we need milliseconds
    createdAt: new Date(parseInt(timestamp, 10) * 1000)
  };

  // Populate the skills' values with experience and rank data
  SKILLS.forEach((s, i) => {
    snapshotFields[getMetricRankKey(s)] = parseInt(ranks[i]);
    snapshotFields[getMetricValueKey(s)] = parseInt(exps[i]);
  });

  return snapshotFields;
}

export { buildSnapshot };
