import { Op } from 'sequelize';
import { EventPeriodDelay } from 'src/types';
import { Competition } from '../../../database/models';
import {
  onCompetitionEnded,
  onCompetitionEnding,
  onCompetitionStarted,
  onCompetitionStarting
} from '../../events/competition.events';
import metricsService from '../../services/external/metrics.service';
import { Job } from '../index';

// Since the cronjob runs at every minute (at 00 seconds) and most competitions start at 00 seconds
// it is prudent to add a safety gap so that we search dates from X:55 to X+1:55 instead of always at 00
const SAFETY_GAP = 5_000;

// How often this job is executed (once every minute)
const EXECUTION_FREQUENCY = 60_000;

// 24h, 6h, 1h, 5min, now
const TIME_INTERVALS = [1440, 360, 60, 30, 5, 0];

class ScheduleCompetitionEvents implements Job {
  name: string;

  constructor() {
    this.name = 'ScheduleCompetitionEvents';
  }

  async handle(): Promise<void> {
    const endTimer = metricsService.trackJobStarted();

    try {
      // Loop through al the TIME_INTERVALS and schedule events for each interval
      await Promise.all(
        TIME_INTERVALS.map(async t => {
          await scheduleStarting(t * 60 * 1000);
          await scheduleEnding(t * 60 * 1000);
        })
      );

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

async function scheduleStarting(delayMs: number): Promise<void> {
  const startSearchDate = Date.now() - SAFETY_GAP + delayMs;
  const endSearchDate = startSearchDate + EXECUTION_FREQUENCY;

  const competitionsStarting = await Competition.findAll({
    where: { startsAt: { [Op.between]: [startSearchDate, endSearchDate] } }
  });

  competitionsStarting.forEach(c => {
    const eventDelay = Math.max(0, c.startsAt.getTime() - delayMs - Date.now());

    setTimeout(() => {
      // If competition is starting in < 1min, schedule the "started" event instead
      if (delayMs === 0) {
        onCompetitionStarted(c);
      } else {
        onCompetitionStarting(c, getEventPeriodDelay(delayMs));
      }
    }, eventDelay);
  });
}

async function scheduleEnding(delayMs: number): Promise<void> {
  const startSearchDate = Date.now() - SAFETY_GAP + delayMs;
  const endSearchDate = startSearchDate + EXECUTION_FREQUENCY;

  const competitionsEnding = await Competition.findAll({
    where: { endsAt: { [Op.between]: [startSearchDate, endSearchDate] } }
  });

  competitionsEnding.forEach(c => {
    const eventDelay = Math.max(0, c.endsAt.getTime() - delayMs - Date.now());

    setTimeout(() => {
      // If competition is ending in < 1min, schedule the "ended" event instead
      if (delayMs === 0) {
        onCompetitionEnded(c);
      } else {
        onCompetitionEnding(c, getEventPeriodDelay(delayMs));
      }
    }, eventDelay);
  });
}

function getEventPeriodDelay(delayMs: number): EventPeriodDelay {
  const minutes = delayMs / 1000 / 60;
  return minutes < 60 ? { minutes } : { hours: minutes / 60 };
}

export default new ScheduleCompetitionEvents();
