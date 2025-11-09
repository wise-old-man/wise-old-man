import prisma from '../../../../prisma';
import { Achievement, AchievementDefinition, Metric, MetricMeasure } from '../../../../types';
import { omit } from '../../../../utils/omit.util';
import { pick } from '../../../../utils/pick.util';
import { roundNumber } from '../../../../utils/shared/round-number.util';
import { NotFoundError } from '../../../errors';
import { standardize } from '../../players/player.utils';
import { LEGACY_TEMPLATE_NAMES } from '../achievement.templates';
import { getAchievementDefinitions } from '../achievement.utils';

const ALL_DEFINITIONS = getAchievementDefinitions();

async function findPlayerAchievementProgress(username: string): Promise<
  Array<{
    achievement: Omit<Achievement, 'createdAt'>;
    createdAt: Date | null;
    currentValue: number;
    absoluteProgress: number;
    relativeProgress: number;
  }>
> {
  const player = await prisma.player.findFirst({
    where: {
      username: standardize(username)
    },
    include: {
      latestSnapshot: true
    }
  });

  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  let latestSnapshot = player.latestSnapshot;

  // If this player has no populated latest snapshot, fetch it first
  if (!latestSnapshot) {
    latestSnapshot = await prisma.snapshot.findFirst({
      where: { playerId: player.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Fetch all the player's achievements
  const achievements = await prisma.achievement.findMany({
    where: {
      playerId: player.id
    }
  });

  // Map achievement names to achievement objects, for O(1) lookups
  const currentAchievementMap = new Map<string, Achievement>();
  achievements.forEach(achievement => currentAchievementMap.set(achievement.name, achievement));

  // Get all definitions and sort them so that related definitions are clustered
  const definitions = clusterDefinitions(ALL_DEFINITIONS);

  // Achievements that were once given, but are no longer valid (such as Base X stats Pre-Sailing)
  const legacyAchievements = achievements.filter(d => LEGACY_TEMPLATE_NAMES.includes(d.name));

  return [
    ...definitions.map((d, i) => {
      const prevDef = definitions[i - 1];
      const isFirstInCluster = i === 0 || prevDef.metric !== d.metric || prevDef.measure !== d.measure;

      const startValue = getAchievementStartValue(d);
      const currentValue = latestSnapshot ? d.getCurrentValue(latestSnapshot) : 0;
      const prevThreshold = isFirstInCluster ? startValue : prevDef.threshold;

      const existingAchievement = currentAchievementMap.get(d.name);

      let absoluteProgress = clamp((currentValue - startValue) / (d.threshold - startValue));
      let relativeProgress = clamp((currentValue - prevThreshold) / (d.threshold - prevThreshold));

      // Prevent rounding progress to 1.0 if the player has not yet reached the threshold
      if (absoluteProgress === 1 && currentValue < d.threshold) absoluteProgress = 0.9999;
      if (relativeProgress === 1 && currentValue < d.threshold) relativeProgress = 0.9999;

      return {
        achievement: {
          ...pick(d, 'name', 'metric', 'threshold'),
          playerId: player.id,
          accuracy: existingAchievement ? existingAchievement.accuracy : null
        },
        createdAt: existingAchievement ? existingAchievement.createdAt : null,
        accuracy: existingAchievement ? existingAchievement.accuracy : null,
        currentValue,
        absoluteProgress,
        relativeProgress
      };
    }),
    ...legacyAchievements.map(a => ({
      achievement: omit(a, 'createdAt'),
      createdAt: a.createdAt,
      currentValue: a.threshold,
      absoluteProgress: 1,
      relativeProgress: 1
    }))
  ];
}

function getAchievementStartValue(definition: AchievementDefinition) {
  if (definition.metric === Metric.HITPOINTS) return 1154;
  if (definition.metric === Metric.LAST_MAN_STANDING) return 500;
  if (definition.metric === Metric.OVERALL && definition.measure === MetricMeasure.EXPERIENCE) return 1154;

  return 0;
}

function clusterDefinitions(definitions: AchievementDefinition[]) {
  return definitions.sort((a, b) => {
    return (
      a.metric.localeCompare(b.metric) || a.measure.localeCompare(b.measure) || a.threshold - b.threshold
    );
  });
}

function clamp(val: number) {
  return roundNumber(Math.min(Math.max(val, 0), 1), 4);
}

export { findPlayerAchievementProgress };
