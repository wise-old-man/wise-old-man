import prisma from '../../prisma';
import { Period } from '../../types';
import { PeriodProps } from '../../utils/shared';
import { Job } from '../job.class';
import { JobType } from '../types/job-type.enum';

const CHECKS_PER_DAY = 1000;

export class ScheduleBannedPlayerChecksJob extends Job<unknown> {
  async execute() {
    // Find random banned players, and re-check if they are still banned
    const randomBannedPlayers = await prisma.$queryRaw<Array<{ username: string }>>`
      SELECT "username" FROM public.players WHERE "status" = 'banned'
      ORDER BY random() LIMIT ${CHECKS_PER_DAY / 2}
    `;

    // Find random unranked players, and check if they are actually banned
    const randomUnrankedPlayers = await prisma.$queryRaw<Array<{ username: string }>>`
      SELECT "username" FROM public.players WHERE "status" = 'unranked'
      ORDER BY random() LIMIT ${CHECKS_PER_DAY / 2}
    `;

    const usernamesToCheck = [
      ...randomBannedPlayers.map(player => player.username),
      ...randomUnrankedPlayers.map(player => player.username)
    ];

    // Distribute the checks evenly throughout the day
    const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / CHECKS_PER_DAY);

    for (let i = 0; i < usernamesToCheck.length; i++) {
      const username = usernamesToCheck[i];
      this.jobManager.add(JobType.CHECK_PLAYER_BANNED, { username }, { delay: i * cooldown });
    }
  }
}
