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

  // Submit all the entries one by one, using the submitNameChange service.
  const submitted = await Promise.all(
    input.map(async entry => {
      try {
        return await submitNameChange(entry);
      } catch (error) {
        return null;
      }
    })
  );

  // Only non-null results count as successful
  const submittedCount = submitted.filter(s => !!s).length;

  if (submittedCount === 0) {
    throw new BadRequestError(`Could not find any valid name changes to submit.`);
  }

  return {
    nameChangesSubmitted: submittedCount,
    message: `Successfully submitted ${submittedCount}/${input.length} name changes.`
  };
}

export { bulkSubmitNameChanges };
