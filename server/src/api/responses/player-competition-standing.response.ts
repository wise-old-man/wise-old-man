import { Competition, CompetitionMetric, Group, Participation } from '../../types';
import { MetricDelta } from '../../types/metric-delta.type';
import { pick } from '../../utils/pick.util';
import { CompetitionResponse, formatCompetitionResponse } from './competition.response';
import { formatParticipationResponse, ParticipationResponse } from './participation.response';

export type PlayerCompetitionStandingResponse = ParticipationResponse & {
  competition: CompetitionResponse;
  progress: MetricDelta;
  levels: MetricDelta;
  rank: number;
};

export function formatPlayerCompetitionStandingResponse(
  participation: Participation,
  competition: Competition & { metrics: CompetitionMetric[]; participantCount: number },
  group: (Group & { memberCount: number }) | null,
  progress: MetricDelta,
  levels: MetricDelta,
  rank: number
) {
  return {
    ...formatParticipationResponse(participation),
    competition: formatCompetitionResponse(competition, group),
    progress: pick(progress, 'start', 'end', 'gained'),
    levels: pick(levels, 'start', 'end', 'gained'),
    rank
  };
}
