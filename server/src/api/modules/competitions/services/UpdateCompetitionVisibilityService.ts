import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import prisma, { PrismaTypes } from '../../../../prisma';
import { Competition } from '../../../../types';

export async function updateCompetitionVisibility(
  competitionId: number,
  visible: boolean
): AsyncResult<
  Competition,
  { code: 'COMPETITION_NOT_FOUND' } | { code: 'FAILED_TO_UPDATE_COMPETITION'; subError: unknown }
> {
  const updateResult = await fromPromise(
    prisma.competition.update({
      where: { id: competitionId },
      data: { visible }
    })
  );

  if (isErrored(updateResult)) {
    if (
      updateResult.error instanceof PrismaTypes.PrismaClientKnownRequestError &&
      updateResult.error.code === 'P2025'
    ) {
      return errored({ code: 'COMPETITION_NOT_FOUND' });
    }

    return errored({ code: 'FAILED_TO_UPDATE_COMPETITION', subError: updateResult.error });
  }

  return complete(updateResult.value);
}
