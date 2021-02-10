import { Pagination } from '../../../types';
import { sequelize } from '../../../database';
import { Achievement, Snapshot, Player } from '../../../database/models';
import { isSkill, isActivity, isBoss, isVirtual, getValueKey } from '../../util/metrics';
import { round } from '../../util/numbers';
import { CAPPED_MAX_TOTAL_XP, getCappedTotalXp, getCombatLevel } from '../../util/experience';
import { ACHIEVEMENT_TEMPLATES } from '../../modules/achievements/templates';
import * as snapshotService from './snapshot.service';

const UNKNOWN_DATE = new Date(0);

interface ExtendedAchievement extends Achievement {
  measure: string;
}

export interface AchievementTemplate {
  name: string;
  metric: string;
  measure: string;
  thresholds: number[];
  validate: (snapshot: Snapshot, threshold: number) => boolean;
}
interface AchievementDefinition {
  name: string;
  metric: string;
  measure: string;
  threshold: number;
  validate: (snapshot: Snapshot) => boolean;
}

async function getPlayerAchievements(playerId: number) {
  const achievements = await Achievement.findAll({ where: { playerId } });
  return achievements.map(format);
}

async function getPlayerAchievementsProgress(playerId: number) {
  const achievements = await Achievement.findAll({ where: { playerId } });
  const latestSnapshot = await snapshotService.findLatest(playerId);

  // Sort the definitions so that related definitions are clustered
  const definitions = getDefinitions().sort(
    (a, b) =>
      a.metric.localeCompare(b.metric) || a.measure.localeCompare(b.measure) || a.threshold - b.threshold
  );

  const clamp = (val: number) => round(Math.min(Math.max(val, 0), 1), 4);
  const findDate = (d: AchievementDefinition) => achievements.find(a => a.name === d.name)?.createdAt;

  // These achievements might share metrics/measures with others, but should be
  // handled seperately (ex: Maxed Overall should not be clustered with 500m Overall Exp.)
  const uniqueAchievements = ['Maxed Overall', '126 Combat'];

  return definitions.map((d, i) => {
    const wasPrevUnique = uniqueAchievements.includes(definitions[i - 1]?.name);
    const isFirstInCluster = i === 0 || wasPrevUnique || definitions[i - 1].metric !== d.metric;

    const startValue = getAchievementStartValue(d);
    const currentValue = getAchievementValue(d, latestSnapshot);
    const prevThreshold = isFirstInCluster ? startValue : definitions[i - 1].threshold;

    return {
      playerId,
      name: d.name,
      metric: d.metric,
      measure: d.measure,
      threshold: d.threshold,
      currentValue,
      absoluteProgress: clamp((currentValue - startValue) / (d.threshold - startValue)),
      relativeProgress: clamp((currentValue - prevThreshold) / (d.threshold - prevThreshold)),
      createdAt: findDate(d) || null
    };
  });
}

async function syncAchievements(playerId: number): Promise<void> {
  // Fetch the player's latest 2 snapshots
  const snapshots = await snapshotService.findAll(playerId, 2);

  if (!snapshots || snapshots.length < 2) return;

  const [current, previous] = snapshots;

  // Find all achievements the player already has
  const currentAchievements = await Achievement.findAll({ where: { playerId } });

  // Find any missing achievements (by comparing the SHOULD HAVE with the HAS IN DATABASE lists)
  const missingDefinitions = getDefinitions().filter(d => {
    return d.validate(previous) && !currentAchievements.find(e => e.name === d.name);
  });

  // Find any new achievements (only achieved since the last snapshot)
  const newDefinitions = getDefinitions().filter(d => {
    return !d.validate(previous) && d.validate(current);
  });

  // Nothing to add.
  if (newDefinitions.length === 0 && missingDefinitions.length === 0) return;

  // Search dates for missing definitions, based on player history
  const missingPastDates = await calculatePastDates(playerId, missingDefinitions);

  // Create achievement instances for all the missing definitions
  const missingAchievements = missingDefinitions.map(d => {
    return { ...d, playerId, createdAt: missingPastDates[d.name] || UNKNOWN_DATE };
  });

  // Create achievement instances for all the newly achieved definitions
  const newAchievements = newDefinitions.map(d => {
    return { ...d, playerId, createdAt: current.createdAt };
  });

  // Add all missing/new achievements
  await Achievement.bulkCreate([...missingAchievements, ...newAchievements], { ignoreDuplicates: true });
}

async function reevaluateAchievements(playerId: number): Promise<void> {
  // Find all unknown date achievements
  const unknownAchievements = await Achievement.findAll({
    where: { playerId, createdAt: UNKNOWN_DATE }
  });

  const unknownAchievementNames = unknownAchievements.map(u => u.name);
  const unknownDefinitions = getDefinitions().filter(d => unknownAchievementNames.includes(d.name));

  // Search dates for previously unknown definitions, based on player history
  const pastDates = await calculatePastDates(playerId, unknownDefinitions);

  // Attach new dates where possible, and filter out any (still) unknown achievements
  const toUpdate = unknownAchievements
    .map(a => ({ ...a.toJSON(), createdAt: pastDates[a.name] || UNKNOWN_DATE }))
    .filter(a => a.createdAt.getTime() > 0);

  if (toUpdate && toUpdate.length > 0) {
    const transaction = await sequelize.transaction();

    // Remove outdated achievements
    await Achievement.destroy({
      where: { playerId, name: toUpdate.map((t: any) => t.name) },
      transaction
    });

    // Re-add them with the correct date
    await Achievement.bulkCreate(toUpdate, { transaction, ignoreDuplicates: true });

    await transaction.commit();
  }
}

async function getGroupAchievements(playerIds: number[], pagination: Pagination) {
  const achievements = await Achievement.findAll({
    where: { playerId: playerIds },
    include: [{ model: Player }],
    order: [['createdAt', 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset
  });

  return achievements.map(format);
}

async function calculatePastDates(playerId: number, definitions: AchievementDefinition[]) {
  if (!definitions || definitions.length === 0) return {};

  const allSnapshots = (await snapshotService.findAll(playerId, 10_000)).reverse();

  // The player must have atleast 2 snapshots to find a achievement date
  if (!allSnapshots || allSnapshots.length < 2) return [];

  const dateMap: { [definitionName: string]: Date } = {};

  for (let i = 0; i < allSnapshots.length - 2; i++) {
    const prev = allSnapshots[i];
    const next = allSnapshots[i + 1];

    // Include only definitions that are "newly" valid (between two snapshots)
    const valid = definitions.filter(d => {
      // Check if the previous value is > -1, this prevents this calc from setting the first snapshot
      // after May 10th 2020 as the achievement date for any pre-WOM boss achievements
      // (boss tracking was introduced on May 10th 2020)
      return !d.validate(prev) && d.validate(next) && prev[getValueKey(d.metric)] > -1;
    });

    valid.forEach(v => {
      if (!(v.name in dateMap)) {
        dateMap[v.name] = next.createdAt;
      }
    });
  }

  return dateMap;
}

function getDefinitions(): AchievementDefinition[] {
  const definitions = [];

  ACHIEVEMENT_TEMPLATES.forEach(({ thresholds, name, validate, metric, measure }) => {
    thresholds.forEach(threshold => {
      const newName = name.replace('{threshold}', formatThreshold(threshold));
      const validateFn = (snapshot: Snapshot) => validate(snapshot, threshold);

      definitions.push({ name: newName, metric, measure, threshold, validate: validateFn });
    });
  });

  return definitions;
}

function format(achievement: Achievement): ExtendedAchievement {
  return { ...(achievement.toJSON() as any), measure: getAchievementMeasure(achievement.metric) };
}

function getAchievementMeasure(metric: string): string {
  if (isBoss(metric)) return 'kills';
  if (isSkill(metric)) return 'experience';
  if (isActivity(metric)) return 'score';
  if (isVirtual(metric)) return 'value';
  return 'levels';
}

function getAchievementValue(definition: AchievementDefinition, snapshot: Snapshot) {
  const { metric, measure, threshold } = definition;

  if (metric === 'combat') {
    return getCombatLevel(snapshot);
  }

  if (metric === 'overall' && measure === 'experience' && threshold === CAPPED_MAX_TOTAL_XP) {
    return getCappedTotalXp(snapshot);
  }

  return snapshot[getValueKey(metric)];
}

function getAchievementStartValue(definition: AchievementDefinition) {
  if (definition.metric === 'combat') return 3;
  if (definition.metric === 'hitpoints') return 1154;
  if (definition.metric === 'last_man_standing') return 500;
  if (definition.metric === 'overall' && definition.measure === 'experience') return 1154;
  return 0;
}

function formatThreshold(threshold: number): string {
  if (threshold === 13_034_431) return '99';
  if (threshold === CAPPED_MAX_TOTAL_XP) return '2277';
  if (threshold < 1000 || threshold === 2277) return String(threshold);
  if (threshold <= 10_000) return `${Math.floor(threshold / 1000)}k`;

  if (threshold < 1_000_000_000)
    return `${Math.round((threshold / 1_000_000 + Number.EPSILON) * 100) / 100}m`;

  return `${Math.round((threshold / 1_000_000_000 + Number.EPSILON) * 100) / 100}b`;
}

export {
  syncAchievements,
  reevaluateAchievements,
  getPlayerAchievements,
  getPlayerAchievementsProgress,
  getGroupAchievements
};
