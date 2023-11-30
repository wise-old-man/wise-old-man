import { JobsOptions, Queue, QueueScheduler, Worker } from 'bullmq';
import { getThreadIndex, isDevelopment, isTesting } from '../../env';
import redisConfig from '../../config/redis.config';
import logger from '../util/logging';
import metricsService from '../services/external/metrics.service';
import redisService from '../services/external/redis.service';
import { DispatchableJob, JobDefinition, JobPriority, JobType } from './job.types';
import InvalidatePeriodDeltasJob from './instances/InvalidatePeriodDeltasJob';
import ReviewNameChangeJob from './instances/ReviewNameChangeJob';
import ScheduleNameChangeReviewsJob from './instances/ScheduleNameChangeReviewsJob';
import ScheduleCompetitionEventsJob from './instances/ScheduleCompetitionEventsJob';
import ScheduleCompetitionScoreUpdatesJob from './instances/ScheduleCompetitionScoreUpdatesJob';
import ScheduleDeltaInvalidationsJob from './instances/ScheduleDeltaInvalidationsJob';
import ScheduleGroupScoreUpdatesJob from './instances/ScheduleGroupScoreUpdatesJob';
import UpdateCompetitionScoreJob from './instances/UpdateCompetitionScoreJob';
import UpdateGroupScoreJob from './instances/UpdateGroupScoreJob';
import UpdatePlayerJob from './instances/UpdatePlayerJob';
import CheckPlayerBannedJob from './instances/CheckPlayerBannedJob';
import CheckPlayerRankedJob from './instances/CheckPlayerRankedJob';
import ScheduleFlaggedPlayerReview from './instances/ScheduleFlaggedPlayerReviewJob';
import SchedulePlayerBannedChecks from './instances/SchedulePlayerBannedChecksJob';
import SyncPatronsJob from './instances/SyncPatronsJob';
import AutoUpdatePatronPlayersJob from './instances/AutoUpdatePatronPlayersJob';
import AutoUpdatePatronGroupsJob from './instances/AutoUpdatePatronGroupsJob';
// import CalculateRankLimitsJob from './instances/CalculateRankLimitsJob';
// import ScheduleRankLimitsCalcsJob from './instances/ScheduleRankLimitsCalcsJob';
// import ScheduleSumCalcsJob from './instances/ScheduleSumCalcsJob';
// import CalculateSumsJob from './instances/CalculateSumsJob';

const JOBS: JobDefinition<unknown>[] = [
  AutoUpdatePatronPlayersJob,
  AutoUpdatePatronGroupsJob,
  // CalculateSumsJob,
  // CalculateRankLimitsJob,
  CheckPlayerBannedJob,
  CheckPlayerRankedJob,
  InvalidatePeriodDeltasJob,
  SyncPatronsJob,
  ReviewNameChangeJob,
  ScheduleCompetitionEventsJob,
  ScheduleCompetitionScoreUpdatesJob,
  ScheduleDeltaInvalidationsJob,
  ScheduleFlaggedPlayerReview,
  ScheduleGroupScoreUpdatesJob,
  ScheduleNameChangeReviewsJob,
  // ScheduleRankLimitsCalcsJob,
  // ScheduleSumCalcsJob,
  SchedulePlayerBannedChecks,
  UpdateCompetitionScoreJob,
  UpdateGroupScoreJob,
  UpdatePlayerJob
];

const CRON_JOBS = [
  {
    type: JobType.SCHEDULE_COMPETITION_EVENTS,
    interval: '* * * * *' // every 1 min
  },
  {
    type: JobType.SYNC_PATRONS,
    interval: '* * * * *' // every 1 min
  },
  {
    type: JobType.AUTO_UPDATE_PATRON_PLAYERS,
    interval: '*/5 * * * *' // every 5 mins
  },
  {
    type: JobType.AUTO_UPDATE_PATRON_GROUPS,
    interval: '*/5 * * * *' // every 5 mins
  },
  {
    type: JobType.SCHEDULE_DELTA_INVALIDATIONS,
    interval: '0 */6 * * *' // every 6 hours
  },
  {
    type: JobType.SCHEDULE_COMPETITION_SCORE_UPDATES,
    interval: '0 */12 * * *' // every 12 hours
  },
  {
    type: JobType.SCHEDULE_GROUP_SCORE_UPDATES,
    interval: '0 8 * * *' // everyday at 8AM
  },
  {
    type: JobType.SCHEDULE_BANNED_PLAYER_CHECKS,
    interval: '0 8 * * *' // everyday at 8AM
  }
  // {
  //   type: JobType.SCHEDULE_RANK_LIMIT_CALCS,
  //   interval: '0 * * * *' // every hour (reduce to every 24h at 9AM later)
  // },
  // {
  //   type: JobType.SCHEDULE_SUM_CALCS,
  //   interval: '0 10 * * *' // everyday at 10AM
  // }
];

class JobManager {
  private queues: Queue[];
  private workers: Worker[];
  private schedulers: QueueScheduler[];

  constructor() {
    this.queues = [];
    this.workers = [];
    this.schedulers = [];
  }

  /**
   * Adds a new job to the queue, to be executed ASAP.
   */
  async add(job: DispatchableJob, options?: JobsOptions) {
    if (isTesting()) return;

    const matchingQueue = this.queues.find(q => q.name === job.type);

    if (!matchingQueue) {
      throw new Error(`No job implementation found for type "${job.type}".`);
    }

    if (job.type === JobType.UPDATE_PLAYER) {
      // Check if this username is already in cooldown
      const cooldown = await redisService.getValue('cd:UpdatePlayer', job.payload.username);

      if (cooldown) return;

      // Store the current timestamp to activate the cooldown (1h)
      await redisService.setValue('cd:UpdatePlayer', job.payload.username, Date.now(), 3_600_000);
    }

    const priority = (options && options.priority) || JobPriority.MEDIUM;
    const payload = 'payload' in job ? job.payload : {};

    logger.info(`Added job: ${job.type}`, 'payload' in job ? job.payload : {}, true);

    matchingQueue.add(job.type, payload, { ...options, priority });
  }

  private initQueues() {
    this.queues = JOBS.map(job => {
      const opts = { removeOnComplete: true, removeOnFail: true, ...(job.options?.defaultOptions || {}) };

      // Create a new scheduler instance for this job
      this.schedulers.push(
        new QueueScheduler(job.type, {
          prefix: 'league_job',
          connection: redisConfig
        })
      );

      return new Queue(job.type, {
        prefix: 'league_job',
        connection: redisConfig,
        defaultJobOptions: opts
      });
    });
  }

  private initWorkers() {
    this.workers = JOBS.map(job => {
      const worker = new Worker(
        job.type,
        async bullJob => {
          await metricsService.trackJob(job.type, async () => {
            const attemptTag = bullJob.opts.attempts > 0 ? `(#${bullJob.attemptsMade})` : '';
            logger.info(`Executing job: ${job.type} ${attemptTag}`, bullJob.data, true);

            await job.execute(bullJob.data);
          });
        },
        {
          prefix: 'league_job',
          limiter: job.options?.rateLimiter,
          connection: redisConfig,
          autorun: false
        }
      );

      worker.on('failed', (bullJob, error) => {
        const maxAttempts = bullJob.opts.attempts || 1;

        if (bullJob.attemptsMade >= maxAttempts && job.onFailedAllAttempts) {
          job.onFailedAllAttempts(bullJob.data, error);
        }

        if (job.onFailure) job.onFailure(bullJob.data, error);
        logger.error(`Failed job: ${job.type}`, { ...bullJob.data, error }, true);
      });

      worker.on('completed', bullJob => {
        if (job.onSuccess) job.onSuccess(bullJob.data);
      });

      return worker;
    });

    this.workers.forEach(worker => {
      worker.run();
    });
  }

  private async initCrons() {
    // Deactivate any active cron jobs
    await Promise.all(
      this.queues.map(async queue => {
        const activeJobs = await queue.getRepeatableJobs();
        await Promise.all(activeJobs.map(job => queue.removeRepeatableByKey(job.key)));
      })
    );

    // Reactivate all cron jobs
    CRON_JOBS.forEach(cron => {
      const matchingQueue = this.queues.find(q => q.name === cron.type);

      if (!matchingQueue) {
        throw new Error(`No job implementation found for type "${cron.type}".`);
      }

      matchingQueue.add(cron.type, {}, { repeat: { pattern: cron.interval } });
    });
  }

  init() {
    this.initQueues();
    this.initWorkers();

    // If running through pm2 (production), only run cronjobs on the first CPU core.
    // Otherwise, on a 4 core server, every cronjob would run 4x as often.
    if (getThreadIndex() === 0 || isDevelopment()) {
      this.initCrons();
    }
  }

  async shutdown() {
    await Promise.all([
      ...this.queues.map(queue => queue.close()),
      ...this.workers.map(worker => worker.close()),
      ...this.schedulers.map(scheduler => scheduler.close())
    ]);
  }
}

export default new JobManager();
