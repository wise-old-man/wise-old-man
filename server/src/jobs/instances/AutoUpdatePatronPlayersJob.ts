import prisma from '../../prisma';
import { Period, PeriodProps } from '../../utils';
import { Job, JobPriority } from '../job.utils';

export class AutoUpdatePatronPlayersJob extends Job<unknown> {
  async execute() {
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    const dayAgo = new Date(Date.now() - PeriodProps[Period.DAY].milliseconds);

    const outdatedPatronPlayers = await prisma.patron
      .findMany({
        where: {
          playerId: { not: null },
          player: {
            OR: [{ updatedAt: { lt: dayAgo } }, { updatedAt: null }]
          }
        },
        include: {
          player: true
        }
      })
      .then(res => res.map(p => p.player).filter(Boolean));

    // Execute the update action for every member
    outdatedPatronPlayers.forEach(({ username }) => {
      this.jobManager.add('UpdatePlayerJob', { username }, { priority: JobPriority.HIGH });
    });
  }
}
