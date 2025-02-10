import { datetimeRegex, z } from 'zod';
import { Job } from '../job.utils';
import OpenAiService from '../../api/services/external/openai.service';
import prisma from '../../prisma';

export class CheckOffensiveNamesJob extends Job<unknown> {
  async execute(): Promise<void> {
    const systemInstruction =
      'Act as a content moderator and filter out any usernames that are offensive or inappropriate. \n This includes hate speech, slurs, violent language, and any variations of these words, such as replacing letters with numbers or symbols.';

    const expectedResultFormat = z.object({
      offensiveUsernames: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          type: z.string()
        })
      )
    });
    const timeAgo = new Date();
    timeAgo.setTime(timeAgo.getTime() - 1000 * 60 * 5);

    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        createdAt: {
          gte: timeAgo
        }
      }
    });

    const competitions = await prisma.competition.findMany({
      select: {
        id: true,
        title: true
      },
      where: {
        createdAt: {
          gte: timeAgo
        }
      }
    });

    const allItems = [
      ...groups.map(g => ({ ...g, type: 'group' })),
      ...competitions.map(c => ({ ...c, type: 'competition' }))
    ];

    if (allItems.length === 0) {
      return;
    }

    const offesniveNames = await OpenAiService.makePrompt(
      JSON.stringify(allItems),
      systemInstruction,
      expectedResultFormat
    );
  }
}
