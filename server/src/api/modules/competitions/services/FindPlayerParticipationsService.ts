import prisma, { PrismaTypes } from '../../../../prisma';
import { omit } from '../../../util/objects';
import { CompetitionStatus } from '../../../../utils';
import { ParticipationWithCompetition } from '../competition.types';

async function findPlayerParticipations(
  playerId: number,
  status?: CompetitionStatus
): Promise<ParticipationWithCompetition[]> {
  const competitionQuery: PrismaTypes.CompetitionWhereInput = {};

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
      playerId,
      competition: competitionQuery
    },
    include: {
      competition: {
        include: {
          group: {
            include: {
              _count: {
                select: {
                  memberships: true
                }
              }
            }
          },
          _count: {
            select: {
              participations: true
            }
          }
        }
      }
    },
    orderBy: [{ competition: { score: 'desc' } }, { createdAt: 'desc' }]
  });

  return sortCompetitions(
    participations.map(participation => {
      return {
        ...omit(participation, 'startSnapshotId', 'endSnapshotId'),
        competition: {
          ...omit(participation.competition, '_count', 'verificationHash'),
          group: participation.competition.group
            ? {
                ...omit(participation.competition.group, '_count', 'verificationHash'),
                memberCount: participation.competition.group._count.memberships
              }
            : undefined,
          participantCount: participation.competition._count.participations
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
