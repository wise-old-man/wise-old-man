import prisma from '../../../../prisma';
import { CompetitionType, PlayerAnnotationType } from '../../../../utils';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../errors';
import { eventEmitter, EventType } from '../../../events';
import { findOrCreatePlayers } from '../../players/services/FindOrCreatePlayersService';
import { Team } from '../competition.types';
import {
  sanitizeTeams,
  validateInvalidParticipants,
  validateParticipantDuplicates,
  validateTeamDuplicates
} from '../competition.utils';

async function addTeams(id: number, teams: Team[]): Promise<{ count: number }> {
  const competition = await prisma.competition.findFirst({
    where: { id }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  if (competition.type === CompetitionType.CLASSIC) {
    throw new BadRequestError('Cannot add teams to a classic competition.');
  }

  // ensures every team name is sanitized, and every username is standardized
  const newTeams = sanitizeTeams(teams);
  // fetch this competition's current teams
  const currentTeams = await fetchCurrentTeams(id);

  // throws an error if any team name is duplicated
  validateTeamDuplicates([...newTeams, ...currentTeams]);
  // throws an error if any team participant is invalid
  validateInvalidParticipants([
    ...newTeams.map(t => t.participants).flat(),
    ...currentTeams.map(t => t.participants).flat()
  ]);
  // throws an error if any team participant is duplicated
  validateParticipantDuplicates([
    ...newTeams.map(t => t.participants).flat(),
    ...currentTeams.map(t => t.participants).flat()
  ]);

  const newPlayers = await findOrCreatePlayers(newTeams.map(t => t.participants).flat());

  const optOuts = await prisma.playerAnnotation.findMany({
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

  if (optOuts.length > 0) {
    throw new ForbiddenError(
      'One or more players have opted out of joining competitions, so they cannot be added as participants.',
      optOuts.map(o => o.player.displayName)
    );
  }

  // Map player usernames into IDs, for O(1) checks below
  const playerMap = Object.fromEntries(newPlayers.map(p => [p.username, p.id]));

  const newParticipations = newTeams
    .map(t => t.participants.map(u => ({ teamName: t.name, competitionId: id, playerId: playerMap[u] })))
    .flat();

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

  return { count };
}

async function fetchCurrentTeams(id: number): Promise<Team[]> {
  const participations = await prisma.participation.findMany({
    where: { competitionId: id },
    select: { teamName: true, player: { select: { username: true } } }
  });

  const teamNameMap = new Map<string, string[]>();

  participations.forEach(p => {
    if (!p.teamName) return;

    const current = teamNameMap.get(p.teamName);

    if (current) {
      current.push(p.player.username);
    } else {
      teamNameMap.set(p.teamName, [p.player.username]);
    }
  });

  return Array.from(teamNameMap.keys()).map(teamName => ({
    name: teamName,
    participants: teamNameMap.get(teamName) || []
  }));
}

export { addTeams };
