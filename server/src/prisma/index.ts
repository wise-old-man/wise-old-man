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
import { isVirtualMetric } from '../utils';
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

// Used for testing purposes
function setHooksEnabled(enabled: boolean) {
  hooksEnabled = enabled;
}

function modifyAchievements(achievements: PrismaAchievement[]): Achievement[] {
  return achievements.map(a => ({ ...a, threshold: parseBigInt(a.threshold) }));
}

function modifySnapshots(snapshots: PrismaSnapshot[]): Snapshot[] {
  return snapshots.map(s => ({ ...s, overallExperience: parseBigInt(s.overallExperience) }));
}

function modifyDeltas(deltas: PrismaDelta[]): Delta[] {
  return deltas.map(d => ({ ...d, overall: parseBigInt(d.overall) }));
}

function modifyPlayers(players: PrismaPlayer[]): Player[] {
  return players.map(p => ({ ...p, exp: parseBigInt(p.exp) }));
}

function modifyPlayer(player: PrismaPlayer): Player {
  return player ? { ...player, exp: parseBigInt(player.exp) } : null;
}

function modifySnapshot(snapshot: PrismaSnapshot): Snapshot {
  return snapshot ? { ...snapshot, overallExperience: parseBigInt(snapshot.overallExperience) } : null;
}

function modifyRecords(records: PrismaRecord[]): Record[] {
  return records.map(a => {
    // All records' values are stored as an Integer, but EHP/EHB records can have
    // float values, so they're multiplied by 10,000 when saving to the database.
    // Inversely, we need to divide any EHP/EHB records by 10,000 when fetching from the database.
    const isVirtual = isVirtualMetric(a.metric);
    const convertedValue = isVirtual ? parseBigInt(a.value) / 10_000 : parseBigInt(a.value);

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

type Player = Omit<PrismaPlayer, 'exp'> & {
  exp: number;
};

export {
  Prisma as PrismaTypes,
  PrismaPromise,
  // Original Models
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
  modifyDeltas,
  modifyPlayer,
  modifyPlayers,
  modifyRecords,
  modifySnapshot,
  modifySnapshots,
  modifyAchievements
};

export default prisma;
