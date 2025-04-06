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
  Act as a content moderator for an online gaming platform. Your job is to identify and filter out content that is offensive, inappropriate, or spammy.

  You must flag any content that includes:
  - Hate speech, slurs, violent or threatening language.
  - Obfuscated versions of offensive terms (e.g., using numbers or symbols to bypass filters).
  - Spam, gibberish, or content that appears randomly generated.

  However, **do not** flag content that includes:
  - Misspellings or grammatical errors.
  - Promotional or enthusiastic language.
  - Friendly banter that is not overtly offensive or targeted.
  - Content with low context or ambiguous meaning.

  <input>
  You will be given:
  - A list of groups and competitions, each with an "id", "type, "name", and optionally a "description".
  - A list of whitelisted terms that are acceptable in gaming contexts. You may consider common variations of these terms as acceptable too, such as the term's initials.

  <output>
  Return a list of entities that should be flagged, preserving their original structure, but with an added "reason" field explaining why the content was filtered.

  <example>
  input: [
    { "id": 28475, "type": "group", "name": "The Best Group", "description": "This is a group for the best players" },
    { "id": 489, "type": "group", "name": "Stupid fucks", "description": "This is a group of the dumbest idiots ever" },
    { "id": 3849, "type": "competition", "name": "The stinkiest people" }
  ]
  output: [
    { 
      "id": 489, 
      "type": "group", 
      "name": "Stupid fucks", 
      "description": "This is a group of the dumbest idiots ever", 
      "reason": "Contains explicit offensive language ('fucks') and derogatory phrasing targeting a group of people." 
    },
    { 
      "id": 3849, 
      "type": "competition", 
      "name": "The stinkiest people", 
      "reason": "Contains derogatory phrasing ('stinkiest people') that could be offensive or inappropriate." 
    }
  ]
  </example>
`;

const RESPONSE_SCHEMA = z.object({
  offensiveEntities: z.array(
    z.object({
      id: z.number(),
      type: z.string(),
      name: z.string(),
      description: z.string().optional(),
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
      ...competitions.map(c => ({ id: c.id, type: 'competition', name: c.title }))
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
