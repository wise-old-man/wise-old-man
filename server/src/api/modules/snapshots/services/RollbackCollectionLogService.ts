import { AsyncResult, complete, errored, isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { fetchHiscoresJSON, HiscoresError } from '../../../../services/jagex.service';
import { buildHiscoresSnapshot } from './BuildHiscoresSnapshot';

export async function rollbackCollectionLog(
  playerId: number,
  username: string
): AsyncResult<
  true,
  | { code: 'COLLECTIONS_LOGGED_UNRANKED' }
  | { code: 'FAILED_TO_ROLLBACK_COLLECTION_LOG' }
  | { code: 'FAILED_TO_LOAD_HISCORES'; subError: HiscoresError }
> {
  const rawHiscoresResult = await fetchHiscoresJSON(username);

  if (isErrored(rawHiscoresResult)) {
    return errored({
      code: 'FAILED_TO_LOAD_HISCORES',
      subError: rawHiscoresResult.error
    });
  }

  const parsedSnapshot = buildHiscoresSnapshot(1, rawHiscoresResult.value);
  const currentCollectionsLogged = parsedSnapshot.collections_loggedScore;

  if (currentCollectionsLogged === -1) {
    return errored({
      code: 'COLLECTIONS_LOGGED_UNRANKED'
    });
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
    return errored({
      code: 'FAILED_TO_ROLLBACK_COLLECTION_LOG'
    });
  }

  return complete(true);
}
