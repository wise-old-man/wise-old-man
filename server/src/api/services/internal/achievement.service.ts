import { Pagination } from '../../../types';
import { sequelize } from '../../../database';
import { Achievement, Snapshot, Player } from '../../../database/models';
import { isSkill, isActivity, isBoss, isVirtual, getValueKey } from '../../util/metrics';
import { CAPPED_MAX_TOTAL_XP } from '../../util/experience';
import { ACHIEVEMENT_TEMPLATES } from '../../modules/achievements/templates';
import * as snapshotService from './snapshot.service';

const UNKNOWN_DATE = new Date(0);

export interface AchievementTemplate {
  name: string;
  metric: string;
  measure: string;
  thresholds: number[];
  validate: (snapshot: Snapshot, threshold: number) => boolean;
}

interface ExtendedAchievement extends Achievement {
  measure: string;
}

interface AchievementDefinition {
  name: string;
  metric: string;
  measure: string;
  threshold: number;
  validate: (snapshot: Snapshot) => boolean;
}

async function getPlayerAchievements(playerId: number) {
  const achievements = await Achievement.findAll({
    where: { playerId }
  });

  return achievements.map(format);
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

function formatThreshold(threshold: number): string {
  if (threshold === 13_034_431) return '99';
  if (threshold === CAPPED_MAX_TOTAL_XP) return '2277';
  if (threshold < 1000 || threshold === 2277) return String(threshold);
  if (threshold <= 10_000) return `${Math.floor(threshold / 1000)}k`;

  if (threshold < 1_000_000_000)
    return `${Math.round((threshold / 1_000_000 + Number.EPSILON) * 100) / 100}m`;

  return `${Math.round((threshold / 1_000_000_000 + Number.EPSILON) * 100) / 100}b`;
}

export { syncAchievements, reevaluateAchievements, getPlayerAchievements, getGroupAchievements };
