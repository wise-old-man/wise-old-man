import { Prisma } from '@prisma/client';
import { onAchievementsCreated } from '../api/events/achievement.events';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function routeBeforeHook(params: Prisma.MiddlewareParams) {
  // TODO: migrate all the before hooks to this router and then disable the eslint line above
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function routeAfterHook(params: Prisma.MiddlewareParams, result: any) {
  if (params.model === 'Achievement' && params.action === 'createMany') {
    onAchievementsCreated(params.args.data);
  }

  // TODO: migrate all the after hooks to this router and then disable the eslint line above
}
