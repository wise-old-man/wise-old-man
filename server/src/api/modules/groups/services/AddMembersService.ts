import prisma from '../../../../prisma';
import logger from '../../../../services/logging.service';
import { GroupRole, MemberActivityType, PlayerAnnotationType } from '../../../../types';
import { BadRequestError, ForbiddenError, ServerError } from '../../../errors';
import { eventEmitter, EventType } from '../../../events';
import { isValidUsername, standardize } from '../../players/player.utils';
import { findOrCreatePlayers } from '../../players/services/FindOrCreatePlayersService';

async function addMembers(
  groupId: number,
  members: Array<{ username: string; role: GroupRole }>
): Promise<{ count: number }> {
  const invalidUsernames = members.map(m => m.username).filter(u => !isValidUsername(u));

  if (invalidUsernames.length > 0) {
    throw new BadRequestError(
      `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
       contain no special characters, and/or contain no space at the beginning or end of the name.`,
      invalidUsernames
    );
  }

  // Find all existing members' ids
  const existingIds = (
    await prisma.membership.findMany({
      where: { groupId },
      select: { playerId: true }
    })
  ).map(p => p.playerId);

  // Find or create all players with the given usernames
  const players = await findOrCreatePlayers(members.map(m => m.username));

  // Filter out any already existing usersnames to find the new unique usernames
  const newPlayers = existingIds.length === 0 ? players : players.filter(p => !existingIds.includes(p.id));

  if (!newPlayers || newPlayers.length === 0) {
    throw new BadRequestError('All players given are already members.');
  }

  const optOuts = await prisma.playerAnnotation.findMany({
    where: {
      playerId: {
        in: newPlayers.map(p => p.id)
      },
      type: {
        in: [PlayerAnnotationType.OPT_OUT, PlayerAnnotationType.OPT_OUT_GROUPS]
      }
    },
    include: {
      player: {
        select: { displayName: true }
      }
    }
  });

  if (optOuts.length > 0) {
    throw new ForbiddenError(
      'One or more players have opted out of joining groups, so they cannot be added as members.',
      optOuts.map(o => o.player.displayName)
    );
  }

  const newMemberships = newPlayers.map(player => {
    const role = members.find(m => standardize(m.username) === player.username)?.role;

    if (!role) {
      throw new ServerError('Failed to find role for player (AddMemberService).');
    }

    return { groupId, playerId: player.id, role };
  });

  const newActivites = newMemberships.map(membership => {
    return {
      groupId: membership.groupId,
      playerId: membership.playerId,
      type: MemberActivityType.JOINED,
      role: membership.role
    };
  });

  const addedCount = await prisma
    .$transaction(async transaction => {
      const { count } = await transaction.membership.createMany({
        data: newMemberships
      });

      // This shouldn't ever happen since these get validated before entering the transaction,
      // but on the off chance that they do, throw a generic error to be caught by the catch block.
      if (count === 0) {
        throw new Error();
      }

      await transaction.group.update({
        where: { id: groupId },
        data: { updatedAt: new Date() }
      });

      await transaction.memberActivity.createMany({
        data: newActivites
      });

      eventEmitter.emit(EventType.GROUP_UPDATED, { groupId });

      eventEmitter.emit(EventType.GROUP_MEMBERS_JOINED, {
        groupId,
        members: newMemberships.map(m => ({
          playerId: m.playerId,
          role: m.role
        }))
      });

      return count;
    })
    .catch(error => {
      logger.error('Failed to add members', error);
      throw new ServerError('Failed to add members.');
    });

  return { count: addedCount };
}

export { addMembers };
