const Queue = require('bull');
const redisConfig = require('./redis');
const logger = require('../logger');
const jobs = require('./instances');
const crons = require('./crons');

const PRIORITY_HIGH = 1;
const PRIORITY_MEDIUM = 2;
const PRIORITY_LOW = 3;

function instance() {
  // Initialize all job queues
  const queues = [];

  /**
   * Adds a new job to the queue, to be executed ASAP.
   */
  function add(name, data, options) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const queue = queues.find(q => q.name === name);

    if (!queue) {
      throw new Error(`No job found for name ${name}`);
    }

    if (data && data.username && data.username === 'psikoi') {
      const priority = (options && options.priority) || PRIORITY_MEDIUM;
      console.log(data, { ...options, priority });
      queue.bull.add(data, { ...options, priority });
    }
  }

  /**
   * Adds new scheduled job, to be executed at the specified date.
   */
  function schedule(name, data, date) {
    const secondsTill = date - new Date();

    // Don't allow scheduling for past dates
    if (secondsTill >= 0) {
      add(name, data, { delay: secondsTill, priority: PRIORITY_MEDIUM });
    }
  }

  async function setup() {
    queues.push(
      ...Object.values(jobs).map(job => ({
        bull: new Queue(job.name, redisConfig),
        ...job
      }))
    );

    // Initialize all queue processing
    queues.forEach(queue => {
      queue.bull.process(queue.handle);

      // On Success callback
      queue.bull.on('completed', job => queue.onSuccess && queue.onSuccess(job.data));

      // On Failure callback
      queue.bull.on('failed', (job, error) => {
        if (queue.onFail) {
          queue.onFail(job.data, error);
        }

        logger.error(`Failed job (${job.queue.name})`, {
          data: job.data,
          error: { ...error, message: error.message || '' }
        });
      });
    });

    // If running through pm2 (production), only run cronjobs on the first CPU core.
    // Otherwise, on a 4 core server, every cronjob would run 4x as often.
    // Note: This will also run in development environments
    if (!process.env.pm_id || parseInt(process.env.pm_id, 10) === 0) {
      // Remove any active cron jobs
      queues.forEach(async ({ bull }) => {
        const activeQueues = await bull.getRepeatableJobs();
        activeQueues.forEach(async job => bull.removeRepeatable({ cron: job.cron, jobId: job.id }));
      });

      // Start all cron jobs (with a 10 second delay, to wait for old jobs to be removed)
      // TODO: this can be improved to await for the removal above, instead of the hacky 10sec wait
      setTimeout(() => {
        crons.forEach(cron =>
          add(cron.jobName, null, { repeat: { cron: cron.cronConfig }, priority: PRIORITY_LOW })
        );
      }, 10000);
    }
  }

  return {
    queues,
    add,
    setup,
    schedule,
    PRIORITY_MEDIUM,
    PRIORITY_LOW,
    PRIORITY_HIGH
  };
}

module.exports = instance();
