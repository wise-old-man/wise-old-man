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
