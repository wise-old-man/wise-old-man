import { BadRequestError } from '../../../errors';
import { submitNameChange } from './SubmitNameChangeService';
import { isValidUsername, sanitize } from '../../players/player.utils';

type BulkSubmitResult = {
  nameChangesSubmitted: number;
  message: string;
};

async function bulkSubmitNameChanges(
  entries: Array<{ oldName: string; newName: string }>
): Promise<BulkSubmitResult> {
  // Validate all entries
  entries.forEach(entry => {
    if (!isValidUsername(entry.oldName)) {
      throw new BadRequestError('Invalid old name.');
    }

    if (!isValidUsername(entry.newName)) {
      throw new BadRequestError('Invalid new name.');
    }

    if (sanitize(entry.oldName) === sanitize(entry.newName)) {
      throw new BadRequestError('Old name and new name cannot be the same.');
    }
  });

  let submitted = 0;

  // Submit all the entries one by one, using the submitNameChange service.
  for (const entry of entries) {
    try {
      await submitNameChange(entry.oldName, entry.newName);
      submitted++;
    } catch (_) {
      // Skip over errors
    }
  }

  if (submitted === 0) {
    throw new BadRequestError(`Could not find any valid name changes to submit.`);
  }

  return {
    nameChangesSubmitted: submitted,
    message: `Successfully submitted ${submitted}/${entries.length} name changes.`
  };
}

export { bulkSubmitNameChanges };
