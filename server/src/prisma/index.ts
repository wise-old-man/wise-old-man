import {
  PrismaClient,
  PrismaPromise,
  Delta as PrismaDelta,
  Player as PrismaPlayer,
  Record as PrismaRecord,
  Snapshot as PrismaSnapshot,
  Achievement as PrismaAchievement,
  Competition,
  Participation,
  NameChange,
  Group,
  Membership,
  Prisma,
  Country
} from '@prisma/client';
import { isComputedMetric } from '../utils';
import { NameChangeStatus } from './enum-adapter';
import { routeAfterHook } from './hooks';
import { parseBigInt } from './utils';

let hooksEnabled = true;

const prisma = new PrismaClient();

// Register Hooks
prisma.$use(async (params, next) => {
  const result = await next(params);

  // These hooks are executed after the database operation has executed
  if (hooksEnabled) routeAfterHook(params, result);

  return result;
});

function setHooksEnabled(enabled: boolean) {
  hooksEnabled = enabled;
}

function modifyAchievements(achievements: PrismaAchievement[]): Achievement[] {
  return achievements.map(a => ({ ...a, threshold: parseBigInt(a.threshold) }));
}

function modifySnapshots(snapshots: PrismaSnapshot[]): Snapshot[] {
  return snapshots.map(s => ({ ...s, overallExperience: parseBigInt(s.overallExperience) }));
}

function modifyDelta(delta: PrismaDelta): Delta {
  return delta ? { ...delta, overall: parseBigInt(delta.overall) } : null;
}

function modifyDeltas(deltas: PrismaDelta[]): Delta[] {
  return deltas.map(d => ({ ...d, overall: parseBigInt(d.overall) }));
}

function modifyPlayer(player: PrismaPlayer): Player {
  const modifiedPlayer = player ? { ...player, exp: parseBigInt(player.exp) } : null;

  // TODO: Temporary until latestSnapshotId becomes public
  if (modifiedPlayer) {
    delete modifiedPlayer.latestSnapshotId;
  }

  return modifiedPlayer;
}

function modifySnapshot(snapshot: PrismaSnapshot): Snapshot {
  return snapshot ? { ...snapshot, overallExperience: parseBigInt(snapshot.overallExperience) } : null;
}

function modifyRecords(records: PrismaRecord[]): Record[] {
  return records.map(a => {
    // All records' values are stored as an Integer, but EHP/EHB records can have
    // float values, so they're multiplied by 10,000 when saving to the database.
    // Inversely, we need to divide any EHP/EHB records by 10,000 when fetching from the database.
    const isComputed = isComputedMetric(a.metric);
    const convertedValue = isComputed ? parseBigInt(a.value) / 10_000 : parseBigInt(a.value);

    return { ...a, value: convertedValue };
  });
}

type Achievement = Omit<PrismaAchievement, 'threshold'> & {
  threshold: number;
};

type Record = Omit<PrismaRecord, 'value'> & {
  value: number;
};

type Delta = Omit<PrismaDelta, 'overall'> & {
  overall: number;
};

type Snapshot = Omit<PrismaSnapshot, 'overallExperience'> & {
  overallExperience: number;
};

type Player = Omit<PrismaPlayer, 'exp' | 'latestSnapshotId'> & {
  exp: number;
};

export {
  Prisma as PrismaTypes,
  PrismaPromise,
  // Original Models
  PrismaDelta,
  PrismaPlayer,
  PrismaSnapshot,
  // Models
  NameChange,
  Group,
  Membership,
  Competition,
  Participation,
  Player,
  Delta,
  Record,
  Snapshot,
  Achievement,
  // Enums
  Country,
  NameChangeStatus,
  // Utils
  setHooksEnabled,
  modifyDelta,
  modifyDeltas,
  modifyPlayer,
  modifyRecords,
  modifySnapshot,
  modifySnapshots,
  modifyAchievements
};

export default prisma;
