import { PrismaClient, Achievement, NameChange, Record, Prisma } from '@prisma/client';
import {
  SkillEnum,
  BossEnum,
  ActivityEnum,
  VirtualEnum,
  MetricEnum,
  PeriodEnum,
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

function modifyAchievements(achievements: Achievement[]): ModifiedAchievement[] {
  return achievements.map(a => ({ ...a, threshold: parseBigInt(a.threshold) }));
}

function modifyRecords(records: Record[]): ModifiedRecord[] {
  return records.map(a => {
    // All records' values are stored as an Integer, but EHP/EHB records can have
    // float values, so they're multiplied by 10,000 when saving to the database.
    // Inversely, we need to divide any EHP/EHB records by 10,000 when fetching from the database.
    const isVirtualMetric = Virtuals.includes(a.metric as VirtualEnum);
    const convertedValue = isVirtualMetric ? parseBigInt(a.value) / 10_000 : parseBigInt(a.value);

    return { ...a, value: convertedValue };
  });
}

type ModifiedAchievement = Omit<Achievement, 'threshold'> & {
  threshold: number;
};

type ModifiedRecord = Omit<Record, 'value'> & {
  value: number;
};

export {
  Prisma as PrismaTypes,
  // Models
  NameChange,
  ModifiedRecord as Record,
  ModifiedAchievement as Achievement,
  // Enums
  SkillEnum,
  BossEnum,
  ActivityEnum,
  VirtualEnum,
  MetricEnum,
  PeriodEnum,
  NameChangeStatus,
  // List
  Metrics,
  Skills,
  Bosses,
  Activities,
  Virtuals,
  // Utils
  modifyAchievements,
  modifyRecords
};

export default prisma;
