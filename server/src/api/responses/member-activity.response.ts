/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { MemberActivity } from '../../types';
import { pick } from '../../utils/pick.util';

// Currently 1:1 with the database model "MemberActivity"
export type MemberActivityResponse = MemberActivity;

export function formatMemberActivityResponse(memberActivity: MemberActivity): MemberActivityResponse {
  return pick(memberActivity, 'groupId', 'playerId', 'type', 'role', 'previousRole', 'createdAt');
}
