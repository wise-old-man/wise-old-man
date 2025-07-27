import { PlayerAnnotation } from '../../types';
import { pick } from '../../utils/pick.util';

// Currently 1:1 with the database model "PlayerAnnotation"
export type PlayerAnnotationResponse = PlayerAnnotation;

export function formatPlayerAnnotationResponse(playerAnnotation: PlayerAnnotation): PlayerAnnotationResponse {
  return pick(playerAnnotation, 'playerId', 'type', 'createdAt');
}
