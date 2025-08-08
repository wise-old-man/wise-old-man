/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Competition, Group, Participation, Player } from '../../types';
import { pick } from '../../utils/pick.util';
import { CompetitionResponse, formatCompetitionResponse } from './competition.response';
import { formatParticipationResponse, ParticipationResponse } from './participation.response';
import { formatPlayerResponse, PlayerResponse } from './player.response';

export interface CompetitionDetailsResponse extends CompetitionResponse {
  participations: Array<
    ParticipationResponse & {
      player: PlayerResponse;
      progress: {
        start: number;
        end: number;
        gained: number;
      };
      levels: {
        start: number;
        end: number;
        gained: number;
      };
    }
  >;
}

export function formatCompetitionDetailsResponse(
  competition: Competition,
  group: (Group & { memberCount: number }) | null,
  participations: Array<
    Participation & {
      player: Player;
      progress: { start: number; end: number; gained: number };
      levels: { start: number; end: number; gained: number };
    }
  >
): CompetitionDetailsResponse {
  return {
    ...formatCompetitionResponse(competition, participations.length, group),
    participations: participations.map(p => ({
      ...formatParticipationResponse(p),
      player: formatPlayerResponse(p.player),
      progress: pick(p.progress, 'start', 'end', 'gained'),
      levels: pick(p.levels, 'start', 'end', 'gained')
    }))
  };
}
