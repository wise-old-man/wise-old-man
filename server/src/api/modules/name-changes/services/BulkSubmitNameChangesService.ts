import { z } from 'zod';
import { BadRequestError } from '../../../errors';
import * as playerUtils from '../../players/player.utils';
import { submitNameChange } from './SubmitNameChangeService';

const submitNameEntrySchema = z
  .object(
    {
      oldName: z.string(),
      newName: z.string()
    },
    { invalid_type_error: 'All name change objects must have "oldName" and "newName" properties.' }
  )
  .refine(s => playerUtils.isValidUsername(s.oldName), { message: 'Invalid old name.' })
  .refine(s => playerUtils.isValidUsername(s.newName), { message: 'Invalid new name.' })
  .refine(s => playerUtils.sanitize(s.oldName) !== playerUtils.sanitize(s.newName), {
    message: 'Old name and new name cannot be the same.'
  });

const inputSchema = z
  .array(submitNameEntrySchema, {
    invalid_type_error: 'Invalid name change list format.'
  })
  .nonempty('Empty name change list.');

type BulkSubmitParams = z.infer<typeof inputSchema>;

type BulkSubmitResult = {
  nameChangesSubmitted: number;
  message: string;
};

async function bulkSubmitNameChanges(payload: BulkSubmitParams): Promise<BulkSubmitResult> {
  const input = inputSchema.parse(payload);
  let submitted = 0;

  // Submit all the entries one by one, using the submitNameChange service.
  for (const entry of input) {
    try {
      await submitNameChange(entry);
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
    message: `Successfully submitted ${submitted}/${input.length} name changes.`
  };
}

export { bulkSubmitNameChanges };
