import ms from 'ms';
import prisma from '../../prisma';
import { CompetitionTimeEvent, CompetitionTimeEventStatus } from '../../types';
import { JobHandler } from '../types/job-handler.type';
import { JobType } from '../types/job-type.enum';

const MAX_EVENTS_TO_ENQUEUE = 100;

export const EnqueueCompetitionTimeEventsJobHandler: JobHandler<unknown> = {
  async execute(_payload, context) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const overdueEvents = await prisma.competitionTimeEvent.findMany({
      where: {
        status: {
          in: [CompetitionTimeEventStatus.WAITING, CompetitionTimeEventStatus.EXECUTING]
        },
        executeAt: {
          lte: new Date()
        }
      },
      take: MAX_EVENTS_TO_ENQUEUE
    });

    if (overdueEvents.length === 0) {
      return;
    }

    const toFail: Array<CompetitionTimeEvent> = [];
    const toExecute: Array<CompetitionTimeEvent> = [];

    for (const event of overdueEvents) {
      switch (event.status) {
        case CompetitionTimeEventStatus.WAITING:
          toExecute.push(event);
          break;
        case CompetitionTimeEventStatus.EXECUTING: {
          // If has been stuck in "executing" for more than 30 minutes, consider it failed
          if (!event.executingAt || event.executingAt < new Date(Date.now() - ms('30 minutes'))) {
            toFail.push(event);
          }
          break;
        }
      }
    }

    if (toFail.length > 0) {
      await prisma.competitionTimeEvent.updateMany({
        where: {
          id: {
            in: toFail.map(e => e.id)
          }
        },
        data: {
          status: CompetitionTimeEventStatus.FAILED,
          failedAt: new Date()
        }
      });
    }

    if (toExecute.length > 0) {
      await prisma.competitionTimeEvent.updateMany({
        where: {
          id: {
            in: toExecute.map(e => e.id)
          }
        },
        data: {
          status: CompetitionTimeEventStatus.EXECUTING,
          executingAt: new Date()
        }
      });

      for (const event of toExecute) {
        await context.jobManager.add(JobType.EXECUTE_COMPETITION_TIME_EVENT, {
          competitionTimeEventId: event.id
        });
      }
    }

    if (overdueEvents.length >= MAX_EVENTS_TO_ENQUEUE) {
      // There's likely more overdue events to enqueue - re-dispatch this same task
      await context.jobManager.add(JobType.ENQUEUE_COMPETITION_TIME_EVENTS, {}, { delay: 5000 });
    }
  }
};
