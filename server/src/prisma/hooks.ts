import { Prisma } from '@prisma/client';
import { onAchievementsCreated } from '../api/modules/achievements/achievement.events';
import { onNameChangeCreated } from '../api/events/name.events';
import { onDeltaUpdated } from '../api/events/delta.events';
import * as playerUtils from '../api/modules/players/player.utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function routeBeforeHook(params: Prisma.MiddlewareParams) {
  // TODO: migrate all the before hooks to this router and then disable the eslint line above
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function routeAfterHook(params: Prisma.MiddlewareParams, result: any) {
  if (params.model === 'Achievement' && params.action === 'createMany') {
    onAchievementsCreated(params.args.data);
  } else if (params.model === 'NameChange' && params.action === 'create') {
    onNameChangeCreated(params.args.data);
  } else if (params.model === 'Delta' && (params.action === 'create' || params.action === 'update')) {
    onDeltaUpdated(params.args.data);
  }

  // TODO: clear name cache when a player's name updatyes

  if (params.model === 'Player') {
    if (
      params.action === 'findFirst' ||
      params.action === 'findUnique' ||
      params.action === 'create' ||
      params.action === 'update'
    ) {
      updatePlayerIdCache(result);
    }
  }

  // TODO: migrate all the after hooks to this router and then disable the eslint line above
}

function updatePlayerIdCache(result: any) {
  if (!result || !result.id || !result.username) {
    return;
  }

  playerUtils.setCachedPlayerId(result.username, result.id);
}
