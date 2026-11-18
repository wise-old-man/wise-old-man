import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import { jobManager, JobType } from '../../../../jobs';
import prisma, { PrismaTypes } from '../../../../prisma';
import { ApiKey } from '../../../../types';

export async function revokeAPIKey(
  id: string
): AsyncResult<
  ApiKey,
  { code: 'API_KEY_NOT_FOUND' } | { code: 'FAILED_TO_REVOKE_API_KEY'; subError: unknown }
> {
  const updateResult = await fromPromise(
    prisma.apiKey.update({
      where: { id },
      data: { active: false }
    })
  );

  if (isErrored(updateResult)) {
    if (
      updateResult.error instanceof PrismaTypes.PrismaClientKnownRequestError &&
      updateResult.error.code === 'P2025'
    ) {
      return errored({ code: 'API_KEY_NOT_FOUND' });
    }

    return errored({ code: 'FAILED_TO_REVOKE_API_KEY', subError: updateResult.error });
  }

  await jobManager.add(JobType.SYNC_API_KEYS, {});

  return complete(updateResult.value);
}
