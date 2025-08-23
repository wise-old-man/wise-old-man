/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Competition, CompetitionMetric, Group, Participation, Player } from '../../types';
import { MetricDelta } from '../../types/metric-delta.type';
import { pick } from '../../utils/pick.util';
import { CompetitionResponse, formatCompetitionResponse } from './competition.response';
import { formatParticipationResponse, ParticipationResponse } from './participation.response';
import { formatPlayerResponse, PlayerResponse } from './player.response';

export interface CompetitionDetailsResponse extends CompetitionResponse {
  participations: Array<
    ParticipationResponse & {
      player: PlayerResponse;
      progress: MetricDelta;
      levels: MetricDelta;
    }
  >;
}

export function formatCompetitionDetailsResponse(
  competition: Competition,
  metrics: CompetitionMetric[],
  group: (Group & { memberCount: number }) | null,
  participations: Array<{
    participation: Participation;
    player: Player;
    progress: MetricDelta;
    levels: MetricDelta;
  }>
): CompetitionDetailsResponse {
  return {
    ...formatCompetitionResponse(
      {
        ...competition,
        metrics,
        participantCount: participations.length
      },
      group
    ),
    participations: participations.map(p => ({
      ...formatParticipationResponse(p.participation),
      player: formatPlayerResponse(p.player),
      progress: pick(p.progress, 'start', 'end', 'gained'),
      levels: pick(p.levels, 'start', 'end', 'gained')
    }))
  };
}
