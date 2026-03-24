import { eventEmitter, EventType } from '../../api/events';
import prisma from '../../prisma';
import { JobHandler } from '../types/job-handler.type';

// Since the cronjob runs at every minute (at 00 seconds) and most competitions start at 00 seconds
// it is prudent to add a safety gap so that we search dates from X:55 to X+1:55 instead of always at 00
const SAFETY_GAP = 5_000;

// How often this job is executed (once every minute)
const EXECUTION_FREQUENCY = 60_000;

// 6h, 5min, now
const START_TIME_INTERVALS = [360, 5, 0];

// 12h, 2h, 30min, now
const END_TIME_INTERVALS = [720, 120, 30, 0];

export const ScheduleCompetitionEventsJobHandler: JobHandler = {
  async execute() {
    // Schedule "starting" and "started" events for each interval
    for (const start of START_TIME_INTERVALS) {
      await scheduleStarting(start * 60 * 1000);
    }

    // Schedule "ending" and "ended" events for each interval
    for (const end of END_TIME_INTERVALS) {
      await scheduleEnding(end * 60 * 1000);
    }
  }
};

async function scheduleStarting(delayMs: number): Promise<void> {
  const startSearchDate = new Date(Date.now() - SAFETY_GAP + delayMs);
  const endSearchDate = new Date(startSearchDate.getTime() + EXECUTION_FREQUENCY);

  const competitionsStarting = await prisma.competition.findMany({
    where: {
      startsAt: {
        gte: startSearchDate,
        lte: endSearchDate
      }
    },
    include: {
      competitionTimeEvents: true
    }
  });

  competitionsStarting
    // If this competition has been backfilled to the new time events, skip it
    .filter(c => c.competitionTimeEvents.length === 0)
    .forEach(c => {
      const eventDelay = Math.max(0, c.startsAt.getTime() - delayMs - Date.now());

      setTimeout(() => {
        if (delayMs === 0) {
          eventEmitter.emit(EventType.COMPETITION_STARTED, {
            competitionId: c.id
          });
        } else {
          eventEmitter.emit(EventType.COMPETITION_STARTING, {
            competitionId: c.id,
            minutesLeft: delayMs / 1000 / 60
          });
        }
      }, eventDelay);
    });
}

async function scheduleEnding(delayMs: number): Promise<void> {
  const startSearchDate = new Date(Date.now() - SAFETY_GAP + delayMs);
  const endSearchDate = new Date(startSearchDate.getTime() + EXECUTION_FREQUENCY);

  const competitionsEnding = await prisma.competition.findMany({
    where: {
      endsAt: {
        gte: startSearchDate,
        lte: endSearchDate
      }
    },
    include: {
      competitionTimeEvents: true
    }
  });

  competitionsEnding
    // If this competition has been backfilled to the new time events, skip it
    .filter(c => c.competitionTimeEvents.length === 0)
    .forEach(c => {
      const eventDelay = Math.max(0, c.endsAt.getTime() - delayMs - Date.now());

      setTimeout(() => {
        // If competition is ending in < 1min, schedule the "ended" event instead
        if (delayMs === 0) {
          eventEmitter.emit(EventType.COMPETITION_ENDED, {
            competitionId: c.id
          });
        } else {
          eventEmitter.emit(EventType.COMPETITION_ENDING, {
            competitionId: c.id,
            minutesLeft: delayMs / 1000 / 60
          });
        }
      }, eventDelay);
    });
}
