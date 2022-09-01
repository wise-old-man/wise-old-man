import { Prisma } from '@prisma/client';
import { onMembersJoined, onMembersLeft } from '../api/modules/groups/group.events';
import { onCompetitionCreated, onParticipantsJoined } from '../api/modules/competitions/competition.events';
import * as playerUtils from '../api/modules/players/player.utils';
import eventDispatcher, { EventType } from '../api/event-dispatcher';
import { modifyAchievements } from '.';

export function routeAfterHook(params: Prisma.MiddlewareParams, result: any) {
  // Need to dispatch this event on this hook because some bulk creates depend
  // on "skipDuplicates" which can't be predicted at the service level very easily.
  if (params.model === 'Achievement' && params.action === 'createMany') {
    eventDispatcher.dispatch({
      type: EventType.ACHIEVEMENTS_CREATED,
      payload: { achievements: modifyAchievements(params.args.data) }
    });
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
