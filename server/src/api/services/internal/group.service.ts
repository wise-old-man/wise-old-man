import { keyBy, mapValues, uniqBy } from 'lodash';
import { QueryTypes } from 'sequelize';
import {
  GROUP_ROLES,
  GroupRole,
  Metric,
  METRICS,
  getMetricValueKey,
  getMetricMeasure,
  getMetricRankKey,
  isSkill,
  get200msCount,
  getCombatLevel,
  getTotalLevel,
  getLevel
} from '../../../utils';
import { MigratedGroupInfo, Pagination } from '../../../types';
import { sequelize } from '../../../database';
import { Group, Membership, Player, Snapshot } from '../../../database/models';
import { BadRequestError, NotFoundError } from '../../errors';
import * as cmlService from '../external/cml.service';
import * as cryptService from '../external/crypt.service';
import * as templeService from '../external/temple.service';
import * as snapshotUtils from '../../modules/snapshots/snapshot.utils';
import * as playerUtils from '../../modules/players/player.utils';
import * as playerServices from '../../modules/players/player.services';

interface Member extends Player {
  role: string;
}

interface MemberFragment {
  username: string;
  role: string;
}

interface ExtendedGroup extends Group {
  memberCount: number;
  role?: string;
}

interface CreateGroupDTO {
  name: string;
  clanChat?: string;
  homeworld?: number;
  description?: string;
  members?: MemberFragment[];
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
 * Gets the group hiscores for a specific metric.
 * All members which HAVE SNAPSHOTS will included and sorted by rank.
 */
async function getHiscores(groupId: number, metric: string, pagination: Pagination) {
  if (!metric || !METRICS.includes(metric as Metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  // Fetch all memberships for the group
  const memberships = await Membership.findAll({
    attributes: ['playerId'],
    where: { groupId },
    include: [{ model: Player }]
  });

  if (!memberships || memberships.length === 0) {
    return [];
  }

  const valueKey = getMetricValueKey(metric as Metric);
  const rankKey = getMetricRankKey(metric as Metric);
  const measure = getMetricMeasure(metric as Metric);
  const memberIds = memberships.map(m => m.player.id);

  const query = `
    SELECT s.*
    FROM (SELECT q."playerId", MAX(q."createdAt") AS max_date
          FROM public.snapshots q
          WHERE q."playerId" IN (${memberIds.join(',')})
          GROUP BY q."playerId"
          ) r
    JOIN public.snapshots s
      ON s."playerId" = r."playerId" AND s."createdAt" = r.max_date
    ORDER BY s."${valueKey}" DESC
    LIMIT :limit
    OFFSET :offset
  `;

  // Execute the query above, which returns the latest snapshot for each member
  const latestSnapshots = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements: { ...pagination }
  });

  // Formats the experience snapshots to a key:value map.
  // Example: { '1623': { rank: 350567, experience: 6412215 } }
  const experienceMap = mapValues(keyBy(latestSnapshots, 'playerId'), d => {
    const data = {
      rank: parseInt(d[rankKey], 10),
      [measure]: parseInt(d[valueKey], 10)
    };

    if (isSkill(metric as Metric)) {
      data.level = metric === Metric.OVERALL ? getTotalLevel(d as Snapshot) : getLevel(data.experience);
    }

    return data;
  });

  // Format all the members, add each experience to its respective player, and sort them by exp
  return memberships
    .filter(({ playerId }: any) => experienceMap[playerId] && experienceMap[playerId].rank > 0)
    .map(({ player }: any) => ({ player: player.toJSON(), ...experienceMap[player.id] }))
    .sort((a, b) => b[measure] - a[measure]);
}

/**
 * Gets the stats for every member of a group (latest snapshot)
 */
async function getMembersStats(groupId: number): Promise<Snapshot[]> {
  // Fetch all memberships for the group
  const memberships = await Membership.findAll({
    attributes: ['playerId'],
    where: { groupId }
  });

  if (!memberships || memberships.length === 0) {
    return [];
  }

  const memberIds = memberships.map(m => m.playerId);

  const query = `
    SELECT s.*
    FROM (SELECT q."playerId", MAX(q."createdAt") AS max_date
          FROM public.snapshots q
          WHERE q."playerId" IN (${memberIds.join(',')})
          GROUP BY q."playerId"
          ) r
    JOIN public.snapshots s
      ON s."playerId" = r."playerId" AND s."createdAt" = r.max_date
  `;

  // Execute the query above, which returns the latest snapshot for each member
  const latestSnapshots = await sequelize.query(query, { type: QueryTypes.SELECT });

  // Formats the snapshots to a playerId:snapshot map, for easier lookup
  const snapshotMap = mapValues(keyBy(latestSnapshots, 'playerId'));

  return memberships
    .filter(({ playerId }) => playerId in snapshotMap)
    .map(({ playerId }) => Snapshot.build({ ...snapshotMap[playerId] }));
}

async function getStatistics(groupId: number) {
  const stats = await getMembersStats(groupId);

  if (!stats || stats.length === 0) {
    throw new BadRequestError("Couldn't find any stats for this group.");
  }

  const maxedCombatCount = stats.filter(s => getCombatLevel(s) === 126).length;
  const maxedTotalCount = stats.filter(s => getTotalLevel(s) === 2277).length;
  const maxed200msCount = stats.map(s => get200msCount(s)).reduce((acc, cur) => acc + cur, 0);
  const averageStats = snapshotUtils.format(snapshotUtils.average(stats));

  return { maxedCombatCount, maxedTotalCount, maxed200msCount, averageStats };
}

async function create(dto: CreateGroupDTO): Promise<[Group, Member[]]> {
  const { name, clanChat, homeworld, members, description } = dto;
  const sanitizedName = sanitizeName(name);

  // Check for duplicate names
  if (await Group.findOne({ where: { name: sanitizedName } })) {
    throw new BadRequestError(`Group name '${sanitizedName}' is already taken.`);
  }

  // All elements of the "members" array must have a "username" key.
  if (members && members.filter(m => m.username).length !== members.length) {
    throw new BadRequestError('Invalid members list. Each array element must have a username key.');
  }

  // Check if there are any invalid roles given
  if (members && members.length > 0) {
    const invalidRoles = members.filter(m => m.role && !GROUP_ROLES.includes(m.role as GroupRole));

    if (invalidRoles.length > 0) {
      throw new BadRequestError(
        'Invalid member roles. Please check the roles of the given members.',
        invalidRoles.map(m => ({ username: m.username, role: m.role }))
      );
    }
  }

  // Check if every username in the list is valid
  if (members && members.length > 0) {
    const invalidUsernames = members
      .map(member => member.username)
      .filter(username => !playerUtils.isValidUsername(username));

    if (invalidUsernames.length > 0) {
      throw new BadRequestError(
        `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
         contain no special characters, and/or contain no space at the beginning or end of the name.`,
        invalidUsernames
      );
    }
  }

  const [code, hash] = await cryptService.generateVerification();
  const sanitizedDescription = description ? playerUtils.sanitize(description) : null;
  const sanitizedClanChat = clanChat ? playerUtils.sanitize(clanChat) : null;

  const group = await Group.create({
    name: sanitizedName,
    description: sanitizedDescription,
    clanChat: sanitizedClanChat,
    homeworld,
    verificationCode: code,
    verificationHash: hash
  });

  // Hide the verificationHash from the response
  group.verificationHash = undefined;

  const newMembers = members ? await setMembers(group, members) : [];

  return [group, newMembers];
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

/**
 * Adds all the usernames as group members.
 *
 * Note: The members array should have this format:
 * [{username: "ABC", role: "member"}]
 */
async function addMembers(group: Group, members: MemberFragment[]): Promise<Member[]> {
  if (!members || members.length === 0) {
    throw new BadRequestError('Invalid or empty members list.');
  }

  // check and throw an error if the model is invalid, or the username is invalid
  members.forEach(m => {
    if (!m.username) {
      throw new BadRequestError('Invalid members list. Each member must have a "username".');
    }

    if (!playerUtils.isValidUsername(m.username)) {
      throw new BadRequestError("At least one of the member's usernames is not a valid OSRS username.");
    }

    if (m.role && !GROUP_ROLES.includes(m.role as GroupRole)) {
      throw new BadRequestError(`${m.role} is not a valid role.`);
    }
  });

  // Find all existing members
  const existingIds = (await group.$get('members')).map(p => p.id);

  // Find or create all players with the given usernames
  const players = await playerServices.findPlayers({
    usernames: members.map(m => m.username),
    createIfNotFound: true
  });

  // Filter out any already existing usersnames to find the new unique usernames
  const newPlayers = players.filter(p => existingIds && !existingIds.includes(p.id));

  if (!newPlayers || !newPlayers.length) {
    throw new BadRequestError('All players given are already members.');
  }

  // Add the new players to the group (as members)
  await Membership.bulkCreate(newPlayers.map(p => ({ playerId: p.id, groupId: group.id })));

  const nonMemberRoleUsernames = members
    .filter(m => m.role && m.role !== 'member')
    .map(m => ({ ...m, username: playerUtils.standardize(m.username) }));

  // If there are any non-member specific roles used, we need to set them correctly since group.$add does not
  if (nonMemberRoleUsernames && nonMemberRoleUsernames.length > 0) {
    const roleHash = {};
    for (const newMember of nonMemberRoleUsernames) {
      if (Object.keys(roleHash).includes(newMember.role)) {
        roleHash[newMember.role] = [...roleHash[newMember.role], newMember.username];
      } else {
        roleHash[newMember.role] = [newMember.username];
      }
    }

    const allMembers = await group.$get('members');

    for (const role of Object.keys(roleHash)) {
      const roleList = allMembers.filter(m => roleHash[role].includes(m.username));
      await group.$add('members', roleList, { through: { role } });
    }
  }

  // Update the "updatedAt" timestamp on the group model
  group.changed('updatedAt', true);
  await group.save();

  const allMembers = await group.$get('members');

  return allMembers.map((m: any) => ({
    ...(m.toJSON() as any),
    role: m.memberships.role,
    memberships: undefined
  }));
}

/**
 * Removes all the usernames (members) from a group.
 */
async function removeMembers(group: Group, usernames: string[]) {
  if (!usernames || usernames.length === 0) {
    throw new BadRequestError('Invalid or empty members list.');
  }

  const playersToRemove = await playerServices.findPlayers({ usernames });

  if (!playersToRemove || !playersToRemove.length) {
    throw new BadRequestError('No valid tracked players were given.');
  }

  // Remove all specific players, and return the removed count
  const removedPlayersCount = await Membership.destroy({
    where: { groupId: group.id, playerId: playersToRemove.map(p => p.id) }
  });

  if (!removedPlayersCount) {
    throw new BadRequestError('None of the players given were members of that group.');
  }

  // Update the "updatedAt" timestamp on the group model
  group.changed('updatedAt', true);
  await group.save();

  return removedPlayersCount;
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

export {
  resolve,
  getHiscores,
  getStatistics,
  create,
  edit,
  addMembers,
  removeMembers,
  importTempleGroup,
  importCMLGroup
};
