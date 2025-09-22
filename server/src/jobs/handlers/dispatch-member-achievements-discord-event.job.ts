import { isErrored } from '@attio/fetchable';
import prisma from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import prometheus from '../../services/prometheus.service';
import { Metric } from '../../types';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';

interface Payload {
  username: string;
  achievements: Array<{
    metric: Metric;
    threshold: number;
  }>;
}

export class DispatchMemberAchievementsDiscordEventJob extends Job<Payload> {
  static options: JobOptions = {
    backoff: {
      type: 'exponential',
      delay: 30_000
    }
  };

  async execute(payload: Payload) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const player = await prisma.player.findFirst({
      where: {
        username: payload.username
      }
    });

    if (player === null) {
      return;
    }

    const achievements = await prisma.achievement.findMany({
      where: {
        playerId: player.id,
        OR: payload.achievements
      }
    });

    const recentAchievements = achievements.filter(a => Date.now() - a.createdAt.getTime() < 3_600_000);

    if (recentAchievements.length === 0) {
      prometheus.trackGenericMetric('test-dispatching-failed-30s');
      return;
    }

    const memberships = await prisma.membership.findMany({
      where: {
        playerId: player.id
      }
    });

    // The following actions are only relevant to players that are group members
    if (memberships.length === 0) {
      return;
    }

    if (payload.username === 'psikoi ii') {
      prometheus.trackGenericMetric('test-dispatching');
    }

    for (const { groupId } of memberships) {
      const dispatchResult = await dispatchDiscordBotEvent(DiscordBotEventType.MEMBER_ACHIEVEMENTS, {
        groupId,
        player,
        achievements: recentAchievements
      });

      if (isErrored(dispatchResult) && dispatchResult.error.code === 'FAILED_TO_SEND_DISCORD_BOT_EVENT') {
        // Throw an error to ensure the job fails and is retried
        throw dispatchResult.error;
      }
    }

    if (payload.username === 'psikoi ii') {
      prometheus.trackGenericMetric('test-dispatched');
    }
  }
}
