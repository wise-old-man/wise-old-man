import prisma, { Achievement } from '../../../../prisma';
import { Metric, MetricMeasure, round } from '../../../../utils';
import { NotFoundError } from '../../../errors';
import { standardize } from '../../players/player.utils';
import { AchievementDefinition, AchievementProgress } from '../achievement.types';
import { getAchievementDefinitions } from '../achievement.utils';

const ALL_DEFINITIONS = getAchievementDefinitions();

async function findPlayerAchievementProgress(username: string): Promise<AchievementProgress[]> {
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

  return definitions.map((d, i) => {
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
      ...d,
      playerId: player.id,
      createdAt: existingAchievement?.createdAt || null,
      accuracy: existingAchievement?.accuracy || null,
      currentValue,
      absoluteProgress,
      relativeProgress
    };
  });
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
  return round(Math.min(Math.max(val, 0), 1), 4);
}

export { findPlayerAchievementProgress };
