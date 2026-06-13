/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Competition, CompetitionMetric, Group, Metric, Participation, Player } from '../../types';
import { MetricDelta } from '../../types/metric-delta.type';
import { pick } from '../../utils/pick.util';
import { CompetitionResponse, formatCompetitionResponse } from './competition.response';
import { formatParticipationResponse, ParticipationResponse } from './participation.response';
import { formatPlayerResponse, PlayerResponse } from './player.response';

export interface CompetitionDetailsResponse extends CompetitionResponse {
  participations: Array<
    ParticipationResponse & {
      player: PlayerResponse;
      deltas: Array<{
        metric: Metric | 'total';
        values: MetricDelta;
        levels: MetricDelta;
      }>;
      progress: MetricDelta;
      levels: MetricDelta;
    }
  >;
}

export function formatCompetitionDetailsResponse({
  competition,
  metrics,
  group,
  participations,
  sortingMetricIndex
}: {
  competition: Competition;
  metrics: CompetitionMetric[];
  group: (Group & { memberCount: number }) | null;
  participations: Array<{
    participation: Participation;
    player: Player;
    deltas: Array<{
      metric: Metric | 'total';
      values: MetricDelta;
      levels: MetricDelta;
    }>;
  }>;
  sortingMetricIndex: number;
}): CompetitionDetailsResponse {
  return {
    ...formatCompetitionResponse(
      {
        ...competition,
        metrics,
        participantCount: participations.length
      },
      group
    ),
    participations: participations.map(p => {
      const deltas = p.deltas;

      return {
        ...formatParticipationResponse(p.participation),
        player: formatPlayerResponse(p.player),
        deltas,

        // Keep these around for backwards compatibility, but they should be removed in the future.
        progress: pick(p.deltas[sortingMetricIndex].values, 'start', 'end', 'gained'),
        levels: pick(p.deltas[sortingMetricIndex].levels, 'start', 'end', 'gained')
      };
    })
  };
}
