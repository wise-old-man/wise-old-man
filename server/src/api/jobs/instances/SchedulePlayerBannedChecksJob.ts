import prisma from '../../../prisma';
import { Period, PeriodProps } from '../../..//utils';
import { JobType, JobDefinition } from '../job.types';
import { jobManager } from '..';

const CHECKS_PER_DAY = 100;

class SchedulePlayerBannedChecksJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.SCHEDULE_BANNED_PLAYER_CHECKS;
  }

  async execute() {
    // Get 100 random banned players, and throughout the day verify that they're still banned
    await confirmBans();

    // Get 100 random unranked players, and check if they're banned
    await checkForBans();
  }
}

async function checkForBans() {
  // Get 100 random unranked players
  const randomUnrankedPlayers = await prisma.$queryRaw<Array<{ username: string }>>`
    SELECT "username" FROM public.players WHERE "status" = 'unranked'
    ORDER BY random() LIMIT ${CHECKS_PER_DAY}
 `;

  // Distribute the checks evenly throughout the day
  const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / randomUnrankedPlayers.length);

  randomUnrankedPlayers.forEach((p, i) => {
    jobManager.add(
      { type: JobType.CHECK_PLAYER_BANNED, payload: { username: p.username } },
      { delay: i * cooldown + 30_000 } // offset by 30s to ensure it doesn't compete with the other checks for rate limits
    );
  });
}

async function confirmBans() {
  // Get 100 random banned players
  const randomBannedPlayers = await prisma.$queryRaw<Array<{ username: string }>>`
    SELECT "username" FROM public.players WHERE "status" = 'banned'
    ORDER BY random() LIMIT ${CHECKS_PER_DAY}
  `;

  // Distribute the checks evenly throughout the day
  const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / randomBannedPlayers.length);

  randomBannedPlayers.forEach((p, i) => {
    jobManager.add(
      { type: JobType.CHECK_PLAYER_BANNED, payload: { username: p.username } },
      { delay: i * cooldown }
    );
  });
}

export default new SchedulePlayerBannedChecksJob();
