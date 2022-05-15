import {
  PrismaClient,
  Delta as PrismaDelta,
  Player as PrismaPlayer,
  Record as PrismaRecord,
  Snapshot as PrismaSnapshot,
  Achievement as PrismaAchievement,
  NameChange,
  Prisma
} from '@prisma/client';
import {
  SkillEnum,
  BossEnum,
  ActivityEnum,
  VirtualEnum,
  MetricEnum,
  PeriodEnum,
  Periods,
  PlayerTypes,
  PlayerBuilds,
  PlayerTypeEnum,
  PlayerBuildEnum,
  NameChangeStatus,
  Metrics,
  Skills,
  Bosses,
  Activities,
  Virtuals
} from './enum-adapter';
import { routeAfterHook, routeBeforeHook } from './hooks';
import { parseBigInt } from './utils';

const prisma = new PrismaClient();

// Register Hooks
prisma.$use(async (params, next) => {
  // These hooks are executed before the database operation is executed
  routeBeforeHook(params);

  const result = await next(params);

  // These hooks are executed after the database operation has executed
  routeAfterHook(params, result);

  return result;
});

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

function modifyRecords(records: PrismaRecord[]): ModifiedRecord[] {
  return records.map(a => {
    // All records' values are stored as an Integer, but EHP/EHB records can have
    // float values, so they're multiplied by 10,000 when saving to the database.
    // Inversely, we need to divide any EHP/EHB records by 10,000 when fetching from the database.
    const isVirtualMetric = Virtuals.includes(a.metric as VirtualEnum);
    const convertedValue = isVirtualMetric ? parseBigInt(a.value) / 10_000 : parseBigInt(a.value);

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
  SkillEnum,
  BossEnum,
  ActivityEnum,
  VirtualEnum,
  MetricEnum,
  PeriodEnum,
  PlayerTypeEnum,
  PlayerBuildEnum,
  NameChangeStatus,
  // List
  Periods,
  Metrics,
  Skills,
  Bosses,
  Activities,
  Virtuals,
  PlayerTypes,
  PlayerBuilds,
  // Utils
  modifyDeltas,
  modifyPlayers,
  modifyRecords,
  modifySnapshots,
  modifyAchievements
};

export default prisma;
