import { calculatePlayerDeltas } from '../../api/modules/deltas/delta.utils';
import prisma from '../../prisma';
import { Metric, METRICS, Period } from '../../types';
import { selectRequiredSnapshotFields } from '../../utils/get-required-snapshot-fields.util';
import { prepareDecimalValue } from '../../utils/prepare-decimal-value.util';
import { isActivity, isBoss, isComputedMetric, isSkill, PeriodProps } from '../../utils/shared';
import { JobHandler, JobHandlerContext } from '../types/job-handler.type';
import { JobType } from '../types/job-type.enum';

/**
 * Previously, we were persiting deltas for all periods, but we actually only showed 3 of them on the website.
 * Considering yearly cached deltas accounted for 63% of disk usage and Postgres churn, it's best to
 * only persist the deltas that are actually used on the website.
 */
const SUPPORTED_CACHED_DELTA_PERIODS = [Period.DAY, Period.WEEK, Period.MONTH];

interface Payload {
  username: string;
  period: Period;
}

export const SyncPlayerDeltasJobHandler: JobHandler<Payload> = {
  options: {
    maxConcurrent: 4
  },

  generateUniqueJobId(payload) {
    return [payload.username, payload.period].join('_');
  },

  async execute({ username, period }: Payload, context: JobHandlerContext) {
    const data = await prisma.player.findFirst({
      where: {
        username
      },
      include: {
        latestSnapshot: {
          select: selectRequiredSnapshotFields(METRICS) // Only select value fields, not ranks
        }
      }
    });

    if (data === null || data.latestSnapshot === null) {
      return;
    }

    const { latestSnapshot, ...player } = data;

    const [previousDeltas, startSnapshot] = await Promise.all([
      prisma.cachedDelta.findMany({
        select: {
          metric: true,
          value: true
        },
        where: {
          playerId: player.id,
          period
        }
      }),
      prisma.snapshot.findFirst({
        select: selectRequiredSnapshotFields(METRICS), // Only select value fields, not ranks
        where: {
          playerId: player.id,
          createdAt: { gte: new Date(latestSnapshot.createdAt.getTime() - PeriodProps[period].milliseconds) }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    ]);

    // The player only has one snapshot in this period, can't calculate diffs
    if (!startSnapshot || latestSnapshot.createdAt.getTime() === startSnapshot.createdAt.getTime()) {
      return;
    }

    const previousDeltaValueMap = new Map(previousDeltas.map(c => [c.metric, c.value]));
    const newDeltaValueMap = new Map<Metric, number>();

    const periodDiffs = calculatePlayerDeltas(startSnapshot, latestSnapshot, player);

    for (const metric of METRICS) {
      let value = 0;

      if (isSkill(metric)) {
        value = periodDiffs.skills[metric].experience.gained;
      } else if (isBoss(metric)) {
        value = periodDiffs.bosses[metric].kills.gained;
      } else if (isActivity(metric)) {
        value = periodDiffs.activities[metric].score.gained;
      } else if (isComputedMetric(metric)) {
        value = periodDiffs.computed[metric].value.gained;
      }

      if (value > 0) {
        newDeltaValueMap.set(metric, value);
      }
    }

    if (newDeltaValueMap.size === 0) {
      if (!SUPPORTED_CACHED_DELTA_PERIODS.includes(period)) {
        return;
      }

      // If has no gains in any metric, clear all deltas for this period and return early
      await prisma.cachedDelta.deleteMany({
        where: {
          playerId: player.id,
          period
        }
      });

      return;
    }

    if (SUPPORTED_CACHED_DELTA_PERIODS.includes(period)) {
      const newCachedDeltas = Array.from(newDeltaValueMap.entries()).map(([metric, value]) => ({
        playerId: player.id,
        period,
        startedAt: startSnapshot.createdAt,
        endedAt: latestSnapshot.createdAt,
        updatedAt: new Date(),
        metric,
        value: prepareDecimalValue(metric, Math.min(value, 2147483647))
      }));

      await prisma.$transaction([
        prisma.cachedDelta.deleteMany({
          where: {
            playerId: player.id,
            period
          }
        }),
        prisma.cachedDelta.createMany({
          data: newCachedDeltas
        })
      ]);
    }

    // If any metric has improved since the last delta sync, it is a potential record
    // and we should also check for new records in this period
    const hasImprovements =
      previousDeltas.length !== 0 &&
      METRICS.some(metric => {
        const previousValue = previousDeltaValueMap.get(metric);
        const newValue = newDeltaValueMap.get(metric);

        if (newValue === undefined) {
          return false;
        }

        return previousValue === undefined || newValue > previousValue;
      });

    if (previousDeltas.length === 0 || hasImprovements) {
      context.jobManager.add(JobType.SYNC_PLAYER_RECORDS, {
        username,
        period,
        startSnapshotDate: startSnapshot.createdAt,
        deltas: Array.from(newDeltaValueMap.entries().map(([metric, value]) => ({ metric, value })))
      });
    }
  }
};
