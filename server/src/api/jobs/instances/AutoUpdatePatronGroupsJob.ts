import prisma from '../../../prisma';
import { Period, PeriodProps } from '../../../utils';
import { JobDefinition, JobPriority, JobType } from '../job.types';
import { jobManager } from '..';

class AutoUpdatePatronGroupsJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.AUTO_UPDATE_PATRON_GROUPS;
  }

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
      jobManager.add(
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

export default new AutoUpdatePatronGroupsJob();
