import { z } from 'zod';
import { Metric, MetricMeasure, round } from '../../../../utils';
import prisma, { Achievement, modifyAchievements } from '../../../../prisma';
import * as snapshotServices from '../../snapshots/snapshot.services';
import { AchievementProgress, AchievementDefinition } from '../achievement.types';
import { getAchievementDefinitions } from '../achievement.utils';

const ALL_DEFINITIONS = getAchievementDefinitions();

const inputSchema = z.object({
  id: z.number().int().positive()
});

type FindProgressParams = z.infer<typeof inputSchema>;

async function findPlayerAchievementProgress(payload: FindProgressParams): Promise<AchievementProgress[]> {
  const params = inputSchema.parse(payload);

  // Fetch all the player's achievements
  const achievements = await prisma.achievement
    .findMany({ where: { playerId: params.id } })
    .then(modifyAchievements);

  // Find the player's latest snapshot
  const latestSnapshot = await snapshotServices.findPlayerSnapshot({ id: params.id });

  // Get all definitions and sort them so that related definitions are clustered
  const definitions = clusterDefinitions(ALL_DEFINITIONS);

  return definitions.map((d, i) => {
    const prevDef = definitions[i - 1];
    const isFirstInCluster = i === 0 || prevDef.metric !== d.metric || prevDef.measure !== d.measure;

    const startValue = getAchievementStartValue(d);
    const currentValue = latestSnapshot ? d.getCurrentValue(latestSnapshot) : 0;
    const prevThreshold = isFirstInCluster ? startValue : prevDef.threshold;

    return {
      ...d,
      playerId: params.id,
      currentValue,
      absoluteProgress: clamp((currentValue - startValue) / (d.threshold - startValue)),
      relativeProgress: clamp((currentValue - prevThreshold) / (d.threshold - prevThreshold)),
      createdAt: findDate(d, achievements) || null
    };
  }) as AchievementProgress[];
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

function findDate(definition: AchievementDefinition, achievements: Achievement[]) {
  // TODO: this can be optimized to map the names to dates, instead of iterating through the list
  return achievements.find(a => a.name === definition.name)?.createdAt;
}

export { findPlayerAchievementProgress };
