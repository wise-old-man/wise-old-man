import { z } from 'zod';
import * as cmlService from '../../../services/external/cml.service';
import * as templeService from '../../../services/external/temple.service';
import { MigrationDataSource } from '../group.types';

const inputSchema = z.object({
  externalId: z.number().int().positive(),
  externalSource: z.nativeEnum(MigrationDataSource)
});

type MigrateGroupParams = z.infer<typeof inputSchema>;
type MigrateGroupResult = { name?: string; leaders?: string[]; members: string[] };

async function migrateGroup(payload: MigrateGroupParams): Promise<MigrateGroupResult> {
  const params = inputSchema.parse(payload);

  if (params.externalSource === MigrationDataSource.CRYSTAL_MATH_LABS) {
    return await cmlService.fetchGroupInfo(params.externalId);
  }

  return await templeService.fetchGroupInfo(params.externalId);
}

export { migrateGroup };
