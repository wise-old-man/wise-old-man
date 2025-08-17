import { eventEmitter, EventType } from '../../api/events';
import { calculatePlayerDeltas } from '../../api/modules/deltas/delta.utils';
import prisma, { PrismaTypes } from '../../prisma';
import {
  ACTIVITIES,
  BOSSES,
  CachedDelta,
  COMPUTED_METRICS,
  Delta,
  METRICS,
  Period,
  SKILLS
} from '../../types';
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
    maxConcurrent: 20
  };

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

    const [currentDeltas, startSnapshot] = await Promise.all([
      prisma.delta.findFirst({
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

    const periodDiffs = calculatePlayerDeltas(startSnapshot, latestSnapshot, playerAndSnapshot);

    const newDelta = {
      period,
      playerId: playerAndSnapshot.id,
      startedAt: startSnapshot.createdAt,
      endedAt: latestSnapshot.createdAt,
      ...Object.fromEntries(SKILLS.map(s => [s, periodDiffs.skills[s].experience.gained])),
      ...Object.fromEntries(BOSSES.map(b => [b, periodDiffs.bosses[b].kills.gained])),
      ...Object.fromEntries(ACTIVITIES.map(a => [a, periodDiffs.activities[a].score.gained])),
      ...Object.fromEntries(COMPUTED_METRICS.map(c => [c, periodDiffs.computed[c].value.gained]))
    } as Delta;

    const newCachedDeltas: CachedDelta[] = [];

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
        newCachedDeltas.push({
          ...commonProps,
          metric,
          value: prepareDecimalValue(metric, Math.min(value, 2147483647))
        });
      }
    }

    // If has no gains in any metric, delete this delta from the database,
    // as it will never be used in leaderboards
    if (!METRICS.some(metric => newDelta[metric]! > 0)) {
      await prisma.delta
        .delete({
          where: { playerId_period: { playerId: playerAndSnapshot.id, period } }
        })
        .catch(e => {
          // If the update failed because delta does not exist, ignore the error
          if (e instanceof PrismaTypes.PrismaClientKnownRequestError && e.code === 'P2025') return;
          throw e;
        });
      return;
    }

    // if any metric has improved since the last delta sync, it is a potential record
    // and we should also check for new records in this period
    let hasImprovements = false;

    METRICS.forEach(metric => {
      if (currentDeltas !== null && newDelta[metric]! > currentDeltas[metric]) {
        hasImprovements = true;
      }
    });

    await prisma.$transaction(async transaction => {
      await transaction.delta.upsert({
        where: {
          playerId_period: {
            playerId: playerAndSnapshot.id,
            period
          }
        },
        update: newDelta,
        create: newDelta
      });

      for (const cachedDelta of newCachedDeltas) {
        await transaction.cachedDelta.upsert({
          where: {
            playerId_period_metric: {
              playerId: cachedDelta.playerId,
              period: cachedDelta.period,
              metric: cachedDelta.metric
            }
          },
          update: cachedDelta,
          create: cachedDelta
        });
      }
    });

    eventEmitter.emit(EventType.PLAYER_DELTA_UPDATED, {
      username,
      period,
      periodStartDate: startSnapshot.createdAt,
      isPotentialRecord: currentDeltas === null || hasImprovements
    });
  }
}
