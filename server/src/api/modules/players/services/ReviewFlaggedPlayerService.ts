import { Snapshot, Player } from '../../../../prisma';
import { BOSSES, FlaggedPlayerReviewContext, Metric } from '../../../../utils';
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

function reviewFlaggedPlayer(
  player: Player,
  previousStats: Snapshot,
  rejectedStats: Snapshot
): FlaggedPlayerReviewContext | null {
  if (!player || !previousStats || !rejectedStats) return null;

  const negativeGains = !!snapshotUtils.getNegativeGains(previousStats, rejectedStats);

  const excessiveGains = !!snapshotUtils.getExcessiveGains(previousStats, rejectedStats);
  const excessiveGainsReversed = !!snapshotUtils.getExcessiveGains(rejectedStats, previousStats);

  const previous = snapshotUtils.format(
    previousStats,
    efficiencyUtils.getPlayerEfficiencyMap(previousStats, player)
  );

  const rejected = snapshotUtils.format(
    rejectedStats,
    efficiencyUtils.getPlayerEfficiencyMap(rejectedStats, player)
  );

  if (negativeGains) {
    const possibleRollback = !excessiveGains && !excessiveGainsReversed;

    if (!possibleRollback) {
      // If it isn't a rollback, then it's definitely a name transfer, and should be archived (null context)
      return null;
    }

    return {
      previous,
      rejected,
      negativeGains,
      excessiveGains,
      possibleRollback,
      excessiveGainsReversed,
      data: buildNegativeGainsReport(previous, rejected)
    };
  }

  return {
    previous,
    rejected,
    negativeGains,
    excessiveGains,
    possibleRollback: false,
    excessiveGainsReversed,
    data: buildExcessiveGainsReport(previous, rejected)
  };
}

function buildExcessiveGainsReport(
  previous: FormattedSnapshot,
  rejected: FormattedSnapshot
): FlaggedPlayerReviewContext['data'] {
  const previousRank = previous.data.skills.overall.rank;
  const rejectedRank = rejected.data.skills.overall.rank;

  const previousEHP = previous.data.skills.overall.ehp;
  const rejectedEHP = rejected.data.skills.overall.ehp;

  const previousEHB = BOSSES.map(b => previous.data.bosses[b].ehb).reduce((a, b) => a + b, 0);
  const rejectedEHB = BOSSES.map(b => rejected.data.bosses[b].ehb).reduce((a, b) => a + b, 0);

  const ehpDiff = rejectedEHP - previousEHP;
  const ehbDiff = rejectedEHB - previousEHB;

  // Sum the gained EHP from all stackable skills
  const gainedEHPFromStackableSkills = STACKABLE_EXP_SKILLS.map(
    s => rejected.data.skills[s].ehp - previous.data.skills[s].ehp
  ).reduce((a, b) => a + b, 0);

  const stackableGainedRatio = gainedEHPFromStackableSkills / (ehpDiff + ehbDiff);

  return {
    stackableGainedRatio,
    previousEHP,
    previousEHB,
    previousRank,
    rejectedEHP,
    rejectedEHB,
    rejectedRank
  };
}

function buildNegativeGainsReport(
  previous: FormattedSnapshot,
  rejected: FormattedSnapshot
): FlaggedPlayerReviewContext['data'] {
  const previousEHP = previous.data.skills.overall.ehp;
  const rejectedEHP = rejected.data.skills.overall.ehp;

  const previousEHB = BOSSES.map(b => previous.data.bosses[b].ehb).reduce((a, b) => a + b, 0);
  const rejectedEHB = BOSSES.map(b => rejected.data.bosses[b].ehb).reduce((a, b) => a + b, 0);

  const previousRank = previous.data.skills.overall.rank;
  const rejectedRank = rejected.data.skills.overall.rank;

  return {
    stackableGainedRatio: 0,
    previousEHP,
    previousEHB,
    previousRank,
    rejectedEHP,
    rejectedEHB,
    rejectedRank
  };
}

export { reviewFlaggedPlayer };
