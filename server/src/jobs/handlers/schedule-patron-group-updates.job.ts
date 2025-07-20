import prisma from '../../prisma';
import { STATIC_PATRON_GROUP_IDS } from '../../services/patreon.service';
import { Period, PlayerStatus } from '../../types';
import { PeriodProps } from '../../utils/shared';
import { Job } from '../job.class';
import { JobPriority } from '../types/job-priority.enum';
import { JobType } from '../types/job-type.enum';

export class SchedulePatronGroupUpdatesJob extends Job<unknown> {
  async execute() {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const patronGroupIds = await prisma.patron
      .findMany({
        where: { groupId: { not: null } },
        select: { groupId: true }
      })
      .then(res => res.map(p => p.groupId).filter(Boolean));

    const dayAgo = new Date(Date.now() - PeriodProps[Period.DAY].milliseconds);

    const outdatedPatronMembers = await prisma.membership.findMany({
      where: {
        groupId: {
          in: [...patronGroupIds, ...STATIC_PATRON_GROUP_IDS]
        },
        player: {
          OR: [{ updatedAt: { lt: dayAgo } }, { updatedAt: null }],
          status: { not: PlayerStatus.ARCHIVED }
        }
      },
      include: {
        player: { select: { username: true } }
      }
    });

    // Execute the update action for every member
    outdatedPatronMembers.forEach(({ player: { username } }) => {
      this.jobManager.add(JobType.UPDATE_PLAYER, { username }, { priority: JobPriority.LOW });
    });
  }
}
