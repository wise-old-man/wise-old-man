import {
  Period,
  PeriodProps,
  PERIODS,
  SKILLS,
  BOSSES,
  ACTIVITIES,
  COMPUTED_METRICS,
  METRICS
} from '../../../../utils';
import prisma, { Delta, Player, Snapshot } from '../../../../prisma';
import * as deltaUtils from '../delta.utils';
import * as deltaEvents from '../delta.events';
import { findPlayerSnapshot } from '../../snapshots/services/FindPlayerSnapshotService';

async function syncPlayerDeltas(player: Player, latestSnapshot: Snapshot): Promise<void> {
  // Fetch all deltas for this player, and cache them into a <period, delta> map
  const playerDeltas = await prisma.delta.findMany({ where: { playerId: player.id } });
  const playerDeltasMap: Map<Period, Delta> = new Map(playerDeltas.map(d => [d.period, d]));

  // Build the update/create promise for a given period
  async function buildUpdatePromise(period: Period) {
    // Find the first snapshot within the period
    const startSnapshot = await findPlayerSnapshot({
      id: player.id,
      minDate: new Date(Date.now() - PeriodProps[period].milliseconds)
    });

    // The player only has one snapshot in this period, can't calculate diffs
    if (!latestSnapshot || !startSnapshot || latestSnapshot.id === startSnapshot.id) return;

    const periodDiffs = deltaUtils.calculatePlayerDeltas(startSnapshot, latestSnapshot, player);

    const newDelta = {
      period,
      playerId: player.id,
      startedAt: startSnapshot.createdAt,
      endedAt: latestSnapshot.createdAt,
      ...Object.fromEntries(SKILLS.map(s => [s, periodDiffs.skills[s].experience.gained])),
      ...Object.fromEntries(BOSSES.map(b => [b, periodDiffs.bosses[b].kills.gained])),
      ...Object.fromEntries(ACTIVITIES.map(a => [a, periodDiffs.activities[a].score.gained])),
      ...Object.fromEntries(COMPUTED_METRICS.map(c => [c, periodDiffs.computed[c].value.gained]))
    };

    // Find the existing cached delta for this period
    const currentDelta = playerDeltasMap.get(period);

    // If has no gains in any metric, delete this delta from the database,
    // as it will never be used in leaderboards
    if (!METRICS.some(metric => newDelta[metric] > 0)) {
      await prisma.delta.delete({
        where: { playerId_period: { playerId: player.id, period } }
      });
      return;
    }

    // if any metric has improved since the last delta sync, it is a potential record
    // and we should also check for new records in this period
    let hasImprovements = false;

    METRICS.forEach(metric => {
      if (currentDelta && newDelta[metric] > currentDelta[metric]) {
        hasImprovements = true;
      }
    });

    const updatedDelta = await prisma.delta.upsert({
      where: { playerId_period: { playerId: player.id, period } },
      update: newDelta,
      create: newDelta
    });

    deltaEvents.onDeltaUpdated(updatedDelta, !currentDelta || hasImprovements);
  }

  // Execute all update promises, sequentially
  for (const period of PERIODS) {
    await buildUpdatePromise(period);
  }
}

export { syncPlayerDeltas };
