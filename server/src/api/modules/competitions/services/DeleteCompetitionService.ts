import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import prisma, { PrismaTypes } from '../../../../prisma';
import { Competition } from '../../../../types';

export async function deleteCompetition(
  id: number
): AsyncResult<Competition, { code: 'COMPETITION_NOT_FOUND' } | { code: 'FAILED_TO_DELETE_COMPETITION' }> {
  const updateResult = await fromPromise(
    prisma.competition.delete({
      where: { id }
    })
  );

  if (isErrored(updateResult)) {
    if (
      updateResult.error instanceof PrismaTypes.PrismaClientKnownRequestError &&
      updateResult.error.code === 'P2025'
    ) {
      return errored({ code: 'COMPETITION_NOT_FOUND' });
    }

    return errored({ code: 'FAILED_TO_DELETE_COMPETITION' });
  }

  return complete(updateResult.value);
}
