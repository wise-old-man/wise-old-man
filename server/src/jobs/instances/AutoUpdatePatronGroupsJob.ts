import { jobManager as oldJobManager } from '../../api/jobs';
import { JobPriority, JobType } from '../../api/jobs/job.types';
import prisma from '../../prisma';
import { Period, PeriodProps } from '../../utils';
import { Job } from '../job.utils';

class AutoUpdatePatronGroupsJob extends Job {
  async execute() {
    if (process.env.NODE_ENV === 'development') {
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
        groupId: { in: patronGroupIds },
        player: {
          OR: [{ updatedAt: { lt: dayAgo } }, { updatedAt: null }]
        }
      },
      include: {
        player: { select: { username: true } }
      }
    });

    // Execute the update action for every member
    outdatedPatronMembers.forEach(member => {
      oldJobManager.add(
        {
          type: JobType.UPDATE_PLAYER,
          payload: { username: member.player.username }
        },
        {
          priority: JobPriority.HIGH
        }
      );
    });
  }
}

export { AutoUpdatePatronGroupsJob };
