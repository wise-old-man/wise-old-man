/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Participation } from '../../types';
import { pick } from '../../utils/pick.util';

export type ParticipationResponse = Omit<
  Participation,
  'startSnapshotId' | 'endSnapshotId' | 'startSnapshotDate' | 'endSnapshotDate'
>;

export function formatParticipationResponse(participation: Participation): ParticipationResponse {
  return pick(participation, 'playerId', 'competitionId', 'teamName', 'createdAt', 'updatedAt');
}
