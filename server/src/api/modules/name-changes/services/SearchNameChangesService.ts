import { z } from 'zod';
import prisma, { PrismaTypes, NameChange, NameChangeStatus } from '../../../../prisma';
import { getPaginationSchema } from '../../../util/validation';

const inputSchema = z
  .object({
    username: z.string().optional(),
    status: z.nativeEnum(NameChangeStatus).optional()
  })
  .merge(getPaginationSchema());

type SearchNameChangesParams = z.infer<typeof inputSchema>;

async function searchNameChanges(payload: SearchNameChangesParams): Promise<NameChange[]> {
  const params = inputSchema.parse(payload);

  const query: PrismaTypes.NameChangeWhereInput = {};

  if (params.status) {
    query.status = params.status;
  }

  if (params.username && params.username.length > 0) {
    const startsWith = params.username.trim();

    query.OR = [
      { oldName: { startsWith, mode: 'insensitive' } },
      { newName: { startsWith, mode: 'insensitive' } }
    ];
  }

  const nameChanges = await prisma.nameChange.findMany({
    where: { ...query },
    orderBy: { createdAt: 'desc' },
    take: params.limit,
    skip: params.offset
  });

  return nameChanges as NameChange[];
}

export { searchNameChanges };
