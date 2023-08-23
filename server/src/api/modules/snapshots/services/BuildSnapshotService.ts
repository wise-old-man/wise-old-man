import { z } from 'zod';
import csv from 'csvtojson';
import { BOSSES, ACTIVITIES, Metric, SKILLS, getMetricRankKey, getMetricValueKey } from '../../../../utils';
import { Snapshot } from '../../../../prisma';
import { ServerError } from '../../../errors';
import { SnapshotDataSource } from '../snapshot.types';

// Skip Deadman Points and Legacy Bounty Hunter (hunter/rogue)
export const SKIPPED_ACTIVITY_INDICES = [1, 4, 5];

const inputSchema = z.object({
  playerId: z.number().int().positive(),
  rawCSV: z.string().min(1),
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
  if (rows.length !== SKILLS.length + ACTIVITIES.length + BOSSES.length + SKIPPED_ACTIVITY_INDICES.length) {
    throw new ServerError('The OSRS Hiscores were updated. Please wait for a fix.');
  }

  const snapshotFields = {
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
  for (let i = 0; i < ACTIVITIES.length + SKIPPED_ACTIVITY_INDICES.length; i++) {
    if (SKIPPED_ACTIVITY_INDICES.includes(i)) continue;

    const [rank, score] = rows[SKILLS.length + i];
    const skippedCount = SKIPPED_ACTIVITY_INDICES.filter(x => x < i).length;

    const activity = ACTIVITIES[i - skippedCount];

    snapshotFields[getMetricRankKey(activity)] = parseInt(rank);
    snapshotFields[getMetricValueKey(activity)] = parseInt(score);
  }

  // Populate the bosses' values with the values from the csv
  BOSSES.forEach((s, i) => {
    const [rank, kills] = rows[SKILLS.length + ACTIVITIES.length + SKIPPED_ACTIVITY_INDICES.length + i];

    snapshotFields[getMetricRankKey(s)] = parseInt(rank);
    snapshotFields[getMetricValueKey(s)] = parseInt(kills);
  });

  return snapshotFields as Snapshot;
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

  const snapshotFields = {
    playerId,
    importedAt: new Date(),
    createdAt: new Date(parseInt(timestamp, 10) * 1000) // CML stores timestamps in seconds, we need milliseconds
  };

  // Populate the skills' values with experience and rank data
  SKILLS.forEach((s, i) => {
    snapshotFields[getMetricRankKey(s)] = parseInt(ranks[i]);
    snapshotFields[getMetricValueKey(s)] = parseInt(exps[i]);
  });

  return snapshotFields as Snapshot;
}

export { buildSnapshot };
