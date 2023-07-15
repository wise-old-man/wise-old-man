import prisma from '../../../prisma';
import {
  fixAchievementsAccuracy,
  reevaluatePlayerAchievements
} from '../../modules/achievements/achievement.services';
import { JobType, JobDefinition } from '../job.types';
import logger from '../../util/logging';

const CHECKS_PER_MINUTE = 20;

class FixAchievementsAccuracyJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.FIX_ACHIEVEMENTS_ACCURACY;
  }

  async execute() {
    await fixNullAccuracy();
    await fixInvalidAccuracy();
  }
}

async function fixInvalidAccuracy() {
  const start = Date.now();

  // Find 10 players with achievements with missing "accuracy"
  const uncheckedPlayerIds = (
    await prisma.$queryRaw<Array<{ playerId: number }>>`
      SELECT DISTINCT("playerId") FROM public.achievements
      WHERE "accuracy" = -2
      LIMIT ${CHECKS_PER_MINUTE}
  `
  ).map(p => p.playerId);

  if (uncheckedPlayerIds.length === 0) return;

  for (const playerId of uncheckedPlayerIds) {
    await prisma.achievement.updateMany({
      where: {
        accuracy: -2,
        playerId
      },
      data: {
        accuracy: null,
        createdAt: new Date(0)
      }
    });

    await reevaluatePlayerAchievements({ id: playerId });
  }

  logger.debug(
    'Fixed invalid accuracy achievements',
    { playerIds: uncheckedPlayerIds, duration: Date.now() - start },
    true
  );
}

async function fixNullAccuracy() {
  const start = Date.now();

  // Find 5 players with achievements with missing "accuracy"
  const uncheckedPlayerIds = (
    await prisma.$queryRaw<Array<{ playerId: number }>>`
      SELECT DISTINCT("playerId") FROM public.achievements
      WHERE "accuracy" IS NULL
      LIMIT ${CHECKS_PER_MINUTE}
  `
  ).map(p => p.playerId);

  if (uncheckedPlayerIds.length === 0) return;

  for (const playerId of uncheckedPlayerIds) {
    await fixAchievementsAccuracy({ id: playerId });
  }

  logger.debug(
    'Fixed null accuracy achievements',
    { playerIds: uncheckedPlayerIds, duration: Date.now() - start },
    true
  );
}

export default new FixAchievementsAccuracyJob();
