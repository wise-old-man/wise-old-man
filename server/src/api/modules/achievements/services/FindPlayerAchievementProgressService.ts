import { z } from 'zod';
import { round, MetricMeasure, Metrics } from '@wise-old-man/utils';
import prisma, { Achievement, modifyAchievements } from '../../../../prisma';
import * as snapshotService from '../../../services/internal/snapshot.service';
import { ProgressAchievement, AchievementDefinition } from '../achievement.types';
import { getAchievementDefinitions } from '../achievement.utils';

const schema = z.object({
  playerId: z.number().int().positive()
});

type FindPlayerAchievementProgressParams = z.infer<typeof schema>;
type FindPlayerAchievementProgressResult = ProgressAchievement[];

class FindPlayerAchievementProgressService {
  validate(payload: any): FindPlayerAchievementProgressParams {
    return schema.parse(payload);
  }

  async execute(params: FindPlayerAchievementProgressParams): Promise<FindPlayerAchievementProgressResult> {
    // Fetch all the player's achievements
    const achievements = await prisma.achievement
      .findMany({ where: { playerId: params.playerId } })
      .then(modifyAchievements);

    // Find the player's latest snapshot
    const latestSnapshot = await snapshotService.findLatest(params.playerId);

    // Get all definitions and sort them so that related definitions are clustered
    const definitions = clusterDefinitions(getAchievementDefinitions());

    return definitions.map((d, i) => {
      const prevDef = definitions[i - 1];
      const isFirstInCluster = i === 0 || prevDef.metric !== d.metric || prevDef.measure !== d.measure;

      const startValue = getAchievementStartValue(d);
      const currentValue = latestSnapshot ? d.getCurrentValue(latestSnapshot) : 0;
      const prevThreshold = isFirstInCluster ? startValue : prevDef.threshold;

      return {
        ...d,
        playerId: params.playerId,
        currentValue,
        absoluteProgress: clamp((currentValue - startValue) / (d.threshold - startValue)),
        relativeProgress: clamp((currentValue - prevThreshold) / (d.threshold - prevThreshold)),
        createdAt: findDate(d, achievements) || null
      };
    });
  }
}

function getAchievementStartValue(definition: AchievementDefinition) {
  if (definition.metric === 'combat') return 3;
  if (definition.metric === Metrics.HITPOINTS) return 1154;
  if (definition.metric === Metrics.LAST_MAN_STANDING) return 500;
  if (definition.metric === Metrics.OVERALL && definition.measure === MetricMeasure.EXPERIENCE) return 1154;
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

export default new FindPlayerAchievementProgressService();
