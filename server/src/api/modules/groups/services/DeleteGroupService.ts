import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import prisma, { PrismaTypes } from '../../../../prisma';
import { Group } from '../../../../types';

export async function deleteGroup(
  id: number
): AsyncResult<Group, { code: 'GROUP_NOT_FOUND' } | { code: 'FAILED_TO_DELETE_GROUP'; subError: unknown }> {
  const deleteResult = await fromPromise(
    prisma.group.delete({
      where: { id }
    })
  );

  if (isErrored(deleteResult)) {
    if (
      deleteResult.error instanceof PrismaTypes.PrismaClientKnownRequestError &&
      deleteResult.error.code === 'P2025'
    ) {
      return errored({ code: 'GROUP_NOT_FOUND' });
    }

    return errored({
      code: 'FAILED_TO_DELETE_GROUP',
      subError: deleteResult.error
    });
  }

  return complete(deleteResult.value);
}
