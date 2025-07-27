/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { PlayerAnnotation } from '../../types';
import { pick } from '../../utils/pick.util';

// Currently 1:1 with the database model "PlayerAnnotation"
export type PlayerAnnotationResponse = PlayerAnnotation;

export function formatPlayerAnnotationResponse(playerAnnotation: PlayerAnnotation): PlayerAnnotationResponse {
  return pick(playerAnnotation, 'playerId', 'type', 'createdAt');
}
