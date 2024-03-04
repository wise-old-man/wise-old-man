import prisma, { PrismaTypes } from '../../../../prisma';
import { CompetitionStatus } from '../../../../utils';
import { NotFoundError } from '../../../errors';
import { omit } from '../../../util/objects';
import { standardize } from '../../players/player.utils';
import { ParticipationWithCompetition } from '../competition.types';

async function findPlayerParticipations(
  username: string,
  status?: CompetitionStatus
): Promise<ParticipationWithCompetition[]> {
  const competitionQuery: PrismaTypes.CompetitionWhereInput = {};

  const player = await prisma.player.findFirst({
    where: { username: standardize(username) },
    select: { id: true }
  });

  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  if (status) {
    const now = new Date();

    if (status === CompetitionStatus.FINISHED) {
      competitionQuery.endsAt = { lt: now };
    } else if (status === CompetitionStatus.UPCOMING) {
      competitionQuery.startsAt = { gt: now };
    } else if (status === CompetitionStatus.ONGOING) {
      competitionQuery.startsAt = { lt: now };
      competitionQuery.endsAt = { gt: now };
    }
  }

  const participations = await prisma.participation.findMany({
    where: {
      playerId: player.id,
      competition: competitionQuery
    },
    include: {
      competition: true
    },
    orderBy: [{ competition: { score: 'desc' } }, { createdAt: 'desc' }]
  });

  const groups = await prisma.group.findMany({
    where: {
      id: { in: participations.map(p => p.competition.groupId).filter(Boolean) }
    },
    include: {
      _count: {
        select: {
          memberships: true
        }
      }
    }
  });

  const participantCounts = await prisma.participation.groupBy({
    by: ['competitionId'],
    where: {
      competitionId: {
        in: participations.map(c => c.competitionId)
      }
    },
    _count: true
  });

  const groupsMap = new Map(groups.map(g => [g.id, g]));
  const participantCountsMap = new Map(participantCounts.map(p => [p.competitionId, p._count]));

  return sortCompetitions(
    participations.map(participation => {
      const group = participation.competition.groupId
        ? groupsMap.get(participation.competition.groupId)
        : undefined;

      return {
        ...omit(participation, 'startSnapshotId', 'endSnapshotId'),
        competition: {
          ...omit(participation.competition, 'verificationHash'),
          group: group
            ? {
                ...omit(group, '_count', 'verificationHash'),
                memberCount: group._count.memberships
              }
            : undefined,
          participantCount: participantCountsMap.get(participation.competitionId) ?? 0
        }
      };
    })
  );
}

function sortCompetitions(participations: ParticipationWithCompetition[]): ParticipationWithCompetition[] {
  const finished: ParticipationWithCompetition[] = [];
  const upcoming: ParticipationWithCompetition[] = [];
  const ongoing: ParticipationWithCompetition[] = [];

  participations.forEach(p => {
    if (p.competition.endsAt.getTime() < Date.now()) {
      finished.push(p);
    } else if (p.competition.startsAt.getTime() < Date.now()) {
      ongoing.push(p);
    } else {
      upcoming.push(p);
    }
  });

  return [
    ...ongoing.sort((a, b) => {
      return a.competition.endsAt.getTime() - b.competition.endsAt.getTime();
    }),
    ...upcoming.sort((a, b) => {
      return a.competition.startsAt.getTime() - b.competition.startsAt.getTime();
    }),
    ...finished.sort((a, b) => {
      return b.competition.endsAt.getTime() - a.competition.endsAt.getTime();
    })
  ];
}

export { findPlayerParticipations };
