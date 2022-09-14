import { Prisma } from '@prisma/client';
import * as groupEvents from '../api/modules/groups/group.events';
import * as playerUtils from '../api/modules/players/player.utils';
import * as competitionEvents from '../api/modules/competitions/competition.events';
import * as achievementEvents from '../api/modules/achievements/achievement.events';
import { modifyAchievements } from '.';

// Some events need to be dispatched on this hook because (some) bulk creates depend
// on "skipDuplicates" which can't be easily predicted at the service level.
export function routeAfterHook(params: Prisma.MiddlewareParams, result: any) {
  if (params.model === 'Achievement' && params.action === 'createMany') {
    const achievements = params.args.data;

    if (achievements?.length > 0) {
      achievementEvents.onAchievementsCreated(modifyAchievements(achievements));
    }

    return;
  }

  if (params.model === 'Membership') {
    if (params.action === 'createMany') {
      const newMemberships = params.args.data;

      if (newMemberships?.length > 0) {
        groupEvents.onMembersJoined(newMemberships);
      }
      return;
    }

    if (params.action === 'deleteMany' && params.args?.where) {
      const removedPlayerIds = params.args.where.playerId.in;

      if (removedPlayerIds?.length > 0 && result?.count > 0) {
        groupEvents.onMembersLeft(params.args.where.groupId, removedPlayerIds);
      }
      return;
    }
  }

  if (params.model === 'Group' && params.action === 'create') {
    const newMemberships = result?.memberships;

    if (newMemberships?.length > 0) {
      groupEvents.onMembersJoined(newMemberships);
    }

    return;
  }

  if (params.model === 'Participation') {
    if (params.action === 'createMany') {
      const newParticipations = params.args.data;

      if (newParticipations?.length > 0) {
        competitionEvents.onParticipantsJoined(newParticipations);
      }
    }

    return;
  }

  if (params.model === 'Competition' && params.action === 'create') {
    const newParticipations = result?.participations;

    if (newParticipations?.length > 0) {
      competitionEvents.onParticipantsJoined(newParticipations);
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
