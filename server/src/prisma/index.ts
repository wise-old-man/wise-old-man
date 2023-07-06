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
  NameChange as PrismaNameChange,
  Group,
  Membership,
  Prisma,
  Country,
  MemberActivity
} from '@prisma/client';
import { DenyContext, SkipContext, isComputedMetric } from '../utils';
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

function modifyAchievement(achievement: PrismaAchievement): Achievement {
  return {
    ...achievement,
    threshold: parseBigInt(achievement.threshold),
    accuracy: achievement.accuracy != null ? parseBigInt(achievement.accuracy) : null
  };
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

type Achievement = Omit<PrismaAchievement, 'threshold' | 'accuracy'> & {
  threshold: number;
  accuracy: number | null;
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

type NameChange = Omit<PrismaNameChange, 'reviewContext'> & {
  reviewContext: SkipContext | DenyContext | null;
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
  MemberActivity,
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
  modifyAchievement
};

export default prisma;
