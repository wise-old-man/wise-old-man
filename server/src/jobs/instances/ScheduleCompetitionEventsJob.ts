import {
  onCompetitionEnded,
  onCompetitionEnding,
  onCompetitionStarted,
  onCompetitionStarting
} from '../../api/modules/competitions/competition.events';
import { EventPeriodDelay } from '../../api/services/external/discord.service';
import prisma from '../../prisma';
import { Job } from '../job.utils';

// Since the cronjob runs at every minute (at 00 seconds) and most competitions start at 00 seconds
// it is prudent to add a safety gap so that we search dates from X:55 to X+1:55 instead of always at 00
const SAFETY_GAP = 5_000;

// How often this job is executed (once every minute)
const EXECUTION_FREQUENCY = 60_000;

// 6h, 5min, now
const START_TIME_INTERVALS = [360, 5, 0];

// 12h, 2h, 30min, now
const END_TIME_INTERVALS = [720, 120, 30, 0];

class ScheduleCompetitionEventsJob extends Job {
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
}

async function scheduleStarting(delayMs: number): Promise<void> {
  const startSearchDate = new Date(Date.now() - SAFETY_GAP + delayMs);
  const endSearchDate = new Date(startSearchDate.getTime() + EXECUTION_FREQUENCY);

  const competitionsStarting = await prisma.competition.findMany({
    where: {
      startsAt: {
        gte: startSearchDate,
        lte: endSearchDate
      }
    }
  });

  competitionsStarting.forEach((c, index) => {
    const eventDelay = Math.max(0, c.startsAt.getTime() - delayMs - Date.now());

    setTimeout(
      () => {
        // If competition is starting in < 1min, schedule the "started" event instead
        if (delayMs === 0) {
          onCompetitionStarted(c);
        } else {
          onCompetitionStarting(c, getEventPeriodDelay(delayMs));
        }
        // stagger each event by 500ms to avoid overloading the database
      },
      eventDelay + index * 500
    );
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
    }
  });

  competitionsEnding.forEach((c, index) => {
    const eventDelay = Math.max(0, c.endsAt.getTime() - delayMs - Date.now());

    setTimeout(
      () => {
        // If competition is ending in < 1min, schedule the "ended" event instead
        if (delayMs === 0) {
          onCompetitionEnded(c);
        } else {
          onCompetitionEnding(c, getEventPeriodDelay(delayMs));
        }
        // stagger each event by 500ms to avoid overloading the database
      },
      eventDelay + index * 500
    );
  });
}

function getEventPeriodDelay(delayMs: number): EventPeriodDelay {
  const minutes = delayMs / 1000 / 60;
  return minutes < 60 ? { minutes } : { hours: minutes / 60 };
}

export { ScheduleCompetitionEventsJob };
