import prisma from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { Competition, Group, Period } from '../../types';
import { PeriodProps } from '../../utils/shared';
import { Job } from '../job.class';

const CREATION_SPAM_THRESHOLD = 5;

export class CheckCreationSpamJob extends Job<unknown> {
  async execute() {
    const minuteAgo = new Date(Date.now() - 60 * 1000);

    const recentlyCreatedGroups = await prisma.$queryRaw<Array<Group & { creatorIpHash: string }>>`
      SELECT * FROM public.groups WHERE "createdAt" >= ${minuteAgo} AND "creatorIpHash" IS NOT NULL
    `;

    const recentlyCreatedCompetitions = await prisma.$queryRaw<
      Array<Competition & { creatorIpHash: string }>
    >`
      SELECT c.* FROM public.competitions c
      LEFT JOIN public.groups g ON c."groupId" = g."id"
      WHERE c."createdAt" >= ${minuteAgo} AND c."creatorIpHash" IS NOT NULL AND (c."groupId" IS NULL OR g."verified" = false)
    `;

    const byIpHashMap = new Map<
      string,
      {
        ipHash: string;
        groups: Group[];
        competitions: Competition[];
      }
    >();

    recentlyCreatedGroups.forEach(group => {
      const current = byIpHashMap.get(group.creatorIpHash);

      if (current) {
        current.groups.push(group);
      } else {
        byIpHashMap.set(group.creatorIpHash, {
          ipHash: group.creatorIpHash,
          groups: [group],
          competitions: []
        });
      }
    });

    recentlyCreatedCompetitions.forEach(competition => {
      const current = byIpHashMap.get(competition.creatorIpHash);

      if (current) {
        current.competitions.push(competition);
      } else {
        byIpHashMap.set(competition.creatorIpHash, {
          ipHash: competition.creatorIpHash,
          groups: [],
          competitions: [competition]
        });
      }
    });

    const potentialOffenders = Array.from(byIpHashMap.values()).filter(({ groups, competitions }) => {
      return groups.length + competitions.length >= CREATION_SPAM_THRESHOLD;
    });

    await prisma.$transaction(async transaction => {
      // Hide all groups and competitions created within the past 24h and by potential offenders

      const dayAgo = new Date(Date.now() - PeriodProps[Period.DAY].milliseconds);

      for (const potentialOffender of potentialOffenders) {
        if (potentialOffender.groups.length > 0) {
          await transaction.group.updateMany({
            where: {
              creatorIpHash: potentialOffender.ipHash,
              createdAt: {
                gte: dayAgo
              }
            },
            data: {
              visible: false
            }
          });
        }

        if (potentialOffender.competitions.length > 0) {
          await transaction.competition.updateMany({
            where: {
              creatorIpHash: potentialOffender.ipHash,
              createdAt: {
                gte: dayAgo
              }
            },
            data: {
              visible: false
            }
          });
        }
      }
    });

    for (const potentialOffender of potentialOffenders) {
      dispatchDiscordBotEvent(DiscordBotEventType.POTENTIAL_CREATION_SPAM, potentialOffender);
    }
  }
}
