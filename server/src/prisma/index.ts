import {
  PrismaClient,
  Delta as PrismaDelta,
  Player as PrismaPlayer,
  Record as PrismaRecord,
  Snapshot as PrismaSnapshot,
  Achievement as PrismaAchievement,
  NameChange,
  Prisma,
  Country
} from '@prisma/client';
import { isVirtualMetric } from '../utils/metrics';
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

function modifyAchievements(achievements: PrismaAchievement[]): ModifiedAchievement[] {
  return achievements.map(a => ({ ...a, threshold: parseBigInt(a.threshold) }));
}

function modifySnapshots(snapshots: PrismaSnapshot[]): ModifiedSnapshot[] {
  return snapshots.map(s => ({ ...s, overallExperience: parseBigInt(s.overallExperience) }));
}

function modifyDeltas(deltas: PrismaDelta[]): ModifiedDelta[] {
  return deltas.map(d => ({ ...d, overall: parseBigInt(d.overall) }));
}

function modifyPlayers(players: PrismaPlayer[]): ModifiedPlayer[] {
  return players.map(p => ({ ...p, exp: parseBigInt(p.exp) }));
}

function modifyPlayer(player: PrismaPlayer): ModifiedPlayer {
  return player ? { ...player, exp: parseBigInt(player.exp) } : null;
}

function modifySnapshot(snapshot: PrismaSnapshot): ModifiedSnapshot {
  return snapshot ? { ...snapshot, overallExperience: parseBigInt(snapshot.overallExperience) } : null;
}

function modifyRecords(records: PrismaRecord[]): ModifiedRecord[] {
  return records.map(a => {
    // All records' values are stored as an Integer, but EHP/EHB records can have
    // float values, so they're multiplied by 10,000 when saving to the database.
    // Inversely, we need to divide any EHP/EHB records by 10,000 when fetching from the database.
    const isVirtual = isVirtualMetric(a.metric);
    const convertedValue = isVirtual ? parseBigInt(a.value) / 10_000 : parseBigInt(a.value);

    return { ...a, value: convertedValue };
  });
}

type ModifiedAchievement = Omit<PrismaAchievement, 'threshold'> & {
  threshold: number;
};

type ModifiedRecord = Omit<PrismaRecord, 'value'> & {
  value: number;
};

type ModifiedDelta = Omit<PrismaDelta, 'overall'> & {
  overall: number;
};

type ModifiedSnapshot = Omit<PrismaSnapshot, 'overallExperience'> & {
  overallExperience: number;
};

type ModifiedPlayer = Omit<PrismaPlayer, 'exp'> & {
  exp: number;
};

export {
  Prisma as PrismaTypes,
  // Original Models
  PrismaPlayer,
  PrismaSnapshot,
  // Models
  NameChange,
  ModifiedPlayer as Player,
  ModifiedDelta as Delta,
  ModifiedRecord as Record,
  ModifiedSnapshot as Snapshot,
  ModifiedAchievement as Achievement,
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
