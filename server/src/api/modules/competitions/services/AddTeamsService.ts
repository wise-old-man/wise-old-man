import { AsyncResult, combine, complete, errored, isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { CompetitionTeam, CompetitionType, PlayerAnnotationType } from '../../../../types';
import { eventEmitter, EventType } from '../../../events';
import { findOrCreatePlayers } from '../../players/services/FindOrCreatePlayersService';
import {
  sanitizeTeams,
  validateInvalidParticipants,
  validateParticipantDuplicates,
  validateTeamDuplicates
} from '../competition.utils';

async function addTeams(
  id: number,
  teams: CompetitionTeam[]
): AsyncResult<
  { count: number },
  | { code: 'COMPETITION_NOT_FOUND' }
  | { code: 'CANNOT_ADD_TEAMS_TO_CLASSIC_COMPETITION' }
  | { code: 'ALL_PLAYERS_ALREADY_COMPETING' }
  | { code: 'OPTED_OUT_PARTICIPANTS_FOUND'; data: string[] }
  | { code: 'INVALID_USERNAMES_FOUND'; data: string[] }
  | { code: 'DUPLICATE_USERNAMES_FOUND'; data: string[] }
  | { code: 'DUPLICATE_TEAM_NAMES_FOUND'; data: string[] }
> {
  const competition = await prisma.competition.findFirst({
    where: { id }
  });

  if (competition === null) {
    return errored({ code: 'COMPETITION_NOT_FOUND' });
  }

  if (competition.type === CompetitionType.CLASSIC) {
    return errored({ code: 'CANNOT_ADD_TEAMS_TO_CLASSIC_COMPETITION' });
  }

  // ensures every team name is sanitized, and every username is standardized
  const newTeams = sanitizeTeams(teams);
  // fetch this competition's current teams
  const currentTeams = await fetchCurrentTeams(id);

  const teamValidationResult = combine([
    validateTeamDuplicates([...newTeams, ...currentTeams]),
    validateInvalidParticipants([
      ...newTeams.map(t => t.participants).flat(),
      ...currentTeams.map(t => t.participants).flat()
    ]),
    validateParticipantDuplicates([
      ...newTeams.map(t => t.participants).flat(),
      ...currentTeams.map(t => t.participants).flat()
    ])
  ]);

  if (isErrored(teamValidationResult)) {
    return teamValidationResult;
  }

  const newPlayers = await findOrCreatePlayers(newTeams.map(t => t.participants).flat());

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

  return complete({ count });
}

async function fetchCurrentTeams(id: number): Promise<CompetitionTeam[]> {
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
