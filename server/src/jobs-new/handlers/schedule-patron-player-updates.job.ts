import prisma from '../../prisma';
import { Period, PeriodProps } from '../../utils';
import { Job } from '../job.class';
import { JobType } from '../types/job-type.enum';

export class SchedulePatronPlayerUpdatesJob extends Job<unknown> {
  async execute() {
    if (process.env.NODE_ENV !== 'production') {
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

    outdatedPatronPlayers.forEach(({ username }) => {
      this.jobManager.add(JobType.UPDATE_PLAYER, { username, source: 'schedule-patron-player-updates' });
    });
  }
}
