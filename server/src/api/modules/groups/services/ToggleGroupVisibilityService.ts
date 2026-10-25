import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { Group } from '../../../../types';
import { eventEmitter, EventType } from '../../../events';

export async function toggleGroupVisibility(
  groupId: number
): AsyncResult<Group, { code: 'GROUP_NOT_FOUND' } | { code: 'FAILED_TO_UPDATE_GROUP'; subError: unknown }> {
  const group = await prisma.group.findFirst({
    where: { id: groupId },
    select: { visible: true }
  });

  if (group === null) {
    return errored({ code: 'GROUP_NOT_FOUND' });
  }

  const updateResult = await fromPromise(
    prisma.group.update({
      where: { id: groupId },
      data: { visible: !group.visible }
    })
  );

  if (isErrored(updateResult)) {
    return errored({
      code: 'FAILED_TO_UPDATE_GROUP',
      subError: updateResult.error
    });
  }

  // Group score depends on visibility
  eventEmitter.emit(EventType.GROUP_UPDATED, { groupId });

  return complete(updateResult.value);
}
