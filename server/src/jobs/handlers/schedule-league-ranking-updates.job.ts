import axios from 'axios';
import { z } from 'zod';
import { logger } from '../../services/logger.service';
import { redisClient } from '../../services/redis.service';
import { JobHandler } from '../types/job-handler.type';
import { JobPriority } from '../types/job-priority.enum';
import { JobType } from '../types/job-type.enum';

const RANKING_URL = 'https://secure.runescape.com/m=hiscore_oldschool_seasonal/ranking.json';
const CURSOR_REDIS_KEY = 'league-ranking-updates-cursor';
const PAGE_SIZE = 50;
const MAX_RANK = 415_683;

export const ScheduleLeagueRankingUpdatesJobHandler: JobHandler = {
  async execute(_, context) {
    // The cursor is the (0-indexed) "toprank" of the next page to fetch
    const toprank = parseInt((await redisClient.get(CURSOR_REDIS_KEY)) ?? '0');

    if (toprank >= MAX_RANK) {
      // Reached the end of the rankings, nothing left to schedule
      return;
    }

    const response = await axios({
      url: RANKING_URL,
      params: { table: 1, category: 1, size: PAGE_SIZE, toprank }
    });

    const usernames = z
      .array(z.object({ name: z.string() }))
      .parse(response.data)
      .map(entry => entry.name);

    logger.info(`Scheduling league ranking updates for ranks ${toprank + 1} to ${toprank + PAGE_SIZE}`);

    for (const username of usernames) {
      logger.info(`Scheduling league ranking update for player ${username}`);
      await context.jobManager.add(JobType.UPDATE_PLAYER, { username }, { priority: JobPriority.LOW });
    }

    await redisClient.set(CURSOR_REDIS_KEY, (toprank + PAGE_SIZE).toString());
  }
};
