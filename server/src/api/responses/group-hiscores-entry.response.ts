import { Player } from '../../types';
import { pick } from '../../utils/pick.util';
import { formatPlayerResponse, PlayerResponse } from './player.response';

/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
export interface GroupHiscoresEntryResponse {
  player: PlayerResponse;
  data:
    | GroupHiscoresSkillData
    | GroupHiscoresBossData
    | GroupHiscoresActivityData
    | GroupHiscoresComputedMetricData;
}

interface GroupHiscoresSkillData {
  type: 'skill';
  rank: number;
  level: number;
  experience: number;
}

interface GroupHiscoresBossData {
  type: 'boss';
  rank: number;
  kills: number;
}

interface GroupHiscoresActivityData {
  type: 'activity';
  rank: number;
  score: number;
}

interface GroupHiscoresComputedMetricData {
  type: 'computed';
  rank: number;
  value: number;
}

export function formatGroupHiscoresEntryResponse(
  player: Player,
  data: GroupHiscoresEntryResponse['data']
): GroupHiscoresEntryResponse {
  return {
    player: formatPlayerResponse(player),
    data:
      data.type === 'skill'
        ? pick(data, 'type', 'rank', 'level', 'experience')
        : data.type === 'boss'
          ? pick(data, 'type', 'rank', 'kills')
          : data.type === 'activity'
            ? pick(data, 'type', 'rank', 'score')
            : pick(data, 'type', 'rank', 'value')
  };
}
