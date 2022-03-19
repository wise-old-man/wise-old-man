import { z } from 'zod';
import prisma, { NameChange } from '../../../../prisma';
import { NameChangeStatus } from '../name-change.types';

const paginationSchema = z.object({
  limit: z.number().int().positive().default(20),
  offset: z.number().int().positive().default(0)
});

const paramsSchema = z.object({
  groupId: z.number().int().positive(),
  pagination: paginationSchema.optional()
});

type FindGroupNameChangesParams = z.infer<typeof paramsSchema>;

class FindGroupNameChangesService {
  validate(payload: any): FindGroupNameChangesParams {
    return paramsSchema.parse(payload);
  }

  async execute(params: FindGroupNameChangesParams): Promise<NameChange[]> {
    // Fetch all memberships for this group
    const memberPlayerIds = await prisma.membership.findMany({
      where: { groupId: params.groupId },
      select: { playerId: true }
    });

    // Convert the memberships to an array of player IDs
    const playerIds = memberPlayerIds.map(m => m.playerId);

    if (playerIds.length === 0) {
      return [];
    }

    // Fetch all achievements for these player IDs
    const nameChanges = await prisma.nameChange.findMany({
      where: {
        playerId: { in: playerIds },
        status: NameChangeStatus.APPROVED
      },
      include: { player: true },
      orderBy: { createdAt: 'desc' },
      take: params.pagination.limit,
      skip: params.pagination.offset
    });

    return nameChanges;
  }
}

export default new FindGroupNameChangesService();
