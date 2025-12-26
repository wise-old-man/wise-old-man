import prisma, { PrismaTypes } from '../../../../prisma';
import { BOSSES, Metric, Player, Snapshot } from '../../../../types';
import { getMetricValueKey } from '../../../../utils/get-metric-value-key.util';
import { REAL_SKILLS } from '../../../../utils/shared';
import {
  FlaggedPlayerReviewContextResponse,
  formatSnapshotResponse,
  SnapshotResponse
} from '../../../responses';
import { getPlayerEfficiencyMap } from '../../efficiency/efficiency.utils';
import { getExcessiveGains, getNegativeGains } from '../../snapshots/snapshot.utils';

const STACKABLE_EXP_SKILLS = [
  Metric.COOKING,
  Metric.CRAFTING,
  Metric.SMITHING,
  Metric.AGILITY,
  Metric.THIEVING
];

async function reviewFlaggedPlayer(
  player: Player,
  previousStats: Snapshot,
  rejectedStats: Snapshot
): Promise<FlaggedPlayerReviewContextResponse | null> {
  if (!player || !previousStats || !rejectedStats) return null;

  const negativeGains = getNegativeGains(previousStats, rejectedStats);
  const excessiveGains = getExcessiveGains(previousStats, rejectedStats);
  const excessiveGainsReversed = getExcessiveGains(rejectedStats, previousStats);

  const previous = formatSnapshotResponse(previousStats, getPlayerEfficiencyMap(previousStats, player));
  const rejected = formatSnapshotResponse(rejectedStats, getPlayerEfficiencyMap(rejectedStats, player));

  if (negativeGains !== null) {
    const isPossibleRollback =
      excessiveGains === null && excessiveGainsReversed === null && !hasLostTooMuch(previous, rejected);

    if (!isPossibleRollback) {
      // If it isn't a rollback, then it's definitely a name transfer, and should be archived (null context)
      return null;
    }

    const rollbackContext = await getRollbackContext(player, rejectedStats, negativeGains);

    return {
      previous,
      rejected,
      rollbackContext: rollbackContext,
      hasNegativeGains: !!negativeGains,
      hasExcessiveGains: !!excessiveGains,
      hasExcessiveGainsReversed: !!excessiveGainsReversed,
      isPossibleRollback: isPossibleRollback,
      data: buildNegativeGainsReport(previous, rejected)
    };
  }

  return {
    previous,
    rejected,
    rollbackContext: null,
    hasNegativeGains: !!negativeGains,
    hasExcessiveGains: !!excessiveGains,
    hasExcessiveGainsReversed: !!excessiveGainsReversed,
    isPossibleRollback: false,
    data: buildExcessiveGainsReport(previous, rejected)
  };
}

async function getRollbackContext(
  player: Player,
  rejectedStats: Snapshot,
  negativeGains: Record<Metric, number>
) {
  const query: PrismaTypes.SnapshotWhereInput = {};

  for (const metric of Object.keys(negativeGains) as Metric[]) {
    const metricKey = getMetricValueKey(metric);
    const rejectedVal = rejectedStats[metricKey];

    query[metricKey] = {
      lte: rejectedVal
    };
  }

  /**
   * Find all snapshots where this player's WOM stats matched the current rejected hiscores stats
   */
  const matches = await prisma.snapshot.findMany({
    select: {
      createdAt: true
    },
    where: {
      playerId: player.id,
      ...query
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  if (matches.length === 0) {
    return null;
  }

  const earliestMatchDate = matches.at(0)!.createdAt;
  const latestMatchDate = matches.at(-1)!.createdAt;
  const totalMatches = matches.length;

  return {
    earliestMatchDate,
    latestMatchDate,
    totalMatches
  };
}

function buildExcessiveGainsReport(
  previous: SnapshotResponse,
  rejected: SnapshotResponse
): FlaggedPlayerReviewContextResponse['data'] {
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
  previous: SnapshotResponse,
  rejected: SnapshotResponse
): FlaggedPlayerReviewContextResponse['data'] {
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

function hasLostTooMuch(previous: SnapshotResponse, rejected: SnapshotResponse) {
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
