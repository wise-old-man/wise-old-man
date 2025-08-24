import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import axios from 'axios';
import dayjs from 'dayjs';
import { z } from 'zod';
import { Patron } from '../types';

export const STATIC_PATRON_GROUP_IDS = [
  139, // Exclusive Elite Club
  201, // Ruthless (Aluminoti)
  1169 // Hardly Iron (Geeving)
];

export const STATIC_PATRON_PLAYER_IDS = [
  2, // Psikoi
  4156, // Rro (Rorro)
  30051, // Aluminoti
  263152 // Geeving
];

const CAMPAIGN_ID = '4802084';
const TIER_2_ID = '21515077';

const CANCEL_GRACE_PERIOD_DAYS = 3;

const userSchema = z.object({
  id: z.string(),
  type: z.literal('user'),
  attributes: z.object({
    full_name: z.string(),
    social_connections: z.optional(
      z.object({
        discord: z.object({ user_id: z.string() }).or(z.null())
      })
    )
  })
});

const tierSchema = z.object({
  id: z.string(),
  type: z.literal('tier')
});

const memberDataSchema = z.array(
  z.object({
    attributes: z.object({
      email: z.string(),
      last_charge_date: z.null().or(z.string().refine(d => dayjs(d).isValid())),
      patron_status: z.enum(['declined_patron', 'former_patron', 'active_patron']).or(z.null()),
      pledge_relationship_start: z.string().refine(d => dayjs(d).isValid())
    }),
    relationships: z.object({
      currently_entitled_tiers: z.object({
        data: z.array(tierSchema)
      }),
      user: z.object({
        data: z.object({
          id: z.string(),
          type: z.literal('user')
        })
      })
    })
  })
);

const membersResponseSchema = z.object({
  data: memberDataSchema,
  included: z.array(userSchema.or(tierSchema)),
  meta: z.object({
    pagination: z.object({
      cursors: z.object({
        next: z.string().or(z.null())
      }),
      total: z.number()
    })
  })
});

type MembersResponse = z.infer<typeof membersResponseSchema>;
type PatreonUser = z.infer<typeof userSchema>;

export async function getPatrons(): AsyncResult<
  Array<{ patron: Patron; isInGracePeriod: boolean }>,
  { code: 'FAILED_TO_FETCH_PATRONS'; subError: unknown }
> {
  const membersResult = await fetchMembers(CAMPAIGN_ID);

  if (isErrored(membersResult)) {
    return membersResult;
  }

  const { data, included } = membersResult.value;

  const userMap = new Map<string, PatreonUser>();
  included.forEach(i => {
    if (i.type === 'user') {
      userMap.set(i.id, i);
    }
  });

  const patrons = data.map(member => {
    const { attributes, relationships } = member;
    const { email, patron_status, last_charge_date, pledge_relationship_start } = attributes;
    const { currently_entitled_tiers, user } = relationships;

    const userAttributes = userMap.get(user.data.id);

    if (!userAttributes) {
      return null;
    }

    const { full_name, social_connections } = userAttributes.attributes;

    let isInGracePeriod = false;

    // After unsubscribing (or payment failed), give users a grace period
    // of 3 days to re-subscribe before revoking their benefits
    if (patron_status !== 'active_patron') {
      if (!last_charge_date || patron_status !== 'declined_patron') return null;

      const lastChargeDate = new Date(last_charge_date);
      const daysSince = (Date.now() - lastChargeDate.getTime()) / 1000 / 60 / 60 / 24;

      if (daysSince > CANCEL_GRACE_PERIOD_DAYS) {
        return null;
      }

      isInGracePeriod = true;
    }

    const isTier2 = currently_entitled_tiers.data.some(tier => tier.id === TIER_2_ID);
    const discordId = social_connections ? social_connections.discord?.user_id : undefined;

    return {
      patron: {
        id: user.data.id,
        name: full_name,
        email: email,
        discordId: discordId ?? null,
        tier: isTier2 ? 2 : 1,
        createdAt: new Date(pledge_relationship_start),
        playerId: null,
        groupId: null
      },
      isInGracePeriod
    };
  });

  return complete(patrons.filter(Boolean));
}

async function fetchMembers(campaignId: string): AsyncResult<
  Omit<MembersResponse, 'meta'>,
  {
    code: 'FAILED_TO_FETCH_PATRONS';
    subError: unknown;
  }
> {
  const url = new URL(`https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/members`);

  url.searchParams.set('include', ['currently_entitled_tiers', 'user'].join(','));
  url.searchParams.set(
    'fields[member]',
    ['last_charge_date', 'patron_status', 'email', 'pledge_relationship_start'].join(',')
  );
  url.searchParams.set('fields[user]', ['full_name', 'social_connections'].join(','));
  url.searchParams.set('page[count]', '200');

  const result: Pick<MembersResponse, 'data' | 'included'> = {
    data: [],
    included: []
  };

  // Check at max 10 pages
  // (I don't trust Patreon API, so I'd rather not get stuck in an infinite loop if they mess up)
  for (let i = 0; i < 10; i++) {
    const requestResult = await fromPromise(
      axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${process.env.PATREON_BEARER_TOKEN}`
        }
      })
    );

    if (isErrored(requestResult)) {
      return errored({
        code: 'FAILED_TO_FETCH_PATRONS',
        subError: requestResult.error
      });
    }

    const response = requestResult.value.data;

    const parsedData = membersResponseSchema.parse(response);

    result.data.push(...parsedData.data);
    result.included.push(...parsedData.included);

    if (parsedData.meta.pagination.cursors.next === null) {
      break;
    }

    url.searchParams.set('page[cursor]', response.meta.pagination.cursors.next);
  }

  return complete(result);
}
