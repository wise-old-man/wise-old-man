import { standardizeUsername } from '../../api/modules/players/player.utils';
import { formatCompetitionResponse, formatGroupResponse } from '../../api/responses';
import prisma, { PrismaTypes } from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { Competition, Group, Metric } from '../../types';
import { JobHandler } from '../types/job-handler.type';

export const CheckProtectedPlayersSpamJobHandler: JobHandler = {
  async execute() {
    if (!process.env.SERVER_ABUSE_PROTECTED_PLAYERS_LIST) {
      return;
    }

    const protectedPlayers = process.env.SERVER_ABUSE_PROTECTED_PLAYERS_LIST.split(',').map(p =>
      standardizeUsername(p.trim())
    );

    const [susGroups, susCompetitions] = await Promise.all([
      prisma.$queryRaw<Array<Group>>`
        SELECT DISTINCT g.*
        FROM public.groups g
        JOIN public.memberships m ON m."groupId" = g."id"
        JOIN public.players p ON p."id" = m."playerId"
        WHERE p."username" IN (${PrismaTypes.join(protectedPlayers)})
        AND g."visible" = true
        AND g."verified" = false
      `,
      prisma.$queryRaw<Array<Competition>>`
        SELECT DISTINCT c.*
        FROM public.competitions c
        JOIN public.participations pp ON pp."competitionId" = c."id"
        JOIN public.players p ON p."id" = pp."playerId"
        LEFT JOIN public.groups g ON g."id" = c."groupId"
        WHERE p."username" IN (${PrismaTypes.join(protectedPlayers)})
        AND c."visible" = true
        AND (c."groupId" IS NULL OR g."verified" = false)
    `
    ]);

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
          competition: formatCompetitionResponse(
            {
              ...competition,
              participantCount: -1,
              metrics: [
                // Placeholder
                {
                  competitionId: competition.id,
                  metric: Metric.OVERALL,
                  createdAt: new Date(),
                  deletedAt: null
                }
              ]
            },
            null
          )
        }))
      });
    }
  }
};
