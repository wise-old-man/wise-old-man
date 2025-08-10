import prisma from '../../prisma';
import { STATIC_PATRON_PLAYER_IDS } from '../../services/patreon.service';
import { Period } from '../../types';
import { PeriodProps } from '../../utils/shared';
import { Job } from '../job.class';
import { JobPriority } from '../types/job-priority.enum';
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

    const outdatedStaticPatronPlayers = await prisma.player.findMany({
      where: {
        id: {
          in: STATIC_PATRON_PLAYER_IDS
        },
        OR: [{ updatedAt: { lt: dayAgo } }, { updatedAt: null }]
      }
    });

    [...outdatedPatronPlayers, ...outdatedStaticPatronPlayers].forEach(({ username }) => {
      this.jobManager.add(JobType.UPDATE_PLAYER, { username }, { priority: JobPriority.LOW });
    });
  }
}
