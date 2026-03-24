import { formatCompetitionResponse, formatGroupResponse } from '../../api/responses';
import prisma, { PrismaTypes } from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { Competition, Group } from '../../types';
import { JobHandler } from '../types/job-handler.type';

export const CheckProtectedPlayersSpamJobHandler: JobHandler = {
  async execute() {
    if (process.env.SERVER_API_ABUSE_PROTECTED_PLAYERS_LIST === undefined) {
      return;
    }

    const protectedPlayers = process.env.SERVER_API_ABUSE_PROTECTED_PLAYERS_LIST.split(',').map(p =>
      p.trim()
    );

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

    const byIpHashMap = new Map<string, { groups: Group[]; competitions: Competition[] }>();

    for (const group of susGroups) {
      if (!group.creatorIpHash) continue;
      const current = byIpHashMap.get(group.creatorIpHash);
      if (current) {
        current.groups.push(group);
      } else {
        byIpHashMap.set(group.creatorIpHash, { groups: [group], competitions: [] });
      }
    }

    for (const competition of susCompetitions) {
      if (!competition.creatorIpHash) continue;
      const current = byIpHashMap.get(competition.creatorIpHash);
      if (current) {
        current.competitions.push(competition);
      } else {
        byIpHashMap.set(competition.creatorIpHash, { groups: [], competitions: [competition] });
      }
    }

    for (const [ipHash, { groups, competitions }] of byIpHashMap) {
      await dispatchDiscordBotEvent(DiscordBotEventType.CREATION_SPAM_WARNING, {
        creatorIpHash: ipHash,
        type: 'protected-players' as const,
        groups: groups.map(group => ({
          group: formatGroupResponse(group, -1)
        })),
        competitions: competitions.map(competition => ({
          competition: formatCompetitionResponse({ ...competition, participantCount: -1, metrics: [] }, null)
        }))
      });
    }
  }
};
