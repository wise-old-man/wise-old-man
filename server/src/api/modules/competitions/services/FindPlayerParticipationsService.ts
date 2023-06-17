import { z } from 'zod';
import prisma, { PrismaTypes } from '../../../../prisma';
import { omit } from '../../../util/objects';
import { CompetitionStatus } from '../../../../utils';
// import { PAGINATION_SCHEMA } from '../../../util/validation';  // disable pagination for now
import { ParticipationWithCompetition } from '../competition.types';

const inputSchema = z.object({
  playerId: z.number().int().positive(),
  status: z.nativeEnum(CompetitionStatus).optional()
});
// .merge(PAGINATION_SCHEMA);  // disable pagination for now

type FindPlayerParticipationsParams = z.infer<typeof inputSchema>;

async function findPlayerParticipations(
  payload: FindPlayerParticipationsParams
): Promise<ParticipationWithCompetition[]> {
  const params = inputSchema.parse(payload);

  const competitionQuery: PrismaTypes.CompetitionWhereInput = {};

  if (params.status) {
    const now = new Date();

    if (params.status === CompetitionStatus.FINISHED) {
      competitionQuery.endsAt = { lt: now };
    } else if (params.status === CompetitionStatus.UPCOMING) {
      competitionQuery.startsAt = { gt: now };
    } else if (params.status === CompetitionStatus.ONGOING) {
      competitionQuery.startsAt = { lt: now };
      competitionQuery.endsAt = { gt: now };
    }
  }

  const participations = await prisma.participation.findMany({
    where: {
      playerId: params.playerId,
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
    // take: params.limit,  // disable pagination for now
    // skip: params.offset  // disable pagination for now
  });

  return participations.map(participation => {
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
  });
}

export { findPlayerParticipations };
