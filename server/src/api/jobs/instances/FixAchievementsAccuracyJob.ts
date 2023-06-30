import prisma from '../../../prisma';
import { fixAchievementsAccuracy } from '../../modules/achievements/achievement.services';
import { JobType, JobDefinition } from '../job.types';
import logger from '../../util/logging';

const CHECKS_PER_MINUTE = 20;

class FixAchievementsAccuracyJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.FIX_ACHIEVEMENTS_ACCURACY;
  }

  async execute() {
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
      'Checked player achievements',
      { playerIds: uncheckedPlayerIds, duration: Date.now() - start },
      true
    );
  }
}

export default new FixAchievementsAccuracyJob();
