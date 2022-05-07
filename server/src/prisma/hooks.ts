import { Prisma } from '@prisma/client';
import { onAchievementsCreated } from '../api/modules/achievements/achievement.events';
import { onNameChangeCreated } from '../api/events/name.events';
import { onDeltaUpdated } from '../api/events/delta.events';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function routeBeforeHook(params: Prisma.MiddlewareParams) {
  // TODO: migrate all the before hooks to this router and then disable the eslint line above
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function routeAfterHook(params: Prisma.MiddlewareParams, result: any) {
  if (params.model === 'Achievement' && params.action === 'createMany') {
    onAchievementsCreated(params.args.data);
  }

  if (params.model === 'NameChange' && params.action === 'create') {
    onNameChangeCreated(params.args.data);
  }

  if (params.model === 'Delta' && (params.action === 'create' || params.action === 'update')) {
    onDeltaUpdated(params.args.data);
  }

  // TODO: migrate all the after hooks to this router and then disable the eslint line above
}
