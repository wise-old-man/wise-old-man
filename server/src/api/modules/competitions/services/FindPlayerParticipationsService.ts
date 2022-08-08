import { omit } from 'lodash';
import { z } from 'zod';
import prisma from '../../../../prisma';
import { PAGINATION_SCHEMA } from '../../../util/validation';
import { ParticipationWithCompetition } from '../competition.types';

const inputSchema = z
  .object({
    playerId: z.number().int().positive()
  })
  .merge(PAGINATION_SCHEMA);

type FindPlayerParticipationsParams = z.infer<typeof inputSchema>;

async function findPlayerParticipations(
  payload: FindPlayerParticipationsParams
): Promise<ParticipationWithCompetition[]> {
  const params = inputSchema.parse(payload);

  const participations = await prisma.participation.findMany({
    where: { playerId: params.playerId },
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
    orderBy: [{ competition: { score: 'desc' } }, { createdAt: 'desc' }],
    take: params.limit,
    skip: params.offset
  });

  return participations.map(participation => {
    return {
      ...omit(participation, ['startSnapshotId', 'endSnapshotId']),
      competition: {
        ...omit(participation.competition, ['_count', 'verificationHash']),
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
