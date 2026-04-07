import prisma from '../../prisma';
import { redisClient } from '../../services/redis.service';
import { JobHandler } from '../types/job-handler.type';

export const SyncLastRankedJobHandler: JobHandler = {
  async execute() {
    const results = await prisma.$queryRaw<{ leagueRank: number }[]>`
      SELECT "leagueRank" FROM public.players
      ORDER BY "leagueRank" DESC
      LIMIT 1
    `;

    if (results.length === 0) {
      return;
    }

    const lastRanked = results[0].leagueRank;
    await redisClient.set('league_points_last_ranked', String(lastRanked));
  }
};
