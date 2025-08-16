import prisma, { PrismaTypes } from '../../prisma';
import { sendDiscordWebhook } from '../../services/discord.service';
import { Competition, Group } from '../../types';
import { Job } from '../job.class';

export class CheckProtectedPlayersSpamJob extends Job<unknown> {
  async execute() {
    if (
      process.env.API_ABUSE_PROTECTED_PLAYERS_LIST === undefined ||
      process.env.API_ABUSE_PROTECTED_PLAYERS_URL === undefined
    ) {
      return;
    }

    const protectedPlayers = process.env.API_ABUSE_PROTECTED_PLAYERS_LIST.split(',').map(p => p.trim());

    const [groupResults, competitionResults] = await Promise.all([
      prisma.$queryRaw<Array<Group & { count: number }>>`
        SELECT
            g.*,
            COUNT(DISTINCT p."id") AS count
        FROM public.groups g
        JOIN public.memberships m ON m."groupId" = g."id"
        JOIN public.players p ON p."id" = m."playerId"
        WHERE p."username" IN (${PrismaTypes.join(protectedPlayers)})
        AND g."visible" = true
        GROUP BY g."id"
        ORDER BY count DESC
      `,
      prisma.$queryRaw<Array<Competition & { count: number }>>`
        SELECT 
        c.*,
        COUNT(DISTINCT p."id") AS count
        FROM public.competitions c
        JOIN public.participations pp ON pp."competitionId" = c."id"
        JOIN public.players p ON p."id" = pp."playerId"
        WHERE p."username" IN (${PrismaTypes.join(protectedPlayers)})
        AND c."visible" = true
        GROUP BY c."id"
        ORDER BY count DESC
    `
    ]);

    const susGroups = groupResults.filter(g => g.count > 5);
    const susCompetitions = competitionResults.filter(c => c.count > 5);

    if (susGroups.length === 0 && susCompetitions.length === 0) {
      return;
    }

    await prisma.$transaction(async transaction => {
      if (susGroups.length > 0) {
        await transaction.group.updateMany({
          where: {
            id: {
              in: susGroups.map(g => g.id)
            }
          },
          data: {
            visible: false
          }
        });
      }

      if (susCompetitions.length > 0) {
        await transaction.competition.updateMany({
          where: {
            id: {
              in: susCompetitions.map(g => g.id)
            }
          },
          data: {
            visible: false
          }
        });
      }
    });

    if (susGroups.length > 0) {
      await sendDiscordWebhook({
        content: `🚨🚨🚨 GROUPS 🚨🚨🚨\n${susGroups.map(g => `**ID: ${g.id}**\t${g.name}`).join('\n')}`,
        webhookUrl: process.env.API_ABUSE_PROTECTED_PLAYERS_URL
      });
    }

    if (susCompetitions.length > 0) {
      await sendDiscordWebhook({
        content: `🚨🚨🚨 COMPETITIONS 🚨🚨🚨\n${susCompetitions.map(g => `**ID: ${g.id}**\t${g.title}`).join('\n')}`,
        webhookUrl: process.env.API_ABUSE_PROTECTED_PLAYERS_URL
      });
    }
  }
}
