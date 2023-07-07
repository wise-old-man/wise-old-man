import { z } from 'zod';
import { PAGINATION_SCHEMA } from '../../../util/validation';
import { GroupActivitiesEntry } from '../group.types';
import prisma from '../../../../prisma';
import * as playerSevice from '../../players/player.services';
import { NotFoundError } from '@prisma/client/runtime';

const inputSchema = z
  .object({
    groupId: z.number().positive()
  })
  .merge(PAGINATION_SCHEMA);

type FetchGroupActivitiesParams = z.infer<typeof inputSchema>;

async function fetchGroupActivities(payload: FetchGroupActivitiesParams): Promise<GroupActivitiesEntry[]> {
  const params = inputSchema.parse(payload);

  const activities = await prisma.memberActivity.findMany({
    where: { groupId: params.groupId },
    orderBy: { createdAt: 'desc' },
    take: params.limit,
    skip: params.offset
  });

  if (!activities || activities.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: params.groupId }
    });

    if (!group) {
      throw new NotFoundError('Group not found');
    }
    return [];
  }

  const players = await playerSevice.findPlayers({
    ids: activities.map(activity => activity.playerId)
  });

  // Sort by descending createdAt dates
  const result = activities.map(activity => {
    return {
      player: players.find(p => p.id === activity.playerId),
      type: activity.type,
      role: activity.role,
      createdAt: activity.createdAt
    };
  });

  return result;
}

export { fetchGroupActivities };
