import { PrismaClient, Achievement, NameChange } from '@prisma/client';
import { MetricEnum, NameChangeStatus } from './enum-adapter';
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

type ModifiedAchievement = Omit<Achievement, 'threshold'> & {
  threshold: number;
};

export {
  // Models
  ModifiedAchievement as Achievement,
  NameChange,
  // Enums
  MetricEnum,
  NameChangeStatus,
  // Utils
  modifyAchievements
};

export default prisma;
