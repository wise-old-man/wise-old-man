import { z } from 'zod';
import prisma, { PrismaTypes, NameChange, NameChangeStatus } from '../../../../prisma';
import { PAGINATION_SCHEMA } from '../../../util/validation';

const inputSchema = z
  .object({
    username: z.string().optional(),
    status: z.nativeEnum(NameChangeStatus).optional()
  })
  .merge(PAGINATION_SCHEMA);

type SearchNameChangesParams = z.infer<typeof inputSchema>;

async function searchNameChanges(payload: SearchNameChangesParams): Promise<NameChange[]> {
  const params = inputSchema.parse(payload);

  const query: PrismaTypes.NameChangeWhereInput = {};

  if (params.status) {
    query.status = params.status;
  }

  if (params.username && params.username.length > 0) {
    query.OR = [
      { oldName: { startsWith: params.username, mode: 'insensitive' } },
      { newName: { startsWith: params.username, mode: 'insensitive' } }
    ];
  }

  const nameChanges = await prisma.nameChange.findMany({
    where: { ...query },
    orderBy: { createdAt: 'desc' },
    take: params.limit,
    skip: params.offset
  });

  return nameChanges;
}

export { searchNameChanges };
