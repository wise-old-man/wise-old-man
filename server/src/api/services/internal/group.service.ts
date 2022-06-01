import { uniqBy } from 'lodash';
import { GROUP_ROLES, GroupRole } from '../../../utils';
import { MigratedGroupInfo } from '../../../types';
import { Group, Membership, Player } from '../../../database/models';
import { BadRequestError, NotFoundError } from '../../errors';
import * as cmlService from '../external/cml.service';
import * as templeService from '../external/temple.service';
import * as playerUtils from '../../modules/players/player.utils';
import * as playerServices from '../../modules/players/player.services';

interface Member extends Player {
  role: string;
}

interface MemberFragment {
  username: string;
  role: string;
}

interface EditGroupDTO {
  name?: string;
  clanChat?: string;
  homeworld?: number;
  description?: string;
  members?: MemberFragment[];
}

function sanitizeName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/ +(?= )/g, '')
    .trim();
}

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

/**
 * Note: If "members" is defined, it will replace the existing members.
 */
async function edit(group: Group, dto: EditGroupDTO): Promise<[Group, Member[]]> {
  const { name, description, clanChat, homeworld, members } = dto;

  if (name) {
    const sanitizedName = sanitizeName(name);
    const matchingGroup = await Group.findOne({ where: { name: sanitizedName } });

    // If attempting to change to some other group's name.
    if (matchingGroup && matchingGroup.id !== group.id) {
      throw new BadRequestError(`Group name '${sanitizedName}' is already taken.`);
    }
  }

  let groupMembers;

  // Check if every username in the list is valid
  if (members) {
    const invalidUsernames = members
      .map(({ username }) => username)
      .filter(username => !playerUtils.isValidUsername(username));

    if (invalidUsernames.length > 0) {
      throw new BadRequestError(
        `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
         contain no special characters, and/or contain no space at the beginning or end of the name.`,
        invalidUsernames
      );
    }

    const invalidRoles = members.filter(m => m.role && !GROUP_ROLES.includes(m.role as GroupRole));

    if (invalidRoles.length > 0) {
      throw new BadRequestError(
        'Invalid member roles. Please check the roles of the given members.',
        invalidRoles.map(m => ({ username: m.username, role: m.role }))
      );
    }

    groupMembers = await setMembers(group, members);
  } else {
    const memberships = await group.$get('members');

    groupMembers = memberships.map((p: any) => ({
      ...p.toJSON(),
      role: p.memberships.role,
      memberships: undefined
    }));
  }

  if (name || description || clanChat || homeworld) {
    if (name && name.length !== 0) {
      group.name = sanitizeName(name);
    }

    if (description && description.length !== 0) {
      group.description = playerUtils.sanitize(description);
    }

    if (clanChat && clanChat.length !== 0) {
      group.clanChat = playerUtils.sanitize(clanChat);
    }

    if (homeworld && typeof homeworld === 'number') {
      group.homeworld = homeworld;
    }

    await group.save();
  }

  // Hide the verificationHash from the response
  group.verificationHash = undefined;

  return [group, groupMembers];
}

/**
 * Set the members of a group.
 *
 * Note: This will replace any existing members.
 * Note: The members array should have this format:
 * [{username: "ABC", role: "member"}]
 */
async function setMembers(group: Group, members: MemberFragment[]): Promise<Member[]> {
  if (!group) {
    throw new BadRequestError(`Invalid group.`);
  }

  // Ignore any duplicate names
  const uniqueNames = uniqBy(members, m => playerUtils.standardize(m.username)).map(m => m.username);

  // Fetch (or create) player from the unique usernames
  const players = await playerServices.findPlayers({ usernames: uniqueNames, createIfNotFound: true });

  // Define membership models for each player
  const memberships = players.map((player, i) => ({
    playerId: player.id,
    groupId: group.id,
    role: members[i].role || 'member'
    // TODO: this can be problematic in the future and should be fixed ASAP:
    // If we supply a list of 4 usernames, 2 of them being repeated,
    // array size of members will be different than uniqueNames and therefore players
    // so by doing members[i] we might be accessing the wrong index.
  }));

  // Fetch all previous (existing) memberships
  const previousMemberships = await Membership.findAll({
    attributes: ['groupId', 'playerId', 'role'],
    where: { groupId: group.id }
  });

  // Find all "to remove" memberships (were previously members, and should now be removed)
  const removeMemberships = previousMemberships.filter(
    pm => !memberships.find(m => m.playerId === pm.playerId)
  );

  // Find all memberships that should be stay members (opposite of removeMemberships)
  const keptMemberships = previousMemberships.filter(pm => memberships.find(m => m.playerId === pm.playerId));

  // Find all new memberships (were not previously members, but should be added)
  const newMemberships = memberships.filter(
    m => !previousMemberships.map(pm => pm.playerId).includes(m.playerId)
  );

  // Delete all memberships for "removed members", if any exist
  if (removeMemberships.length > 0) {
    const toRemoveIds = removeMemberships.map(rm => rm.playerId);
    await Membership.destroy({ where: { groupId: group.id, playerId: toRemoveIds } });
  }

  // Add all the new memberships, if any exist
  if (memberships.length > 0) {
    await Membership.bulkCreate(newMemberships, { ignoreDuplicates: true });
  }

  // Check if any kept member's role should be changed
  if (keptMemberships.length > 0) {
    await Promise.all(
      keptMemberships.map(async k => {
        const membership = memberships.find(m => m.playerId === k.playerId);

        // Role has changed and should be updated
        if (membership && membership.role !== k.role) {
          await k.update({ role: membership.role });
        }
      })
    );
  }

  const allMembers = await group.$get('members');
  const formatted = allMembers.map(a => a.toJSON());

  // Forcibly add the role property, and omit the memberships field
  formatted.forEach((m: any) => {
    m.role = m.memberships.role;
    delete m.memberships;
  });

  return formatted as Member[];
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

export { resolve, edit, importTempleGroup, importCMLGroup };
