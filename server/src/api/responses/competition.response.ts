/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Competition, CompetitionMetric, Group, Metric } from '../../types';
import { pick } from '../../utils/pick.util';
import { formatGroupResponse, GroupResponse } from './group.response';

export interface CompetitionResponse extends Omit<Competition, 'verificationHash' | 'creatorIpHash'> {
  metrics: Metric[];
  participantCount: number;
  group?: GroupResponse;
}

export function formatCompetitionResponse(
  competition: Competition & { metrics: CompetitionMetric[]; participantCount: number },
  group: (Group & { memberCount: number }) | null
): CompetitionResponse {
  const sortedMetrics = competition.metrics.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

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
    metrics: sortedMetrics.length === 0 ? [competition.metric] : sortedMetrics.map(m => m.metric),
    group: group === null ? undefined : formatGroupResponse(group, group.memberCount)
  };
}
