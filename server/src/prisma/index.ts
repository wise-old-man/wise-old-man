import { PrismaClient, Achievement } from '@prisma/client';
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

export function modifyAchievements(achievements: Achievement[]): ModifiedAchievement[] {
  return achievements.map(a => ({ ...a, threshold: parseBigInt(a.threshold) }));
}

type ModifiedAchievement = Omit<Achievement, 'threshold'> & {
  threshold: number;
};

export { ModifiedAchievement as Achievement };
export default prisma;
