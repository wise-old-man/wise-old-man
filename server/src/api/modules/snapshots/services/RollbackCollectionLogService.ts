import prisma from '../../../../prisma';
import { ServerError } from '../../../errors';
import * as jagexService from '../../../services/external/jagex.service';
import { parseHiscoresSnapshot } from '../snapshot.utils';

export async function rollbackCollectionLog(playerId: number, username: string) {
  const rawHiscoresResponse = await jagexService.fetchHiscoresData(username);

  if (!rawHiscoresResponse) {
    throw new ServerError('Failed to fetch hiscores data.');
  }

  const currentCollectionsLogged = (await parseHiscoresSnapshot(1, rawHiscoresResponse))
    .collections_loggedScore;

  if (currentCollectionsLogged === -1) {
    throw new ServerError('Collections Logged unranked.');
  }

  // Rollback their collection log scores that are over their hiscores
  const result = await prisma.snapshot.updateMany({
    where: {
      playerId,
      collections_loggedScore: { gt: currentCollectionsLogged }
    },
    data: {
      collections_loggedScore: currentCollectionsLogged
    }
  });

  if (result.count === 0) {
    throw new ServerError('Failed to rollback collection log data from snapshots.');
  }
}
