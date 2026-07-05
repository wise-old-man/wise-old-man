import { AsyncResult, combine, complete, errored, isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { CompetitionType, PlayerAnnotationType } from '../../../../types';
import { eventEmitter, EventType } from '../../../events';
import { findOrCreatePlayers } from '../../players/services/FindOrCreatePlayersService';
import { validateInvalidParticipants, validateParticipantDuplicates } from '../competition.utils';

export async function addParticipants(
  id: number,
  participants: string[]
): AsyncResult<
  { count: number },
  | { code: 'COMPETITION_NOT_FOUND' }
  | { code: 'CANNOT_ADD_PARTICIPANTS_TO_TEAM_COMPETITION' }
  | { code: 'ALL_PLAYERS_ALREADY_COMPETING' }
  | { code: 'OPTED_OUT_PARTICIPANTS_FOUND'; data: string[] }
  | { code: 'INVALID_USERNAMES_FOUND'; data: string[] }
  | { code: 'DUPLICATE_USERNAMES_FOUND'; data: string[] }
> {
  const competition = await prisma.competition.findFirst({
    where: { id }
  });

  if (competition === null) {
    return errored({ code: 'COMPETITION_NOT_FOUND' });
  }

  if (competition.type === CompetitionType.TEAM) {
    return errored({ code: 'CANNOT_ADD_PARTICIPANTS_TO_TEAM_COMPETITION' });
  }

  const validationResult = combine([
    validateInvalidParticipants(participants),
    validateParticipantDuplicates(participants)
  ]);

  if (isErrored(validationResult)) {
    return validationResult;
  }

  // Find all existing participants' ids
  const existingIds = (
    await prisma.participation.findMany({
      where: { competitionId: id },
      select: { playerId: true }
    })
  ).map(p => p.playerId);

  // Find or create all players with the given usernames
  const players = await findOrCreatePlayers(participants);

  const newPlayers = existingIds.length === 0 ? players : players.filter(p => !existingIds.includes(p.id));

  if (newPlayers.length === 0) {
    return errored({ code: 'ALL_PLAYERS_ALREADY_COMPETING' });
  }

  let optOuts = await prisma.playerAnnotation.findMany({
    where: {
      playerId: {
        in: newPlayers.map(p => p.id)
      },
      type: {
        in: [PlayerAnnotationType.OPT_OUT, PlayerAnnotationType.OPT_OUT_COMPETITIONS]
      }
    },
    include: {
      player: {
        select: { displayName: true }
      }
    }
  });

  if (competition.groupId !== null) {
    const memberships = await prisma.membership.findMany({
      where: {
        groupId: competition.groupId,
        playerId: {
          in: newPlayers.map(p => p.id)
        }
      }
    });

    // Players who opted out after joining the group are grandfathered in and may still participate.
    optOuts = optOuts.filter(o => {
      if (o.type === PlayerAnnotationType.OPT_OUT) return true;

      const membership = memberships.find(m => m.playerId === o.playerId);
      if (!membership) return true;

      return o.createdAt <= membership.createdAt;
    });
  }

  if (optOuts.length > 0) {
    return errored({
      code: 'OPTED_OUT_PARTICIPANTS_FOUND',
      data: optOuts.map(o => o.player.displayName)
    });
  }

  const newParticipations = newPlayers.map(p => ({ playerId: p.id, competitionId: id }));

  const { count } = await prisma.participation.createMany({
    data: newParticipations
  });

  if (newParticipations.length > 0) {
    eventEmitter.emit(EventType.COMPETITION_PARTICIPANTS_JOINED, {
      competitionId: id,
      participants: newParticipations.map(p => ({
        playerId: p.playerId
      }))
    });
  }

  await prisma.competition.update({
    where: { id },
    data: { updatedAt: new Date() }
  });

  return complete({ count });
}
