import { Period, PeriodProps, PERIODS, SKILLS, BOSSES, ACTIVITIES, VIRTUALS } from '../../../../utils';
import prisma, { Player, Snapshot } from '../../../../prisma';
import * as snapshotServices from '../../snapshots/snapshot.services';
import { calculatePlayerDeltas } from '../delta.utils';

async function syncPlayerDeltas(player: Player, latestSnapshot: Snapshot): Promise<void> {
  // Build the update/create promise for a given period
  async function buildUpdatePromise(period: Period) {
    // Find the first snapshot within the period
    const startSnapshot = await snapshotServices.findPlayerSnapshot({
      id: player.id,
      minDate: new Date(Date.now() - PeriodProps[period].milliseconds)
    });

    // The player only has one snapshot in this period, can't calculate diffs
    if (!latestSnapshot || !startSnapshot || latestSnapshot.id === startSnapshot.id) return;

    const periodDiffs = calculatePlayerDeltas(startSnapshot, latestSnapshot, player);

    const newDelta = {
      period,
      playerId: player.id,
      startedAt: startSnapshot.createdAt,
      endedAt: latestSnapshot.createdAt,
      ...Object.fromEntries(SKILLS.map(s => [s, periodDiffs.skills[s].experience.gained])),
      ...Object.fromEntries(BOSSES.map(b => [b, periodDiffs.bosses[b].kills.gained])),
      ...Object.fromEntries(VIRTUALS.map(v => [v, periodDiffs.virtuals[v].value.gained])),
      ...Object.fromEntries(ACTIVITIES.map(a => [a, periodDiffs.activities[a].score.gained]))
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
  await Promise.all(PERIODS.map(buildUpdatePromise));
}

export { syncPlayerDeltas };
