/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Competition, Group } from '../../types';
import { pick } from '../../utils/pick.util';
import { formatGroupResponse, GroupResponse } from './group.response';

export interface CompetitionResponse extends Omit<Competition, 'verificationHash' | 'creatorIpHash'> {
  participantCount: number;
  group?: GroupResponse;
}

export function formatCompetitionResponse(
  competition: Competition & { participantCount: number },
  group: (Group & { memberCount: number }) | null
): CompetitionResponse {
  return {
    ...pick(
      competition,
      'id',
      'title',
      'metric',
      'type',
      'startsAt',
      'endsAt',
      'groupId',
      'score',
      'visible',
      'createdAt',
      'updatedAt'
    ),
    participantCount: competition.participantCount,
    group: group === null ? undefined : formatGroupResponse(group, group.memberCount)
  };
}
