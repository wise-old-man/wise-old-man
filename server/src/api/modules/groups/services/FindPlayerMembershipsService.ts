import { z } from 'zod';
import prisma from '../../../../prisma';
import { omit } from '../../../util/objects';
import { getPaginationSchema } from '../../../util/validation';
import { MembershipWithGroup } from '../group.types';

const inputSchema = z
  .object({
    playerId: z.number().int().positive()
  })
  .merge(getPaginationSchema());

type FindPlayerMembershipsParams = z.infer<typeof inputSchema>;

async function findPlayerMemberships(payload: FindPlayerMembershipsParams): Promise<MembershipWithGroup[]> {
  const params = inputSchema.parse(payload);

  const memberships = await prisma.membership.findMany({
    where: { playerId: params.playerId },
    include: {
      group: {
        include: {
          _count: {
            select: {
              memberships: true
            }
          }
        }
      }
    },
    orderBy: [{ group: { score: 'desc' } }, { createdAt: 'desc' }],
    take: params.limit,
    skip: params.offset
  });

  return memberships.map(membership => {
    return {
      ...membership,
      group: {
        ...omit(membership.group, '_count', 'verificationHash'),
        memberCount: membership.group._count.memberships
      }
    };
  });
}

export { findPlayerMemberships };
