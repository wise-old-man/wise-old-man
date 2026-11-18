import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { CompetitionType } from '../../../../types';
import { sanitizeWhitespace } from '../../../../utils/sanitize-whitespace.util';

export async function removeTeams(
  id: number,
  teamNames: string[]
): AsyncResult<
  { count: number },
  | { code: 'COMPETITION_NOT_FOUND' }
  | { code: 'NO_VALID_PARTICIPANTS' }
  | { code: 'CANNOT_REMOVE_TEAMS_FROM_CLASSIC_COMPETITION' }
> {
  const competition = await prisma.competition.findFirst({
    where: { id }
  });

  if (competition === null) {
    return errored({ code: 'COMPETITION_NOT_FOUND' });
  }

  if (competition.type === CompetitionType.CLASSIC) {
    return errored({ code: 'CANNOT_REMOVE_TEAMS_FROM_CLASSIC_COMPETITION' });
  }

  const { count } = await prisma.participation.deleteMany({
    where: {
      competitionId: id,
      teamName: { in: teamNames.map(sanitizeWhitespace) }
    }
  });

  if (count === 0) {
    return errored({ code: 'NO_VALID_PARTICIPANTS' });
  }

  await prisma.competition.update({
    where: { id },
    data: { updatedAt: new Date() }
  });

  return complete({ count });
}
