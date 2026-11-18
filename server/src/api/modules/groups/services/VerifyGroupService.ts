import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import prisma, { PrismaTypes } from '../../../../prisma';
import { Group } from '../../../../types';
import { eventEmitter, EventType } from '../../../events';

export async function verifyGroup(groupId: number): AsyncResult<
  {
    group: Group;
    memberCount: number;
  },
  { code: 'GROUP_NOT_FOUND' } | { code: 'FAILED_TO_VERIFY_GROUP'; subError: unknown }
> {
  const updateResult = await fromPromise(
    prisma.group.update({
      where: { id: groupId },
      data: { verified: true },
      include: {
        _count: {
          select: {
            memberships: true
          }
        }
      }
    })
  );

  if (isErrored(updateResult)) {
    if (
      updateResult.error instanceof PrismaTypes.PrismaClientKnownRequestError &&
      updateResult.error.code === 'P2025'
    ) {
      return errored({ code: 'GROUP_NOT_FOUND' });
    }

    return errored({
      code: 'FAILED_TO_VERIFY_GROUP',
      subError: updateResult.error
    });
  }

  eventEmitter.emit(EventType.GROUP_UPDATED, { groupId });

  return complete({
    group: updateResult.value,
    memberCount: updateResult.value._count.memberships
  });
}
