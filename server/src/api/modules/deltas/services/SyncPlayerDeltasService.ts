import { PeriodProps } from '@wise-old-man/utils';

import prisma, {
  PeriodEnum,
  Periods,
  Player,
  Snapshot,
  Skills,
  Bosses,
  Activities,
  Virtuals
} from '../../../../prisma';
import * as snapshotServices from '../../snapshots/snapshot.services';
import { calculatePlayerDeltas } from '../delta.utils';

async function syncPlayerDeltas(player: Player, latestSnapshot: Snapshot): Promise<void> {
  // Build the update/create promise for a given period
  async function buildUpdatePromise(period: PeriodEnum) {
    // Find the first snapshot within the period
    const startSnapshot = await snapshotServices.findPlayerSnapshot({
      id: player.id,
      minDate: new Date(Date.now() - PeriodProps[period].milliseconds)
    });

    // The player only has one snapshot in this period, can't calculate diffs
    if (latestSnapshot.id === startSnapshot.id) return;

    // const cachedValues: { [metric in MetricEnum]?: number } = {};
    const periodDiffs = calculatePlayerDeltas(startSnapshot, latestSnapshot, player);

    const newDelta = {
      period,
      playerId: player.id,
      startedAt: startSnapshot.createdAt,
      endedAt: latestSnapshot.createdAt,
      ...Object.fromEntries(Skills.map(s => [s, periodDiffs.skills[s].experience.gained])),
      ...Object.fromEntries(Bosses.map(b => [b, periodDiffs.bosses[b].kills.gained])),
      ...Object.fromEntries(Virtuals.map(v => [v, periodDiffs.virtuals[v].value.gained])),
      ...Object.fromEntries(Activities.map(a => [a, periodDiffs.activities[a].score.gained]))
    };

    // Find the existing cached delta for this period
    const currentDelta = await prisma.delta.findFirst({
      where: { playerId: player.id, period }
    });

    // TODO: Missing potential record checks and flagging
    // TODO: after fixing the unique values for deltas, turn this into an upsert, get rid of currentDelta

    if (currentDelta) {
      await prisma.delta.update({ data: newDelta, where: { id: currentDelta.id } });
    } else {
      await prisma.delta.create({ data: newDelta });
    }
  }

  // Execute all update promises, sequentially
  await Promise.all(Periods.map(buildUpdatePromise));
}

export { syncPlayerDeltas };
