import prisma from '../../prisma';
import { CompetitionTimeEvent, CompetitionTimeEventStatus, CompetitionTimeEventType } from '../../types';
import { assertNever } from '../../utils/assert-never.util';
import { JobManager } from '../job-manager';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';
import { JobType } from '../types/job-type.enum';

interface Payload {
  competitionTimeEventId: number;
}

export class ExecuteCompetitionTimeEventJob extends Job<Payload> {
  static options: JobOptions = {
    backoff: 30_000,
    attempts: 10
  };

  async execute(payload: Payload) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const event = await prisma.competitionTimeEvent.findFirst({
      where: {
        id: payload.competitionTimeEventId
      }
    });

    if (event === null || event.status !== CompetitionTimeEventStatus.EXECUTING) {
      return;
    }

    switch (event.type) {
      case CompetitionTimeEventType.BEFORE_START: {
        await dispatchBeforeStartEvents(event, this.jobManager);
        await completeEvent(event);

        break;
      }
      case CompetitionTimeEventType.BEFORE_END: {
        await dispatchBeforeEndEvents(event, this.jobManager);
        await completeEvent(event);

        break;
      }
      case CompetitionTimeEventType.DURING: {
        // TODO: There are no during tasks just yet
        await completeEvent(event);

        break;
      }
    }
  }
}

async function completeEvent(event: CompetitionTimeEvent) {
  switch (event.type) {
    case CompetitionTimeEventType.BEFORE_START:
    case CompetitionTimeEventType.BEFORE_END: {
      await prisma.competitionTimeEvent.update({
        where: {
          id: event.id
        },
        data: {
          status: CompetitionTimeEventStatus.COMPLETED,
          completedAt: new Date()
        }
      });
      break;
    }
    case CompetitionTimeEventType.DURING: {
      const competition = await prisma.competition.findFirst({
        where: {
          id: event.competitionId
        }
      });

      const nextTick = new Date(Date.now() + event.offsetMinutes * 60 * 1000);
      const shouldReplicate = competition !== null && nextTick.getTime() < competition.endsAt.getTime();

      await prisma.competitionTimeEvent.update({
        where: {
          id: event.id
        },
        data: shouldReplicate
          ? {
              status: CompetitionTimeEventStatus.WAITING,
              executingAt: null,
              executeAt: new Date(event.executeAt.getTime() + event.offsetMinutes * 60 * 1000)
            }
          : {
              status: CompetitionTimeEventStatus.COMPLETED,
              completedAt: new Date()
            }
      });
      break;
    }
    default:
      assertNever(event.type);
  }
}

async function dispatchBeforeStartEvents(event: CompetitionTimeEvent, jobManager: JobManager) {
  // Competition has started
  if (event.offsetMinutes === 0) {
    await jobManager.add(JobType.DISPATCH_COMPETITION_STARTED_DISCORD_EVENT, {
      competitionId: event.competitionId
    });

    await jobManager.add(JobType.UPDATE_COMPETITION_SCORE, {
      competitionId: event.competitionId
    });

    await jobManager.add(JobType.UPDATE_COMPETITION_PARTICIPANTS, {
      competitionId: event.competitionId,
      trigger: 'competition-started'
    });

    return;
  }

  // Competition is starting
  await jobManager.add(JobType.DISPATCH_COMPETITION_STARTING_DISCORD_EVENT, {
    competitionId: event.competitionId,
    minutesLeft: event.offsetMinutes
  });
}

async function dispatchBeforeEndEvents(event: CompetitionTimeEvent, jobManager: JobManager) {
  // Competition has ended
  if (event.offsetMinutes === 0) {
    await jobManager.add(JobType.UPDATE_COMPETITION_SCORE, {
      competitionId: event.competitionId
    });

    await jobManager.add(JobType.DISPATCH_COMPETITION_ENDED_DISCORD_EVENT, {
      competitionId: event.competitionId
    });

    return;
  }

  // Competition is ending
  await jobManager.add(JobType.DISPATCH_COMPETITION_ENDING_DISCORD_EVENT, {
    competitionId: event.competitionId,
    minutesLeft: event.offsetMinutes
  });

  switch (event.offsetMinutes) {
    case 120: {
      /**
       * 2 hours before a competition ends, update any players that are actually competing in the competition,
       * this is just a precaution in case the competition manager forgets to update people before the end.
       * With this, we can ensure that any serious competitors will at least be updated once 2 hours before it ends.
       * Note: We're doing this 2 hours before, because that'll still allow "update all" to update these players in the final hour.
       */
      jobManager.add(JobType.UPDATE_COMPETITION_PARTICIPANTS, {
        competitionId: event.competitionId,
        trigger: 'competition-ending-2h'
      });

      break;
    }
    case 720: {
      /**
       * 12 hours before a competition ends, update all participants. This solves a fairly rare occurence
       * where a player is actively competing, but has only been updated once at the start of the competition.
       * By updating them again 12h before it ends, that'll award them some gains, ensuring they get updated twice,
       * and making them an active competitor. This active competitor status is important for the code block above this,
       * where 2h before a competition ends, all active competitors get updated again.
       * Note: These should be low priority updates as to not delay regularly scheduled updates.
       * 10-12h should be more than enough for these to slowly get processed.
       */
      jobManager.add(JobType.UPDATE_COMPETITION_PARTICIPANTS, {
        competitionId: event.competitionId,
        trigger: 'competition-ending-12h'
      });

      break;
    }
  }
}
