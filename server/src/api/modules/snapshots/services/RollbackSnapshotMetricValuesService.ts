import { AsyncResult, complete, errored, isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { fetchHiscoresJSON, HiscoresError } from '../../../../services/jagex.service';
import { Metric } from '../../../../types';
import { getMetricValueKey } from '../../../../utils/get-metric-value-key.util';
import { standardizeUsername } from '../../players/player.utils';
import { buildHiscoresSnapshot } from './BuildHiscoresSnapshot';

/**
 * There was a bug with the hiscores where if a player's hunter exp was reported to the hiscores at 3,000,000.
 * And then later for some reason was reported at 2,990,000 - the hiscores would always keep the highest value,
 * even in situations where game rollbacks happened.
 *
 * This was fixed in late 2025 but this means that a player might have a lot of historical snapshots with 3m hunter,
 * and if they update their hunter exp to 2.99m, they'll become flagged for having negative gains.
 *
 * To fix this, this service will rollback all their "wrong" snapshots back to the value the hiscores claim they should have.
 */
export async function rollbackSnapshotMetricValues(
  username: string,
  metric: Metric
): AsyncResult<
  { count: number },
  | { code: 'PLAYER_NOT_FOUND' }
  | { code: 'METRIC_UNRANKED' }
  | { code: 'FAILED_TO_ROLLBACK_SNAPSHOT_METRIC_VALUES' }
  | { code: 'FAILED_TO_LOAD_HISCORES'; subError: HiscoresError }
> {
  const player = await prisma.player.findFirst({
    where: {
      username: standardizeUsername(username)
    }
  });

  if (player === null) {
    return errored({ code: 'PLAYER_NOT_FOUND' });
  }

  const rawHiscoresResult = await fetchHiscoresJSON(username);

  if (isErrored(rawHiscoresResult)) {
    return errored({
      code: 'FAILED_TO_LOAD_HISCORES',
      subError: rawHiscoresResult.error
    });
  }

  const parsedSnapshot = buildHiscoresSnapshot(1, rawHiscoresResult.value);
  const metricKey = getMetricValueKey(metric);

  const currentValue = parsedSnapshot[metricKey];

  if (currentValue === -1) {
    return errored({ code: 'METRIC_UNRANKED' });
  }

  const result = await prisma.snapshot.updateMany({
    where: {
      playerId: player.id,
      [metricKey]: {
        gt: currentValue
      }
    },
    data: {
      [metricKey]: currentValue
    }
  });

  if (result.count === 0) {
    return errored({
      code: 'FAILED_TO_ROLLBACK_SNAPSHOT_METRIC_VALUES'
    });
  }

  return complete({ count: result.count });
}
