/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Record } from '../../types';
import { pick } from '../../utils/pick.util';

// Currently 1:1 with the database model "Record"
export type RecordResponse = Record;

export function formatRecordResponse(record: Record): RecordResponse {
  return pick(record, 'playerId', 'period', 'metric', 'value', 'updatedAt');
}
