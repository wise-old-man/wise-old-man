import { isErrored } from '@attio/fetchable';
import { z } from 'zod';
import prisma from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { OpenAiService } from '../../services/openai.service';
import { METRICS } from '../../types';
import { MetricProps } from '../../utils/shared';
import { Job } from '../job.class';

const WHITELISTED_TERMS = [
  'noob',
  'race',
  'cox',
  'dead',
  'death',
  'goat',
  'sotw',
  'botw',
  ...METRICS.map(m => MetricProps[m].name)
];

const SYSTEM_PROMPT = `
  Act as a content moderator for an Old School RuneScape platform.
  Your role is to flag seriously offensive or inappropriate content only — including hate speech, slurs, threats, or violent language, even if obfuscated with symbols or numbers.

  This is a light-hearted gaming community: slightly offensive, sexual or edgy content is acceptable in context.
  Some whitelisted terms may contain substrings that are offensive elsewhere — do not flag these.
  
  Only flag content you are confident is seriously offensive.

  <input>
    You will be given:

    - A list of groups and competitions, each with an "id", "type, "name", and optionally a "description".
    - A list of white-listed terms that are perfectly acceptable.
      - You may consider common variations of these terms as acceptable too, such as the term's initials, abbreviations, or common misspellings.
  </input>

  <output>
    Return a list of entities that should be flagged, preserving their original structure, but with an added "reason" field explaining why the content was filtered.

    <example>
      input: [
        { "id": 28475, "type": "group", "name": "The Best Group", "description": "This is a group for the best players" },
        { "id": 489, "type": "group", "name": "Stupid fucks", "description": "This is a group of the dumbest fucking idiots" },
        { "id": 3849, "type": "competition", "name": "Pieces of shit" }
      ]
      output: [
        { 
          "id": 489, 
          "type": "group", 
          "name": "Stupid fucks", 
          "description": "This is a group for the best players", 
          "reason": "Contains explicit profanity ('fucks', 'fucking') and derogatory language ('dumbest idiots') intended to insult or demean others."
        },
        { 
          "id": 3849, 
          "type": "competition", 
          "name": "The stinkiest people", 
          "reason": "Contains vulgar and offensive phrase ('pieces of shit') used to insult or degrade others."
        }
      ]
    </example>
  </output>
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

export class CheckInappropriateContentJob extends Job<unknown> {
  async execute() {
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
      return;
    }

    const input = {
      entities: inputEntities,
      whiteListedTerms: WHITELISTED_TERMS
    };

    const promptResult = await openAi.makePrompt(
      'gpt-4o',
      JSON.stringify(input),
      SYSTEM_PROMPT,
      RESPONSE_SCHEMA
    );

    if (isErrored(promptResult)) {
      // Throw an error to ensure the job fails and is retried
      throw promptResult.error;
    }

    if (promptResult.value.offensiveEntities.length === 0) {
      return;
    }

    await dispatchDiscordBotEvent(
      DiscordBotEventType.OFFENSIVE_NAMES_FOUND,
      promptResult.value.offensiveEntities
    );
  }
}
