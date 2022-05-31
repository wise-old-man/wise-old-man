import { omit } from 'lodash';
import { z } from 'zod';
import prisma from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { GroupWithCount } from '../group.types';

const inputSchema = z.object({
  id: z.number().positive()
});

type FetchGroupDetailsParams = z.infer<typeof inputSchema>;

async function fetchGroupDetails(payload: FetchGroupDetailsParams): Promise<GroupWithCount> {
  const params = inputSchema.parse(payload);

  const group = await prisma.group.findFirst({
    where: { id: params.id },
    include: {
      _count: {
        select: {
          memberships: true
        }
      }
    }
  });

  if (!group) {
    throw new NotFoundError('Group not found.');
  }

  return {
    ...omit(group, ['_count', 'verificationHash']),
    memberCount: group._count.memberships
  };
}

export { fetchGroupDetails };
