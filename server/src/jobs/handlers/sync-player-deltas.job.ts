import { eventEmitter, EventType } from '../../api/events';
import { calculatePlayerDeltas } from '../../api/modules/deltas/delta.utils';
import prisma from '../../prisma';
import { CachedDelta, Metric, METRICS, Period } from '../../types';
import { prepareDecimalValue } from '../../utils/prepare-decimal-value.util';
import { isActivity, isBoss, isComputedMetric, isSkill, PeriodProps } from '../../utils/shared';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';

interface Payload {
  username: string;
  period: Period;
}

export class SyncPlayerDeltasJob extends Job<Payload> {
  static options: JobOptions = {
    maxConcurrent: 8
  };

  static getUniqueJobId(payload: Payload) {
    return [payload.username, payload.period].join('_');
  }

  async execute({ username, period }: Payload) {
    const playerAndSnapshot = await prisma.player.findFirst({
      where: {
        username
      },
      include: {
        latestSnapshot: true
      }
    });

    if (playerAndSnapshot === null || playerAndSnapshot.latestSnapshot === null) {
      return;
    }

    const latestSnapshot = playerAndSnapshot.latestSnapshot;

    const [previousDeltas, startSnapshot] = await Promise.all([
      prisma.cachedDelta.findMany({
        where: {
          playerId: playerAndSnapshot.id,
          period
        }
      }),
      prisma.snapshot.findFirst({
        where: {
          playerId: playerAndSnapshot.id,
          createdAt: { gte: new Date(Date.now() - PeriodProps[period].milliseconds) }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    ]);

    // The player only has one snapshot in this period, can't calculate diffs
    if (!startSnapshot || latestSnapshot.id === startSnapshot.id) {
      return;
    }

    const previousCachedDeltasMap = new Map<Metric, CachedDelta>(
      previousDeltas.map(cachedDelta => [cachedDelta.metric, cachedDelta])
    );

    const newCachedDeltasMap = new Map<Metric, CachedDelta>();

    const periodDiffs = calculatePlayerDeltas(startSnapshot, latestSnapshot, playerAndSnapshot);

    const commonProps = {
      playerId: playerAndSnapshot.id,
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
          playerId: playerAndSnapshot.id,
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
          playerId: playerAndSnapshot.id,
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
      periodStartDate: startSnapshot.createdAt,
      isPotentialRecord: previousDeltas.length === 0 || hasImprovements
    });
  }
}
