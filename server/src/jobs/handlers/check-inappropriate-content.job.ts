import { isErrored } from '@attio/fetchable';
import ms from 'ms';
import { z } from 'zod';
import { formatCompetitionResponse, formatGroupResponse } from '../../api/responses';
import prisma from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { OpenAiService } from '../../services/openai.service';
import { Competition, Group, METRICS } from '../../types';
import { MetricProps } from '../../utils/shared';
import { JobHandler } from '../types/job-handler.type';

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

export const CheckInappropriateContentJobHandler: JobHandler = {
  async execute() {
    if (!process.env.SERVER_OPENAI_API_KEY) {
      return;
    }

    const openAi = new OpenAiService();
    const fiveMinAgo = new Date(Date.now() - ms('5 min'));

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

    const promptResult = await openAi.makePrompt(
      'gpt-5.4',
      JSON.stringify({
        entities: inputEntities,
        whiteListedTerms: WHITELISTED_TERMS
      }),
      SYSTEM_PROMPT,
      RESPONSE_SCHEMA
    );

    if (isErrored(promptResult)) {
      // Throw an error to ensure the job fails and is retried
      throw promptResult.error;
    }

    const offensiveEntities = promptResult.value.offensiveEntities;

    if (offensiveEntities.length === 0) {
      return;
    }

    const offensiveGroupIds = offensiveEntities.filter(e => e.type === 'group').map(e => e.id);
    const offensiveCompetitionIds = offensiveEntities.filter(e => e.type === 'competition').map(e => e.id);

    const [offensiveGroups, offensiveCompetitions] = await Promise.all([
      prisma.group.findMany({
        where: {
          id: {
            in: offensiveGroupIds
          }
        }
      }),
      prisma.competition.findMany({
        where: {
          id: {
            in: offensiveCompetitionIds
          }
        }
      })
    ]);

    await prisma.$transaction(async transaction => {
      if (offensiveGroupIds.length > 0) {
        await transaction.group.updateMany({
          where: {
            id: {
              in: offensiveGroupIds
            },
            visible: true
          },
          data: {
            visible: false
          }
        });
      }

      if (offensiveCompetitionIds.length > 0) {
        await transaction.competition.updateMany({
          where: {
            id: {
              in: offensiveCompetitionIds
            },
            visible: true
          },
          data: {
            visible: false
          }
        });
      }
    });

    const byIpHashMap = new Map<string, { groups: Group[]; competitions: Competition[] }>();

    for (const group of offensiveGroups) {
      if (!group.creatorIpHash) continue;

      const current = byIpHashMap.get(group.creatorIpHash);
      if (current) {
        current.groups.push(group);
      } else {
        byIpHashMap.set(group.creatorIpHash, { groups: [group], competitions: [] });
      }
    }

    for (const competition of offensiveCompetitions) {
      if (!competition.creatorIpHash) continue;
      const current = byIpHashMap.get(competition.creatorIpHash);
      if (current) {
        current.competitions.push(competition);
      } else {
        byIpHashMap.set(competition.creatorIpHash, { groups: [], competitions: [competition] });
      }
    }

    for (const [ipHash, { groups: flaggedGroups, competitions: flaggedCompetitions }] of byIpHashMap) {
      await dispatchDiscordBotEvent(DiscordBotEventType.CREATION_SPAM_WARNING, {
        creatorIpHash: ipHash,
        type: 'inappropriate-content' as const,
        groups: flaggedGroups.map(group => ({
          group: formatGroupResponse(group, -1),
          reason: offensiveEntities.find(e => e.type === 'group' && e.id === group.id)?.reason
        })),
        competitions: flaggedCompetitions.map(competition => ({
          competition: formatCompetitionResponse({ ...competition, participantCount: -1, metrics: [] }, null),
          reason: offensiveEntities.find(e => e.type === 'competition' && e.id === competition.id)?.reason
        }))
      });
    }
  }
};
