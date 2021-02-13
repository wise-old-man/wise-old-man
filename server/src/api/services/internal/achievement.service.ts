import { Pagination } from '../../../types';
import { sequelize } from '../../../database';
import { Achievement, Snapshot, Player } from '../../../database/models';
import { isSkill, isActivity, isBoss, isVirtual, getValueKey } from '../../util/metrics';
import { round } from '../../util/numbers';
import { getLevel } from '../../util/experience';
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
  getCurrentValue?: (snapshot: Snapshot, threshold: number) => number;
}
interface AchievementDefinition {
  name: string;
  metric: string;
  measure: string;
  threshold: number;
  validate: (snapshot: Snapshot) => boolean;
  getCurrentValue: (snapshot: Snapshot) => number;
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

  return definitions.map((d, i) => {
    const { name, metric, measure, threshold, getCurrentValue } = d;

    const prevDef = definitions[i - 1];
    const isFirstInCluster = i === 0 || prevDef.metric !== metric || prevDef.measure !== measure;

    const startValue = getAchievementStartValue(d);
    const currentValue = getCurrentValue(latestSnapshot);
    const prevThreshold = isFirstInCluster ? startValue : prevDef.threshold;

    const absoluteProgress = clamp((currentValue - startValue) / (threshold - startValue));
    const relativeProgress = clamp((currentValue - prevThreshold) / (threshold - prevThreshold));
    const createdAt = findDate(d) || null;

    return {
      playerId,
      name,
      metric,
      measure,
      threshold,
      currentValue,
      absoluteProgress,
      relativeProgress,
      createdAt
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

  ACHIEVEMENT_TEMPLATES.forEach(({ thresholds, name, metric, measure, getCurrentValue }) => {
    thresholds.forEach(threshold => {
      const newName = getAchievemenName(name, threshold);

      const getCurrentValueFn = (snapshot: Snapshot) => {
        return getCurrentValue ? getCurrentValue(snapshot, threshold) : snapshot[getValueKey(metric)];
      };

      const validateFn = (snapshot: Snapshot) => {
        return getCurrentValueFn(snapshot) >= threshold;
      };

      definitions.push({
        name: newName,
        metric,
        measure,
        threshold,
        validate: validateFn,
        getCurrentValue: getCurrentValueFn
      });
    });
  });

  return definitions;
}

function format(achievement: Achievement): ExtendedAchievement {
  const measure = getAchievementMeasure(achievement.metric, achievement.threshold);
  return { ...(achievement.toJSON() as any), measure };
}

function getAchievemenName(name: string, threshold: number): string {
  const newName = name
    .replace('{threshold}', formatThreshold(threshold))
    .replace('{level}', formatThreshold(threshold));

  if (newName === 'Base 99 Stats') {
    return 'Maxed Overall';
  }

  return newName;
}

function getAchievementMeasure(metric: string, threshold: number): string {
  if (metric === 'overall' && threshold <= 13_034_431) return 'levels';
  if (isBoss(metric)) return 'kills';
  if (isSkill(metric)) return 'experience';
  if (isActivity(metric)) return 'score';
  if (isVirtual(metric)) return 'value';
  return 'levels';
}

function getAchievementStartValue(definition: AchievementDefinition) {
  if (definition.metric === 'combat') return 3;
  if (definition.metric === 'hitpoints') return 1154;
  if (definition.metric === 'last_man_standing') return 500;
  if (definition.metric === 'overall' && definition.measure === 'experience') return 1154;
  return 0;
}

function formatThreshold(threshold: number): string {
  if (threshold < 1000) return String(threshold);
  if (threshold <= 10_000) return `${Math.floor(threshold / 1000)}k`;

  if ([737_627, 1_986_068, 5_346_332, 13_034_431].includes(threshold)) {
    return getLevel(threshold).toString();
  }

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
