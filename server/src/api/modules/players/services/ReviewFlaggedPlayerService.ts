import { Snapshot, Player } from '../../../../prisma';
import { BOSSES, FlaggedPlayerReviewContext, Metric, REAL_SKILLS } from '../../../../utils';
import * as snapshotUtils from '../../snapshots/snapshot.utils';
import { getPlayerEfficiencyMap } from '../../efficiency/efficiency.utils';
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

  const previous = snapshotUtils.format(previousStats, getPlayerEfficiencyMap(previousStats, player));
  const rejected = snapshotUtils.format(rejectedStats, getPlayerEfficiencyMap(rejectedStats, player));

  if (negativeGains) {
    const possibleRollback =
      !excessiveGains && !excessiveGainsReversed && !hasLostTooMuch(previous, rejected);

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

function hasLostTooMuch(previous: FormattedSnapshot, rejected: FormattedSnapshot) {
  const lostEHP = Math.abs(
    REAL_SKILLS.filter(s => rejected.data.skills[s].experience > -1)
      .map(s => rejected.data.skills[s].ehp - previous.data.skills[s].ehp)
      .filter(ehpDiff => ehpDiff < 0)
      .reduce((a, b) => a + b, 0)
  );

  const lostEHB = Math.abs(
    BOSSES.filter(b => rejected.data.bosses[b].kills > -1)
      .map(s => rejected.data.bosses[s].ehb - previous.data.bosses[s].ehb)
      .filter(ehbDiff => ehbDiff < 0)
      .reduce((a, b) => a + b, 0)
  );

  // If lost over 24h of EHP and EHB, then it's probably not a rollback.
  // Rollbacks are usually quickly fixed by Jagex, so it's unlikely
  // that a player gains a huge amount of EHP and EHB in a short period of time.
  return lostEHP + lostEHB > 24;
}

export { reviewFlaggedPlayer };
