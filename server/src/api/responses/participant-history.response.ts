/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Player } from '../../types';
import { formatPlayerResponse, PlayerResponse } from './player.response';

export interface ParticipantHistoryResponse {
  player: PlayerResponse;
  history: Array<{
    value: number;
    date: Date;
  }>;
}

export function formatParticipantHistoryResponse(
  player: Player,
  history: Array<{ value: number; date: Date }>
): ParticipantHistoryResponse {
  return {
    player: formatPlayerResponse(player),
    history: history.map(({ value, date }) => ({
      value,
      date
    }))
  };
}
