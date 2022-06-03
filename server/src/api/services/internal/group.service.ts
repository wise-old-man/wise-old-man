import { Group } from '../../../database/models';
import { BadRequestError, NotFoundError } from '../../errors';

async function resolve(groupId: number, exposeHash = false): Promise<Group> {
  if (!groupId || isNaN(groupId)) {
    throw new BadRequestError('Invalid group id.');
  }

  const scope = exposeHash ? 'withHash' : 'defaultScope';

  const group = await Group.scope(scope).findOne({
    where: { id: groupId }
  });

  if (!group) {
    throw new NotFoundError('Group not found.');
  }

  return group;
}

export { resolve };
