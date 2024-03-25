import prisma from '../../prisma';
import { Period, PeriodProps } from '../../utils';
import jobManager from '../job.manager';
import { Job } from '../job.utils';
import { CheckPlayerBannedJob } from './CheckPlayerBannedJob';

const CHECKS_PER_DAY = 1000;

class ScheduleBannedPlayerChecksJob extends Job {
  async execute() {
    // Get 1000 random banned players, and throughout the day verify that they're still banned
    await confirmBans();

    // Get 1000 random unranked players, and check if they're banned
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

  for (let i = 0; i < randomUnrankedPlayers.length; i++) {
    const { username } = randomUnrankedPlayers[i];
    // offset by 30s to ensure it doesn't compete with the other checks for rate limits
    jobManager.add(new CheckPlayerBannedJob(username).setDelay(i * cooldown + 30_000));
  }
}

async function confirmBans() {
  // Get 100 random banned players
  const randomBannedPlayers = await prisma.$queryRaw<Array<{ username: string }>>`
    SELECT "username" FROM public.players WHERE "status" = 'banned'
    ORDER BY random() LIMIT ${CHECKS_PER_DAY}
  `;

  // Distribute the checks evenly throughout the day
  const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / randomBannedPlayers.length);

  for (let i = 0; i < randomBannedPlayers.length; i++) {
    const { username } = randomBannedPlayers[i];
    // offset by 30s to ensure it doesn't compete with the other checks for rate limits
    jobManager.add(new CheckPlayerBannedJob(username).setDelay(i * cooldown));
  }
}

export { ScheduleBannedPlayerChecksJob };
