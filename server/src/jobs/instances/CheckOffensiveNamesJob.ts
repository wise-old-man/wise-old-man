import { z } from 'zod';
import { Job } from '../job.utils';
import { OpenAiService } from '../../api/services/external/openai.service';
import prisma from '../../prisma';
import { dispatchOffensiveNamesFound } from '../../api/services/external/discord.service';
import { MetricProps, METRICS } from '../../utils';

const WHITELISTED_TERMS = [
  'noob',
  'race',
  'cox',
  'dead',
  'death',
  'goat',
  ...METRICS.map(m => MetricProps[m].name)
];

const SYSTEM_PROMPT = `
  Act as a content moderator for an online gaming platform and filter out any content that is offensive, innapropriate, or spammy.
  This includes hate speech, slurs, violent language, and any variations of these words, such as replacing letters with numbers or symbols.
  You should filter out any content that seem like spam, gibberish or randomly generated.
  Misspellings and promotional language is accepted.
  Friendly banter is accepted, you should only filter out obviously offensive language or terms.

  <input>
    - You will be given a list of groups and competitions, each with an id, name, description and type.
    - You will also be given a list of whitelisted terms, some of which are acceptable in the context of gaming.
    - Feel free to also consider variations of these whitelisted terms.
  </input>

  <output>
    - You must return a list of offending entities, in the same shape as your input, but with an added field "reason".
    - The "reason" field should be an explanation of why that entity was filtered out.
  </output>

  <example>
  input: [
    { "id": 28475, "type": "group", "name": "The Best Group", "description": "This is a group for the best players" },
    { "id": 489, "type": "group", "name": "Stupid fucks", "description": "This is a group of the dumbest idiots ever" },
  ]
  output: [
    { "id": 489, "type": "group", "name": "Stupid fucks", "description": "This is a group of the dumbest idiots ever", "reason": "Contains offensive language ('fucks') and derogatory phrasing targeting a group of people." }
  ]
  </example>
`;

const RESPONSE_SCHEMA = z.object({
  offensiveEntities: z.array(
    z.object({
      id: z.number(),
      type: z.string(),
      name: z.string(),
      description: z.string(),
      reason: z.string()
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
          name: true,
          description: true
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

    const inputEntities = [
      ...groups.map(g => ({ ...g, type: 'group' })),
      ...competitions.map(c => ({ ...c, type: 'competition', description: '' }))
    ];

    if (inputEntities.length === 0 || inputEntities.length >= 50) {
      // TODO: if > 50, send warning to private discord channel
      return;
    }

    const input = {
      entities: inputEntities,
      whiteListedTerms: WHITELISTED_TERMS
    };

    const response = await openAi.makePrompt(
      'gpt-4o-mini',
      JSON.stringify(input),
      SYSTEM_PROMPT,
      RESPONSE_SCHEMA
    );

    if (response.offensiveEntities.length === 0) {
      return;
    }

    dispatchOffensiveNamesFound(response.offensiveEntities);
  }
}
