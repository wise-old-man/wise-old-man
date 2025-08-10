/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Group } from '../../types';
import { pick } from '../../utils/pick.util';

export interface GroupResponse extends Omit<Group, 'verificationHash' | 'creatorIpHash'> {
  memberCount: number;
}

export function formatGroupResponse(group: Group, memberCount: number): GroupResponse {
  return {
    ...pick(
      group,
      'id',
      'name',
      'clanChat',
      'description',
      'homeworld',
      'verified',
      'patron',
      'visible',
      'profileImage',
      'bannerImage',
      'score',
      'createdAt',
      'updatedAt'
    ),
    memberCount
  };
}
