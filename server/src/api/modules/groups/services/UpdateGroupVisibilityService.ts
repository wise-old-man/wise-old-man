import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import prisma, { PrismaTypes } from '../../../../prisma';
import { Group } from '../../../../types';
import { eventEmitter, EventType } from '../../../events';

export async function updateGroupVisibility(
  groupId: number,
  visible: boolean
): AsyncResult<Group, { code: 'GROUP_NOT_FOUND' } | { code: 'FAILED_TO_UPDATE_GROUP'; subError: unknown }> {
  const updateResult = await fromPromise(
    prisma.group.update({
      where: { id: groupId },
      data: { visible }
    })
  );

  if (isErrored(updateResult)) {
    if (
      updateResult.error instanceof PrismaTypes.PrismaClientKnownRequestError &&
      updateResult.error.code === 'P2025'
    ) {
      return errored({ code: 'GROUP_NOT_FOUND' });
    }

    return errored({ code: 'FAILED_TO_UPDATE_GROUP', subError: updateResult.error });
  }

  // Group score depends on visibility
  eventEmitter.emit(EventType.GROUP_UPDATED, { groupId });

  return complete(updateResult.value);
}
