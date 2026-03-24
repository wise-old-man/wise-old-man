import prisma from '../../prisma';
import { Period } from '../../types';
import { PeriodProps } from '../../utils/shared';
import { JobHandler } from '../types/job-handler.type';
import { JobType } from '../types/job-type.enum';

export const ScheduleGroupScoreUpdatesJobHandler: JobHandler = {
  async execute(_payload, context) {
    const groups = await prisma.group.findMany({
      select: { id: true }
    });

    // Distribute these evenly throughout the day, with a variable cooldown between each
    const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / groups.length);

    for (let i = 0; i < groups.length; i++) {
      const groupId = groups[i].id;
      context.jobManager.add(JobType.UPDATE_GROUP_SCORE, { groupId }, { delay: i * cooldown });
    }
  }
};
