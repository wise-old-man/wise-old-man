import prisma from '../../../prisma';
import { EventPeriodDelay } from '../../services/external/discord.service';
import * as competitionEvents from '../../modules/competitions/competition.events';
import { JobType, JobDefinition } from '../job.types';

// Since the cronjob runs at every minute (at 00 seconds) and most competitions start at 00 seconds
// it is prudent to add a safety gap so that we search dates from X:55 to X+1:55 instead of always at 00
const SAFETY_GAP = 5_000;

// How often this job is executed (once every minute)
const EXECUTION_FREQUENCY = 60_000;

// 6h, 5min, now
const START_TIME_INTERVALS = [360, 5, 0];

// 12h, 30min, now
const END_TIME_INTERVALS = [720, 30, 0];

class ScheduleCompetitionEventsJob implements JobDefinition<{}> {
  type: JobType;

  constructor() {
    this.type = JobType.SCHEDULE_COMPETITION_EVENTS;
  }

  async execute() {
    // Schedule "starting" and "started" events for each interval
    await Promise.all(
      START_TIME_INTERVALS.map(async t => {
        await scheduleStarting(t * 60 * 1000);
      })
    );

    // Schedule "ending" and "ended" events for each interval
    await Promise.all(
      END_TIME_INTERVALS.map(async t => {
        await scheduleEnding(t * 60 * 1000);
      })
    );
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

  competitionsStarting.forEach(c => {
    const eventDelay = Math.max(0, c.startsAt.getTime() - delayMs - Date.now());

    setTimeout(() => {
      // If competition is starting in < 1min, schedule the "started" event instead
      if (delayMs === 0) {
        competitionEvents.onCompetitionStarted(c);
      } else {
        competitionEvents.onCompetitionStarting(c, getEventPeriodDelay(delayMs));
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
    }
  });

  competitionsEnding.forEach(c => {
    const eventDelay = Math.max(0, c.endsAt.getTime() - delayMs - Date.now());

    setTimeout(() => {
      // If competition is ending in < 1min, schedule the "ended" event instead
      if (delayMs === 0) {
        competitionEvents.onCompetitionEnded(c);
      } else {
        competitionEvents.onCompetitionEnding(c, getEventPeriodDelay(delayMs));
      }
    }, eventDelay);
  });
}

function getEventPeriodDelay(delayMs: number): EventPeriodDelay {
  const minutes = delayMs / 1000 / 60;
  return minutes < 60 ? { minutes } : { hours: minutes / 60 };
}

export default new ScheduleCompetitionEventsJob();
