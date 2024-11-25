import { Metric } from '../../utils';
import redisService from '../../api/services/external/redis.service';
import prisma from '../../prisma';
import { Job } from '../job.utils';

export class SyncLastRankedJob extends Job<unknown> {
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

    await redisService.setValue('last_rank', Metric.LEAGUE_POINTS, String(lastRanked));
  }
}
