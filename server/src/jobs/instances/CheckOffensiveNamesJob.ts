import { z } from 'zod';
import { Job } from '../job.utils';
import { OpenAiService } from '../../api/services/external/openai.service';
import prisma from '../../prisma';

const SYSTEM_PROMPT = `
  Act as a content moderator and filter out any usernames that are offensive, inappropriate or seem like spam. 
  This includes hate speech, slurs, violent language, and any variations of these words, such as replacing letters with numbers or symbols.'
`;

const RESPONSE_SCHEMA = z.object({
  offensiveUsernames: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      type: z.string()
    })
  )
});

export class CheckOffensiveNamesJob extends Job<unknown> {
  async execute(): Promise<void> {
    if (!process.env.OPENAI_API_KEY) {
      return;
    }

    const openAi = new OpenAiService();
    const fiveMinAgo = new Date(Date.now() - 1000 * 60 * 5);

    const [groups, competitions] = await Promise.all([
      prisma.group.findMany({
        select: {
          id: true,
          name: true
        },
        where: {
          createdAt: {
            gte: fiveMinAgo
          }
        }
      }),
      prisma.competition.findMany({
        select: {
          id: true,
          title: true
        },
        where: {
          createdAt: {
            gte: fiveMinAgo
          }
        }
      })
    ]);

    const allItems = [
      ...groups.map(g => ({ ...g, type: 'group' })),
      ...competitions.map(c => ({ ...c, type: 'competition' }))
    ];

    if (allItems.length === 0 || allItems.length >= 50) {
      return;
    }

    const offensiveNames = await openAi.makePrompt(JSON.stringify(allItems), SYSTEM_PROMPT, RESPONSE_SCHEMA);

    if (offensiveNames.offensiveUsernames.length === 0) {
      return;
    }

    // TODO: dispatch discord event
  }
}
