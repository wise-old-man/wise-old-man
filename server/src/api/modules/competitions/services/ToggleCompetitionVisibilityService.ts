import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { Competition } from '../../../../types';

export async function toggleCompetitionVisibility(
  competitionId: number
): AsyncResult<
  Competition,
  { code: 'COMPETITION_NOT_FOUND' } | { code: 'FAILED_TO_UPDATE_COMPETITION'; subError: unknown }
> {
  const competition = await prisma.competition.findFirst({
    where: { id: competitionId },
    select: { visible: true }
  });

  if (competition === null) {
    return errored({ code: 'COMPETITION_NOT_FOUND' });
  }

  const updateResult = await fromPromise(
    prisma.competition.update({
      where: { id: competitionId },
      data: { visible: !competition.visible }
    })
  );

  if (isErrored(updateResult)) {
    return errored({
      code: 'FAILED_TO_UPDATE_COMPETITION',
      subError: updateResult.error
    });
  }

  return complete(updateResult.value);
}
