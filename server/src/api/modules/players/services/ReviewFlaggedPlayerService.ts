import { Snapshot, Player } from '../../../../prisma';
import { BOSSES, Metric, REAL_SKILLS } from '../../../../utils';
import * as snapshotUtils from '../../snapshots/snapshot.utils';
import * as efficiencyUtils from '../../efficiency/efficiency.utils';
import { FormattedSnapshot } from '../../snapshots/snapshot.types';

const STACKABLE_EXP_SKILLS = [
  Metric.COOKING,
  Metric.CRAFTING,
  Metric.SMITHING,
  Metric.AGILITY,
  Metric.THIEVING
];

async function reviewFlaggedPlayer(player: Player, previousStats: Snapshot, rejectedStats: Snapshot) {
  if (!player || !previousStats || !rejectedStats) return;

  const negativeGains = snapshotUtils.hasNegativeGains(previousStats, rejectedStats);
  const excessiveGains = snapshotUtils.hasExcessiveGains(previousStats, rejectedStats);
  const excessiveGainsReversed = snapshotUtils.hasExcessiveGains(rejectedStats, previousStats);

  const previous = snapshotUtils.format(
    previousStats,
    efficiencyUtils.getPlayerEfficiencyMap(previousStats, player)
  );

  const rejected = snapshotUtils.format(
    rejectedStats,
    efficiencyUtils.getPlayerEfficiencyMap(rejectedStats, player)
  );

  if (negativeGains) {
    const possibleRollback =
      !excessiveGains && !excessiveGainsReversed && !hasLostTooMuch(previous, rejected);

    if (!possibleRollback) {
      // If it isn't a rollback, then it's definitely a name transfer, and should be archived (null context)
      return null;
    }

    return {
      negativeGains,
      excessiveGains,
      excessiveGainsReversed,
      ...buildNegativeGainsReport(possibleRollback, previous, rejected)
    };
  }

  return {
    negativeGains,
    excessiveGains,
    excessiveGainsReversed,
    ...buildExcessiveGainsReport(previous, rejected)
  };
}

function buildExcessiveGainsReport(previous: FormattedSnapshot, rejected: FormattedSnapshot) {
  const previousRank = previous.data.skills.overall.rank;
  const rejectedRank = rejected.data.skills.overall.rank;

  const previousExp = previous.data.skills.overall.experience;
  const rejectedExp = rejected.data.skills.overall.experience;

  const previousEHP = previous.data.skills.overall.ehp;
  const rejectedEHP = rejected.data.skills.overall.ehp;

  const previousEHB = BOSSES.map(b => previous.data.bosses[b].ehb).reduce((a, b) => a + b, 0);
  const rejectedEHB = BOSSES.map(b => rejected.data.bosses[b].ehb).reduce((a, b) => a + b, 0);

  const ehpDiff = rejectedEHP - previousEHP;
  const ehbDiff = rejectedEHB - previousEHB;

  const ehpChange = Math.round(getPercentageIncrease(previousEHP, rejectedEHP) * 100);
  const ehbChange = Math.round(getPercentageIncrease(previousEHB, rejectedEHB) * 100);

  // Sum the gained EHP from all stackable skills
  const gainedEHPFromStackableSkills = STACKABLE_EXP_SKILLS.map(
    s => rejected.data.skills[s].ehp - previous.data.skills[s].ehp
  ).reduce((a, b) => a + b, 0);

  const stackableGainedRatio = gainedEHPFromStackableSkills / (ehpDiff + ehbDiff);

  const rankChange = getPercentageIncrease(previousRank, rejectedRank);
  const expChange = getPercentageIncrease(previousExp, rejectedExp);

  return {
    previous,
    rejected,
    stackableGainedRatio,
    rankChange,
    expChange,
    ehpChange,
    ehbChange,
    previousEHP,
    previousEHB,
    previousRank,
    rejectedEHP,
    rejectedEHB,
    rejectedRank
  };
}

function buildNegativeGainsReport(
  possibleRollback: boolean,
  previous: FormattedSnapshot,
  rejected: FormattedSnapshot
) {
  const previousEHP = previous.data.skills.overall.ehp;
  const rejectedEHP = rejected.data.skills.overall.ehp;

  const previousEHB = BOSSES.map(b => previous.data.bosses[b].ehb).reduce((a, b) => a + b, 0);
  const rejectedEHB = BOSSES.map(b => rejected.data.bosses[b].ehb).reduce((a, b) => a + b, 0);

  const ehpDiff = rejectedEHP - previousEHP;
  const ehbDiff = rejectedEHB - previousEHB;

  const ehpChange = Math.round(getPercentageIncrease(previousEHP, rejectedEHP) * 100);
  const ehbChange = Math.round(getPercentageIncrease(previousEHB, rejectedEHB) * 100);

  return {
    possibleRollback,
    previous,
    rejected,
    previousEHP,
    previousEHB,
    rejectedEHP,
    rejectedEHB,
    ehpDiff,
    ehbDiff,
    ehpChange,
    ehbChange
  };
}

function hasLostTooMuch(previous: FormattedSnapshot, rejected: FormattedSnapshot) {
  const previousEHP = previous.data.skills.overall.ehp;
  const previousEHB = BOSSES.map(b => previous.data.bosses[b].ehb).reduce((a, b) => a + b, 0);

  const lostEHP = REAL_SKILLS.map(s => rejected.data.skills[s].ehp - previous.data.skills[s].ehp)
    .filter(ehpDiff => ehpDiff < 0)
    .reduce((a, b) => a + b, 0);

  const lostEHB = BOSSES.map(s => rejected.data.bosses[s].ehb - previous.data.bosses[s].ehb)
    .filter(ehbDiff => ehbDiff < 0)
    .reduce((a, b) => a + b, 0);

  // If lost over 24h (or 20%) of EHP and EHB, then it's probably not a rollback.
  // Rollbacks are usually quickly fixed by Jagex, so it's unlikely that a player gains a huge amount of EHP and EHB in a short period of time.
  return lostEHP + lostEHB > Math.min(24, (previousEHP + previousEHB) * 0.2);
}

function getPercentageIncrease(previous: number, current: number) {
  if (previous === 0) return 0;
  return (current - previous) / previous;
}

export { reviewFlaggedPlayer };
