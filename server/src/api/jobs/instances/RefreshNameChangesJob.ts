import prisma from '../../../prisma';
import { NameChangeStatus } from '../../../utils';
import { JobType, JobDefinition } from '../job.types';
import { jobManager } from '..';

/**
 * The delay between each review, in milliseconds, to prevent
 * overloading the server with this low priority task
 */
const REVIEW_COOLDOWN = 90_000;

class RefreshNameChangesJob implements JobDefinition<{}> {
  type: JobType;

  constructor() {
    this.type = JobType.REFRESH_NAME_CHANGES;
  }

  async execute() {
    // List the latest 100 pending name change requests
    const pending = await prisma.nameChange.findMany({
      where: { status: NameChangeStatus.PENDING },
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    // Schedule a name change review for each, with a 90sec interval between them
    pending.forEach((p, i) => {
      jobManager.add(
        { type: JobType.REVIEW_NAME_CHANGE, payload: { nameChangeId: p.id } },
        { delay: (i + 1) * REVIEW_COOLDOWN }
      );
    });
  }
}

export default new RefreshNameChangesJob();
