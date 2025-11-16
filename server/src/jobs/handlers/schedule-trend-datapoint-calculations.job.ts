import prisma from '../../prisma';
import { Country, PLAYER_BUILDS, PLAYER_TYPES } from '../../types';
import { Job } from '../job.class';
import { JobPriority } from '../types/job-priority.enum';
import { JobType } from '../types/job-type.enum';

export class ScheduleTrendDatapointCalculationsJob extends Job<unknown> {
  async execute() {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const countries = await prisma.$queryRaw<Array<{ country: Country }>>`
        SELECT "country" FROM public.players
        GROUP BY "country"
        HAVING COUNT(*) > 30;
      `;

    // Global trend calculation
    this.jobManager.add(JobType.CALCULATE_SAILING_EXP_TREND, {}, { priority: JobPriority.HIGH });

    countries.forEach(({ country }) => {
      this.jobManager.add(JobType.CALCULATE_SAILING_EXP_TREND, {
        segmentType: 'country',
        segmentValue: country
      });
    });

    for (const playerType of PLAYER_TYPES) {
      this.jobManager.add(JobType.CALCULATE_SAILING_EXP_TREND, {
        segmentType: 'player-type',
        segmentValue: playerType
      });
    }

    for (const playerBuild of PLAYER_BUILDS) {
      this.jobManager.add(JobType.CALCULATE_SAILING_EXP_TREND, {
        segmentType: 'player-build',
        segmentValue: playerBuild
      });
    }
  }
}
