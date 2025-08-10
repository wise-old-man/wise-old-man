/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { NameChange } from '../../types';
import { pick } from '../../utils/pick.util';

// Currently 1:1 with the database model "NameChange"
export type NameChangeResponse = NameChange;

export function formatNameChangeResponse(nameChange: NameChange): NameChangeResponse {
  return pick(
    nameChange,
    'id',
    'playerId',
    'oldName',
    'newName',
    'status',
    'reviewContext',
    'resolvedAt',
    'createdAt',
    'updatedAt'
  );
}
