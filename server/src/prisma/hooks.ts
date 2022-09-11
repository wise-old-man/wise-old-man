import { Prisma } from '@prisma/client';
import { onCompetitionCreated, onParticipantsJoined } from '../api/modules/competitions/competition.events';
import * as playerUtils from '../api/modules/players/player.utils';
import eventDispatcher, { EventType } from '../api/event-dispatcher';
import { modifyAchievements } from '.';

// Some events need to be dispatched on this hook because (some) bulk creates depend
// on "skipDuplicates" which can't be easily predicted at the service level.
export function routeAfterHook(params: Prisma.MiddlewareParams, result: any) {
  if (params.model === 'Achievement' && params.action === 'createMany') {
    const achievements = params.args.data;

    if (achievements?.length > 0) {
      eventDispatcher.dispatch({
        type: EventType.ACHIEVEMENTS_CREATED,
        payload: { achievements: modifyAchievements(achievements) }
      });
    }

    return;
  }

  if (params.model === 'Membership') {
    if (params.action === 'createMany') {
      const newMemberships = params.args.data;

      if (newMemberships?.length > 0) {
        eventDispatcher.dispatch({
          type: EventType.GROUP_MEMBERS_JOINED,
          payload: { memberships: newMemberships }
        });
      }
      return;
    }

    if (params.action === 'deleteMany' && params.args?.where) {
      const removedPlayerIds = params.args.where.playerId.in;

      if (removedPlayerIds?.length > 0 && result?.count > 0) {
        eventDispatcher.dispatch({
          type: EventType.GROUP_MEMBERS_LEFT,
          payload: { groupId: params.args.where.groupId, playerIds: removedPlayerIds }
        });
      }
      return;
    }
  }

  if (params.model === 'Group' && params.action === 'create') {
    const newMemberships = result?.memberships;

    if (newMemberships?.length > 0) {
      eventDispatcher.dispatch({
        type: EventType.GROUP_MEMBERS_JOINED,
        payload: { memberships: newMemberships }
      });
    }

    return;
  }

  if (params.model === 'Participation') {
    if (params.action === 'createMany' && params.args?.data?.length > 0) {
      onParticipantsJoined(
        params.args.data[0].competitionId,
        params.args.data.map(d => d.playerId)
      );
    }

    return;
  }

  if (params.model === 'Competition' && params.action === 'create') {
    if (result?.participations?.length > 0) {
      onParticipantsJoined(
        result.id,
        result.participations.map(d => d.playerId)
      );
    }

    onCompetitionCreated(result);
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
