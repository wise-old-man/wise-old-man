import { eventEmitter, EventType } from '../../api/events';
import { calculatePlayerDeltas } from '../../api/modules/deltas/delta.utils';
import prisma from '../../prisma';
import { CachedDelta, Metric, METRICS, Period } from '../../types';
import { getRequiredSnapshotFields } from '../../utils/get-required-snapshot-fields.util';
import { prepareDecimalValue } from '../../utils/prepare-decimal-value.util';
import { isActivity, isBoss, isComputedMetric, isSkill, PeriodProps } from '../../utils/shared';
import { JobHandler } from '../types/job-handler.type';

interface Payload {
  username: string;
  period: Period;
}

export const SyncPlayerDeltasJobHandler: JobHandler<Payload> = {
  options: {
    maxConcurrent: 8
  },

  generateUniqueJobId(payload) {
    return [payload.username, payload.period].join('_');
  },

  async execute({ username, period }: Payload) {
    const data = await prisma.player.findFirst({
      where: {
        username
      },
      include: {
        latestSnapshot: {
          select: {
            playerId: true,
            createdAt: true,
            ...getRequiredSnapshotFields(METRICS) // Only select value fields, not ranks
          }
        }
      }
    });

    if (data === null || data.latestSnapshot === null) {
      return;
    }

    const { latestSnapshot, ...player } = data;

    const [previousDeltas, startSnapshot] = await Promise.all([
      prisma.cachedDelta.findMany({
        where: {
          playerId: player.id,
          period
        }
      }),
      prisma.snapshot.findFirst({
        select: {
          playerId: true,
          createdAt: true,
          ...getRequiredSnapshotFields(METRICS) // Only select value fields, not ranks
        },
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

    const previousCachedDeltasMap = new Map<Metric, CachedDelta>(
      previousDeltas.map(cachedDelta => [cachedDelta.metric, cachedDelta])
    );

    const newCachedDeltasMap = new Map<Metric, CachedDelta>();

    const periodDiffs = calculatePlayerDeltas(startSnapshot, latestSnapshot, player);

    const commonProps = {
      playerId: player.id,
      period,
      startedAt: startSnapshot.createdAt,
      endedAt: latestSnapshot.createdAt,
      updatedAt: new Date()
    };

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
        newCachedDeltasMap.set(metric, {
          ...commonProps,
          metric,
          value: prepareDecimalValue(metric, Math.min(value, 2147483647))
        });
      }
    }

    // If has no gains in any metric, clear all deltas for this period and return early
    if (newCachedDeltasMap.size === 0) {
      await prisma.cachedDelta.deleteMany({
        where: {
          playerId: player.id,
          period
        }
      });

      return;
    }

    // if any metric has improved since the last delta sync, it is a potential record
    // and we should also check for new records in this period
    const hasImprovements =
      previousDeltas.length !== 0 &&
      METRICS.some(metric => {
        const previousValue = previousCachedDeltasMap.get(metric)?.value;
        const newValue = newCachedDeltasMap.get(metric)?.value;

        if (newValue === undefined) {
          return false;
        }

        return previousValue === undefined || newValue > previousValue;
      });

    const newCachedDeltas = Array.from(newCachedDeltasMap.values());

    await prisma.$transaction(async transaction => {
      await transaction.cachedDelta.deleteMany({
        where: {
          playerId: player.id,
          period
        }
      });

      await transaction.cachedDelta.createMany({
        data: newCachedDeltas
      });
    });

    eventEmitter.emit(EventType.PLAYER_DELTA_UPDATED, {
      username,
      period,
      isPotentialRecord: previousDeltas.length === 0 || hasImprovements
    });
  }
};
