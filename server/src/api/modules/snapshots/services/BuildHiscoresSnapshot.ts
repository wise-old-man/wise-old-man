import { HiscoresData } from '../../../../services/jagex.service';
import { ACTIVITIES, BOSSES, COMPUTED_METRICS, Metric, METRICS, SKILLS, Snapshot } from '../../../../types';
import { getMetricRankKey } from '../../../../utils/get-metric-rank-key.util';
import { getMetricValueKey } from '../../../../utils/get-metric-value-key.util';
import { MetricProps } from '../../../../utils/shared';
import { ServerError } from '../../../errors';

const SKIPPED_METRICS = [
  'Grid Points',
  'Deadman Points',
  'Bounty Hunter (Legacy) - Hunter',
  'Bounty Hunter (Legacy) - Rogue'
];

/**
 * Jagex names some activities differently than we do, so we need to map them accordingly.
 */
const METRIC_NAME_OVERRIDES = {
  [Metric.RUNECRAFTING]: 'Runecraft',
  [Metric.BOUNTY_HUNTER_HUNTER]: 'Bounty Hunter - Hunter',
  [Metric.BOUNTY_HUNTER_ROGUE]: 'Bounty Hunter - Rogue',
  [Metric.LAST_MAN_STANDING]: 'LMS - Rank',
  [Metric.PVP_ARENA]: 'PvP Arena - Rank',
  [Metric.GUARDIANS_OF_THE_RIFT]: 'Rifts closed',
  [Metric.COLLECTIONS_LOGGED]: 'Collections Logged',
  [Metric.CHAMBERS_OF_XERIC_CM]: 'Chambers of Xeric: Challenge Mode',
  [Metric.THEATRE_OF_BLOOD_HARD_MODE]: 'Theatre of Blood: Hard Mode',
  [Metric.TOMBS_OF_AMASCUT_EXPERT]: 'Tombs of Amascut: Expert Mode'
};

export function buildHiscoresSnapshot(playerId: number, hiscoresData: HiscoresData, previous?: Snapshot) {
  if (hiscoresData.skills.length < 25) {
    /**
     * Temporary until Sailing is added to the OSRS Hiscores.
     * TODO: Remove this ASAP after Sailing launch.
     */
    hiscoresData.skills.push({
      name: 'Sailing',
      rank: -1,
      level: 1,
      xp: -1
    });
  }

  if (
    hiscoresData.skills.length + hiscoresData.activities.length <
    METRICS.length - COMPUTED_METRICS.length + SKIPPED_METRICS.length
  ) {
    // If some metric is removed from the hiscores, something went very wrong and we should suspend player updates.
    throw new ServerError('The OSRS Hiscores were updated. Please wait for a fix.');
  }

  const skillsMap = Object.fromEntries(hiscoresData.skills.map(sd => [sd.name.toLowerCase(), sd]));
  const activitiesMap = Object.fromEntries(hiscoresData.activities.map(ad => [ad.name.toLowerCase(), ad]));

  const snapshotFields: Partial<Snapshot> = {
    playerId,
    createdAt: new Date()
  };

  let totalExp = 0;

  for (const skill of SKILLS) {
    const jagexMetricName = METRIC_NAME_OVERRIDES[skill] ?? MetricProps[skill].name;
    const { xp, level, rank } = skillsMap[jagexMetricName.toLowerCase()];

    let exp = xp;

    if (skill === Metric.OVERALL && exp === 0) {
      // Sometimes the hiscores return 0 as unranked, but we want to be consistent and keep -1 as the "unranked" value
      exp = -1;
    }

    const metricValueKey = getMetricValueKey(skill);

    if (exp === -1 && previous && previous[metricValueKey] > -1) {
      // If the player was previously ranked in this skill, and then somehow became unranked, just fallback to the previous value
      exp = previous[metricValueKey];
    }

    snapshotFields[getMetricRankKey(skill)] = rank;
    snapshotFields[metricValueKey] = exp;

    if (skill === Metric.OVERALL) {
      snapshotFields.overallLevel = level === 0 ? -1 : level;
    } else {
      totalExp += Math.max(0, exp);
    }
  }

  // If this player is unranked in overall exp, we should set their overall exp to the total exp of all skills
  // since that's at least closer to the real number than -1
  if (snapshotFields.overallExperience! < totalExp && totalExp > 0) {
    snapshotFields.overallExperience = totalExp;
  }

  for (const metric of [...BOSSES, ...ACTIVITIES]) {
    const jagexMetricName = METRIC_NAME_OVERRIDES[metric] ?? MetricProps[metric].name;
    const { score, rank } = activitiesMap[jagexMetricName.toLowerCase()];

    snapshotFields[getMetricRankKey(metric)] = rank;
    snapshotFields[getMetricValueKey(metric)] = score;
  }

  return snapshotFields as Snapshot;
}
