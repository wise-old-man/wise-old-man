import { Prisma } from '@prisma/client';
import { onAchievementsCreated } from '../api/modules/achievements/achievement.events';
import { onNameChangeCreated } from '../api/events/name.events';
import { onPlayerImported, onPlayerUpdated } from '../api/events/player.events';
import { onDeltaUpdated } from '../api/events/delta.events';
import { onMembersJoined, onMembersLeft } from '../api/events/group.events';
import * as playerUtils from '../api/modules/players/player.utils';
import { modifyAchievements, modifyDeltas, modifySnapshot } from '.';

export function routeAfterHook(params: Prisma.MiddlewareParams, result: any) {
  if (params.model === 'Achievement' && params.action === 'createMany') {
    onAchievementsCreated(modifyAchievements(params.args.data));
    return;
  }

  if (params.model === 'NameChange' && params.action === 'create') {
    onNameChangeCreated(result);
    return;
  }

  if (params.model === 'Delta' && (params.action === 'create' || params.action === 'update')) {
    onDeltaUpdated(modifyDeltas([result])[0]);
    return;
  }

  if (params.model === 'Membership') {
    if (params.action === 'createMany' && params.args?.data?.length > 0) {
      onMembersJoined(
        params.args.data[0].groupId,
        params.args.data.map(d => d.playerId)
      );
    } else if (params.action === 'deleteMany' && params.args?.where) {
      onMembersLeft(params.args.where.groupId, params.args.where.playerId.in);
    }

    return;
  }

  if (params.model === 'Group' && params.action === 'create') {
    if (result?.memberships?.length > 0) {
      onMembersJoined(
        result.id,
        result.memberships.map(d => d.playerId)
      );
    }

    return;
  }

  if (params.model === 'Snapshot') {
    if (params.action === 'createMany' && params.args?.data?.length > 0) {
      onPlayerImported(params.args.data[0].playerId);
    } else if (params.action === 'create') {
      onPlayerUpdated(modifySnapshot(result));
    }
    return;
  }

  if (params.model === 'Player') {
    if (
      params.action === 'findFirst' ||
      params.action === 'findUnique' ||
      params.action === 'create' ||
      params.action === 'update'
    ) {
      updatePlayerIdCache(result);
    }
    return;
  }
}

function updatePlayerIdCache(result: any) {
  if (!result || !result.id || !result.username) {
    return;
  }

  playerUtils.setCachedPlayerId(result.username, result.id);
}
