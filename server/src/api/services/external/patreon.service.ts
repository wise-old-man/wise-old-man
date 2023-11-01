import env from '../../../env';
import { z } from 'zod';
import axios from 'axios';
import { Patron } from '../../../prisma';
import { isValidDate } from '../../util/dates';

const CAMPAIGN_ID = '4802084';

const TIER_1_ID = '5548204';
const TIER_2_ID = '21515077';

const patreonUserSchema = z.object({
  id: z.string(),
  type: z.enum(['user']).or(z.string()),
  attributes: z.object({
    email: z.string(),
    full_name: z.string(),
    social_connections: z.object({
      discord: z.object({ user_id: z.string() }).or(z.null())
    })
  })
});

const pledgesResponseSchema = z.object({
  data: z.array(
    z.object({
      attributes: z.object({
        created_at: z.string().refine(isValidDate),
        status: z.enum(['valid', 'declined']).or(z.string())
      }),
      relationships: z.object({
        patron: z.object({
          data: z.object({
            id: z.string(),
            type: z.enum(['user']).or(z.string())
          })
        })
      })
    })
  ),
  included: z.array(patreonUserSchema)
});

const membersResponseSchema = z.object({
  data: z.array(
    z.object({
      relationships: z.object({
        currently_entitled_tiers: z.object({
          data: z.array(z.object({ id: z.string() }))
        }),
        user: z.object({
          data: z.object({
            id: z.string()
          })
        })
      })
    })
  )
});

type PledgesResponse = z.infer<typeof pledgesResponseSchema>;
type MembersResponse = z.infer<typeof membersResponseSchema>;

export async function getPatrons() {
  const pledges = await fetchPledges(CAMPAIGN_ID);
  const members = await fetchMembers(CAMPAIGN_ID);

  const patrons = parsePatronages(pledges);

  const tierMap = getTierMap(members);

  patrons.forEach(patron => {
    const tier = tierMap.get(patron.id);
    if (tier) patron.tier = tier;
  });

  return patrons;
}

function getTierMap(membersResponse: MembersResponse) {
  const userTierMap = new Map<string, 1 | 2>();

  membersResponse.data.forEach(member => {
    const userId = member.relationships.user.data.id;
    const tiers = member.relationships.currently_entitled_tiers.data;
    if (!tiers || tiers.length === 0) return;

    let tier;
    if (tiers[0].id === TIER_2_ID) {
      tier = 2;
    } else if (tiers[0].id === TIER_1_ID) {
      tier = 1;
    } else {
      return;
    }

    userTierMap.set(userId, tier);
  });

  return userTierMap;
}

function parsePatronages(pledgesResponse: PledgesResponse) {
  const userMap = new Map<string, PledgesResponse['included'][number]>();

  pledgesResponse.included.forEach(object => {
    if (object.type !== 'user') return;
    userMap.set(object.id, object);
  });

  const patrons: Patron[] = [];

  pledgesResponse.data.forEach(pledge => {
    const userId = pledge.relationships.patron.data.id;
    const user = userMap.get(userId);

    if (!user || pledge.attributes.status !== 'valid') return;

    patrons.push({
      id: userId,
      name: user.attributes.full_name,
      email: user.attributes.email,
      discordId: user.attributes.social_connections.discord?.user_id ?? null,
      tier: 1,
      createdAt: new Date(pledge.attributes.created_at)
    });
  });

  return patrons;
}

async function fetchPledges(campaignId: string): Promise<PledgesResponse> {
  const fields = ['status', 'created_at'];

  const url = new URL(`https://www.patreon.com/api/oauth2/api/campaigns/${campaignId}/pledges`);
  url.searchParams.set('include', 'patron.null');
  url.searchParams.set('fields[pledge]', fields.join(','));
  url.searchParams.set('page[count]', '200');

  const { data } = await axios.get(url.toString(), {
    headers: {
      Authorization: `Bearer ${env.PATREON_BEARER_TOKEN}`
    }
  });

  return pledgesResponseSchema.parse(data);
}

async function fetchMembers(campaignId: string): Promise<MembersResponse> {
  const include = ['currently_entitled_tiers', 'user'];

  const url = new URL(`https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/members`);

  url.searchParams.set('include', include.join(','));
  url.searchParams.set('page[count]', '200');

  const { data } = await axios.get(url.toString(), {
    headers: {
      Authorization: `Bearer ${env.PATREON_BEARER_TOKEN}`
    }
  });

  return membersResponseSchema.parse(data);
}
