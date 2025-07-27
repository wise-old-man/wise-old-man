/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Membership } from '../../types';
import { pick } from '../../utils/pick.util';

// Currently 1:1 with the database model "Membership"
export type MembershipResponse = Membership;

export function formatMembershipResponse(membership: Membership): MembershipResponse {
  return pick(membership, 'playerId', 'groupId', 'role', 'createdAt', 'updatedAt');
}
