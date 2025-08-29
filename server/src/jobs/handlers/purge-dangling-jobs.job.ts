import { getThreadIndex } from '../../env';
import { sendDiscordWebhook } from '../../services/discord.service';
import { Job } from '../job.class';

export class PurgeDanglingJobsJob extends Job<unknown> {
  async execute() {
    if (
      process.env.NODE_ENV === 'test' ||
      (process.env.NODE_ENV === 'production' && getThreadIndex() !== 0)
    ) {
      return;
    }

    const purgedKeys = await this.jobManager.purgeDanglingJobs();

    if (purgedKeys.length === 0 || process.env.DISCORD_MONITORING_WEBHOOK_URL === undefined) {
      return;
    }

    await sendDiscordWebhook({
      webhookUrl: process.env.DISCORD_MONITORING_WEBHOOK_URL,
      content: `Purged ${purgedKeys.length} dangling jobs:\n${purgedKeys.slice(0, 20).join('\n')}`
    });
  }
}
