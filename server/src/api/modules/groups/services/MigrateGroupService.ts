import * as cmlService from '../../../services/external/cml.service';
import * as templeService from '../../../services/external/temple.service';
import { MigrationDataSource } from '../group.types';

type MigrateGroupResult = { name?: string; leaders?: string[]; members: string[] };

async function migrateGroup(externalId: number, source: MigrationDataSource): Promise<MigrateGroupResult> {
  if (source === MigrationDataSource.CRYSTAL_MATH_LABS) {
    return await cmlService.fetchGroupInfo(externalId);
  }

  return await templeService.fetchGroupInfo(externalId);
}

export { migrateGroup };
