import { MigratedGroupInfo } from '../../../types';
import { Group } from '../../../database/models';
import { BadRequestError, NotFoundError } from '../../errors';
import * as cmlService from '../external/cml.service';
import * as templeService from '../external/temple.service';

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

async function importTempleGroup(templeGroupId: number): Promise<MigratedGroupInfo> {
  if (!templeGroupId) throw new BadRequestError('Invalid temple group ID.');

  const groupInfo = await templeService.fetchGroupInfo(templeGroupId);
  return groupInfo;
}

async function importCMLGroup(cmlGroupId: number): Promise<MigratedGroupInfo> {
  if (!cmlGroupId) throw new BadRequestError('Invalid CML group ID.');

  const groupInfo = await cmlService.fetchGroupInfo(cmlGroupId);
  return groupInfo;
}

export { resolve, importTempleGroup, importCMLGroup };
