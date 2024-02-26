import { z } from 'zod';
import axios from 'axios';
import { Patron } from '../../../prisma';
import { isValidDate } from '../../util/dates';

const CAMPAIGN_ID = '4802084';
const TIER_2_ID = '21515077';

const CANCEL_GRACE_PERIOD_DAYS = 3;

const patreonUserSchema = z.object({
  id: z.string(),
  type: z.enum(['user']).or(z.string()),
  attributes: z.object({
    full_name: z.string(),
    email: z.string().optional(),
    social_connections: z.object({ discord: z.object({ user_id: z.string() }).or(z.null()) }).optional()
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
      attributes: z.object({
        last_charge_date: z.null().or(z.string().refine(isValidDate)),
        patron_status: z.enum(['declined_patron', 'former_patron', 'active_patron']).or(z.null())
      }),
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
  ),
  included: z.array(patreonUserSchema.or(z.object({ type: z.literal('tier') })))
});

type PledgesResponse = z.infer<typeof pledgesResponseSchema>;
type MembersResponse = z.infer<typeof membersResponseSchema>;

export async function getPatrons() {
  const members = await fetchMembers(CAMPAIGN_ID);
  const pledges = await fetchPledges(CAMPAIGN_ID);

  const userMap = new Map<string, z.infer<typeof patreonUserSchema>>();

  members.included.forEach(object => {
    if (object.type !== 'user') return;
    userMap.set(object.id, object);
  });

  pledges.included.forEach(object => {
    if (object.type !== 'user') return;

    const current = userMap.get(object.id);

    if (current) {
      current.attributes.email = object.attributes.email;
    } else {
      userMap.set(object.id, object);
    }
  });

  const patrons: Patron[] = [];

  members.data.forEach(member => {
    const { attributes, relationships } = member;

    const userId = relationships.user.data.id;
    const user = userMap.get(userId);

    if (!user) return;

    const pledge = pledges.data.find(p => p.relationships.patron.data.id === userId);

    const { patron_status, last_charge_date } = attributes;

    // After unsubscribing (or payment failed), give users a grace period
    // of 3 days to re-subscribe before revoking their benefits
    if (patron_status !== 'active_patron') {
      if (!last_charge_date || patron_status !== 'declined_patron') return;

      const lastChargeDate = new Date(last_charge_date);
      const daysSince = (Date.now() - lastChargeDate.getTime()) / 1000 / 60 / 60 / 24;

      if (daysSince > CANCEL_GRACE_PERIOD_DAYS) return;
    }

    const isTier2 = relationships.currently_entitled_tiers.data.some(tier => tier.id === TIER_2_ID);

    const discordId = user.attributes.social_connections
      ? user.attributes.social_connections.discord?.user_id
      : undefined;

    patrons.push({
      id: userId,
      name: user.attributes.full_name,
      email: user.attributes.email || '',
      discordId: discordId ?? null,
      tier: isTier2 ? 2 : 1,
      createdAt: pledge ? new Date(pledge.attributes.created_at) : new Date(),
      playerId: null,
      groupId: null
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
      Authorization: `Bearer ${process.env.PATREON_BEARER_TOKEN}`
    }
  });

  return pledgesResponseSchema.parse(data);
}

async function fetchMembers(campaignId: string): Promise<MembersResponse> {
  const url = new URL(`https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/members`);

  url.searchParams.set('include', ['currently_entitled_tiers', 'user'].join(','));
  url.searchParams.set('fields[member]', ['last_charge_date', 'patron_status'].join(','));
  url.searchParams.set('fields[user]', ['full_name', 'social_connections'].join(','));
  url.searchParams.set('page[count]', '200');

  const { data } = await axios.get(url.toString(), {
    headers: {
      Authorization: `Bearer ${process.env.PATREON_BEARER_TOKEN}`
    }
  });

  return membersResponseSchema.parse(data);
}
