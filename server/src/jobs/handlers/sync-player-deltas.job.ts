import { ACTIVITIES, BOSSES, COMPUTED_METRICS, METRICS, Period, PeriodProps, SKILLS } from '../../utils';
import { Job } from '../job.class';
import prisma, { Delta, PrismaTypes } from '../../prisma';
import { calculatePlayerDeltas } from '../../api/modules/deltas/delta.utils';
import { eventEmitter, EventType } from '../../api/events';
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

    await prisma.delta.upsert({
      where: {
        playerId_period: {
          playerId: playerAndSnapshot.id,
          period
        }
      },
      update: newDelta,
      create: newDelta
    });

    eventEmitter.emit(EventType.PLAYER_DELTA_UPDATED, {
      username,
      period,
      periodStartDate: startSnapshot.createdAt,
      isPotentialRecord: currentDeltas === null || hasImprovements
    });
  }
}
