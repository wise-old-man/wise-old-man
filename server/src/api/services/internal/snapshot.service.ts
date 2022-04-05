import csv from 'csvtojson';
import {
  ACTIVITIES,
  BOSSES,
  SKILLS,
  getMetricRankKey,
  getMetricValueKey,
  Metrics
} from '@wise-old-man/utils';
import { Snapshot } from '../../../database/models';
import { ServerError } from '../../errors';

/**
 * Saves all supplied snapshots, ignoring any duplicates by playerId and createdAt.
 * Note: This only works if all the supplied snaphots are from a single player.
 */
async function saveAll(snapshotFragments): Promise<Snapshot[]> {
  if (snapshotFragments.length === 0) return [];

  const existingSnapshots = await Snapshot.findAll({
    where: { playerId: snapshotFragments[0].playerId }
  });

  const existingVals = existingSnapshots.map(({ playerId, createdAt }) => {
    return JSON.stringify({ playerId, timestamp: createdAt.getTime() });
  });

  // Filter out any repeated snapshots
  const newVals = snapshotFragments.filter(({ playerId, createdAt }) => {
    return !existingVals.includes(JSON.stringify({ playerId, timestamp: createdAt.getTime() }));
  });

  if (!newVals || !newVals.length) {
    return [];
  }

  const results = await Snapshot.bulkCreate(newVals);
  return results;
}

/**
 * Converts a CSV row imported from the CML API into a Snapshot object.
 */
async function legacy_fromCML(playerId: number, historyRow: string) {
  // CML separates the data "blocks" by a space, for whatever reason.
  // These blocks are the datapoint timestamp, and the experience and rank arrays respectively.
  const rows = historyRow.split(' ');
  const [timestamp, experienceCSV, ranksCSV] = rows;

  // CML stores timestamps in seconds, we need milliseconds
  const createdAt = new Date(parseInt(timestamp, 10) * 1000);
  const importedAt = new Date();

  // Convert the experience and rank from CSV data into arrays
  const exps = (await csv({ noheader: true, output: 'csv' }).fromString(experienceCSV))[0];
  const ranks = (await csv({ noheader: true, output: 'csv' }).fromString(ranksCSV))[0];

  // If a new skill/activity/boss was added to the CML API,
  // prevent any further snapshot saves to prevent incorrect DB data
  if (exps.length !== SKILLS.length || ranks.length !== SKILLS.length) {
    throw new ServerError('The CML API was updated. Please wait for a fix.');
  }

  const stats = {};

  // Populate the skills' values with experience and rank data
  SKILLS.forEach((s, i) => {
    stats[getMetricRankKey(s)] = parseInt(ranks[i]);
    stats[getMetricValueKey(s)] = parseInt(exps[i]);
  });

  return { playerId, createdAt, importedAt, ...stats };
}

/**
 * Converts CSV data imported from the OSRS Hiscores API into Snapshot instance.
 */
async function legacy_fromRS(playerId: number, csvData: string): Promise<Snapshot> {
  // Convert the CSV text into an array of values
  // Ex: for skills, each row is [rank, level, experience]
  const rows = await csv({ noheader: true, output: 'csv' }).fromString(csvData);

  // If a new skill/activity/boss was added to the hiscores,
  // prevent any further snapshot saves to prevent incorrect DB data
  if (rows.length !== SKILLS.length + ACTIVITIES.length + BOSSES.length) {
    throw new ServerError('The OSRS Hiscores were updated. Please wait for a fix.');
  }

  const stats = {};

  // Populate the skills' values with the values from the csv
  SKILLS.forEach((s, i) => {
    const [rank, , experience] = rows[i];
    const expNum = parseInt(experience);

    stats[getMetricRankKey(s)] = parseInt(rank);
    stats[getMetricValueKey(s)] = s === Metrics.OVERALL && expNum === 0 ? -1 : expNum;
  });

  // Populate the activities' values with the values from the csv
  ACTIVITIES.forEach((s, i) => {
    const [rank, score] = rows[SKILLS.length + i];
    stats[getMetricRankKey(s)] = parseInt(rank);
    stats[getMetricValueKey(s)] = parseInt(score);
  });

  // Populate the bosses' values with the values from the csv
  BOSSES.forEach((s, i) => {
    const [rank, kills] = rows[SKILLS.length + ACTIVITIES.length + i];
    stats[getMetricRankKey(s)] = parseInt(rank);
    stats[getMetricValueKey(s)] = parseInt(kills);
  });

  return Snapshot.build({ playerId, ...stats });
}

export { saveAll, legacy_fromCML, legacy_fromRS };
