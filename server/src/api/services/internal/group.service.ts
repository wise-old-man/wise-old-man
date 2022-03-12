import { keyBy, mapValues, uniqBy } from 'lodash';
import moment from 'moment';
import { Op, QueryTypes, Sequelize } from 'sequelize';
import {
  getMetricMeasure,
  getMetricRankKey,
  getMetricValueKey,
  isSkill,
  isValidPeriod,
  Period,
  Metric,
  Metrics,
  METRICS,
  getLevel,
  GROUP_ROLES,
  PRIVELEGED_GROUP_ROLES,
  GroupRole
} from '@wise-old-man/utils';
import { MigratedGroupInfo, Pagination } from '../../../types';
import { sequelize } from '../../../database';
import { Group, Membership, Player, Record, Snapshot } from '../../../database/models';
import { NameChange } from '../../../prisma';
import { BadRequestError, NotFoundError } from '../../errors';
import { isValidDate } from '../../util/dates';
import { get200msCount, getCombatLevel, getTotalLevel } from '../../util/experience';
import * as cmlService from '../external/cml.service';
import * as cryptService from '../external/crypt.service';
import * as templeService from '../external/temple.service';
import * as deltaService from './delta.service';
import * as nameService from './name.service';
import * as playerService from './player.service';
import * as recordService from './record.service';
import * as snapshotService from './snapshot.service';

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
 * Returns a list of all groups that partially match the given name.
 */
async function getList(name: string, pagination: Pagination): Promise<ExtendedGroup[]> {
  // Fetch all groups that match the name
  const groups = await Group.findAll({
    where: name && {
      name: { [Op.iLike]: `%${sanitizeName(name)}%` }
    },
    order: [
      ['score', 'DESC'],
      ['id', 'ASC']
    ],
    limit: pagination.limit,
    offset: pagination.offset
  });

  // Fetch and attach member counts for each group
  const extendedGroups = await extendGroups(groups);

  return extendedGroups;
}

/**
 * Returns a list of all groups of which a given player is a member.
 */
async function getPlayerGroups(playerId: number, pagination: Pagination): Promise<ExtendedGroup[]> {
  // Find all memberships for the player
  const memberships = await Membership.findAll({
    where: { playerId },
    include: [{ model: Group }]
  });

  // Extract all the unique groups from the memberships, and format them.
  const groups = uniqBy(memberships, (m: Membership) => m.group.id)
    .slice(pagination.offset, pagination.offset + pagination.limit)
    .map(p => p.group)
    .sort((a, b) => b.score - a.score);

  const extendedGroups = await extendGroups(groups);

  // Add the player's role to every group object
  extendedGroups.forEach(g => {
    memberships.forEach(m => {
      if (m.groupId === g.id) g.role = m.role;
    });
  });

  return extendedGroups;
}

/**
 * Given a list of groups, it will fetch the member count of each,
 * and inserts a "memberCount" field in every group object.
 */
async function extendGroups(groups: Group[]): Promise<ExtendedGroup[]> {
  /**
   * Will return a members count for every group, with the format:
   * [ {groupId: 35, count: "4"}, {groupId: 41, count: "31"} ]
   */
  const memberCount = await Membership.findAll({
    where: { groupId: groups.map(g => g.id) },
    attributes: ['groupId', [Sequelize.fn('COUNT', Sequelize.col('groupId')), 'count']],
    group: ['groupId'],
    raw: true
  });

  return groups.map(g => {
    const match: any = memberCount.find(m => m.groupId === g.id);
    return { ...(g.toJSON() as any), memberCount: parseInt(match ? match.count : 0) };
  });
}

/**
 * Get all the data on a given group. (Info and members)
 */
async function getDetails(group: Group): Promise<ExtendedGroup> {
  // Format, and calculate the "memberCount" property
  const extendedGroup = (await extendGroups([group]))[0];
  return extendedGroup;
}

async function getMonthlyTopPlayer(groupId: number) {
  const memberships = await Membership.findAll({
    where: { groupId },
    attributes: ['playerId']
  });

  const memberIds = memberships.map(m => m.playerId);

  if (!memberIds.length) return null;

  const pagination = { limit: 1, offset: 0 };
  const leaderboard = await deltaService.getGroupPeriodDeltas(
    Metrics.OVERALL,
    Period.MONTH,
    memberIds,
    pagination
  );

  const monthlyTopPlayer = leaderboard[0] || null;

  return monthlyTopPlayer;
}

/**
 * Gets the current gains leaderboard for a specific metric and time range,
 * between the members of a group.
 */
async function getGainedInTimeRange(
  groupId: number,
  startDate: Date,
  endDate: Date,
  metric: string,
  pagination: Pagination
) {
  if (!metric || !METRICS.includes(metric as Metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  if (!isValidDate(startDate)) throw new BadRequestError('Invalid start date.');
  if (!isValidDate(endDate)) throw new BadRequestError('Invalid end date.');

  const memberships = await Membership.findAll({
    where: { groupId },
    attributes: ['playerId']
  });

  const memberIds = memberships.map(m => m.playerId);

  if (!memberIds.length) {
    throw new BadRequestError(`That group has no members.`);
  }

  const leaderboard = await deltaService.getGroupTimeRangeDeltas(
    metric as Metric,
    startDate,
    endDate,
    memberIds,
    pagination
  );

  return leaderboard;
}

/**
 * Gets the current gains leaderboard for a specific metric and period,
 * between the members of a group.
 */
async function getGainedInPeriod(groupId: number, period: string, metric: string, pagination: Pagination) {
  if (!metric || !METRICS.includes(metric as Metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  const memberships = await Membership.findAll({
    where: { groupId },
    attributes: ['playerId']
  });

  const memberIds = memberships.map(m => m.playerId);

  if (!memberIds.length) {
    throw new BadRequestError(`That group has no members.`);
  }

  const leaderboard = await deltaService.getGroupPeriodDeltas(metric, period, memberIds, pagination);

  return leaderboard;
}

/**
 * Gets the top records for a specific metric and period,
 * between the members of a group.
 */
async function getRecords(
  groupId: number,
  metric: string,
  period: string,
  pagination: Pagination
): Promise<Record[]> {
  if (!period || !isValidPeriod(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  if (!metric || !METRICS.includes(metric as Metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  const memberships = await Membership.findAll({
    where: { groupId },
    attributes: ['playerId']
  });

  if (!memberships.length) {
    throw new BadRequestError('This group has no members.');
  }

  const filter = { playerIds: memberships.map(m => m.playerId), metric, period };
  const records = await recordService.getGroupLeaderboard(filter, pagination);

  return records;
}

async function getMembersList(group: Group): Promise<Member[]> {
  // Fetch all memberships for the group
  const memberships = await Membership.findAll({
    attributes: ['groupId', 'playerId', 'role', 'createdAt'],
    where: { groupId: group.id },
    include: [{ model: Player }]
  });

  if (!memberships || memberships.length === 0) {
    return [];
  }

  const priorities = PRIVELEGED_GROUP_ROLES.reverse();

  // Format all the members, add each experience to its respective player, and sort them by role
  return memberships
    .map(({ player, role, createdAt }) => ({ ...(player.toJSON() as any), role, joinedAt: createdAt }))
    .sort((a, b) => priorities.indexOf(b.role) - priorities.indexOf(a.role) || a.role.localeCompare(b.role));
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
      data.level = metric === Metrics.OVERALL ? getTotalLevel(d as Snapshot) : getLevel(data.experience);
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

async function getNameChanges(groupId: number, pagination: Pagination): Promise<NameChange[]> {
  const memberships = await Membership.findAll({
    where: { groupId },
    attributes: ['playerId']
  });

  if (!memberships.length) {
    throw new BadRequestError(`That group has no members.`);
  }

  const memberIds = memberships.map(m => m.playerId);
  const nameChanges = await nameService.findAllForGroup(memberIds, pagination);

  return nameChanges;
}

async function getStatistics(groupId: number) {
  const stats = await getMembersStats(groupId);

  if (!stats || stats.length === 0) {
    throw new BadRequestError("Couldn't find any stats for this group.");
  }

  const maxedCombatCount = stats.filter(s => getCombatLevel(s) === 126).length;
  const maxedTotalCount = stats.filter(s => getTotalLevel(s) === 2277).length;
  const maxed200msCount = stats.map(s => get200msCount(s)).reduce((acc, cur) => acc + cur, 0);
  const averageStats = snapshotService.format(snapshotService.average(stats));

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
      .filter(username => !playerService.isValidUsername(username));

    if (invalidUsernames.length > 0) {
      throw new BadRequestError(
        `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
         contain no special characters, and/or contain no space at the beginning or end of the name.`,
        invalidUsernames
      );
    }
  }

  const [code, hash] = await cryptService.generateVerification();
  const sanitizedDescription = description ? playerService.sanitize(description) : null;
  const sanitizedClanChat = clanChat ? playerService.sanitize(clanChat) : null;

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
      .filter(username => !playerService.isValidUsername(username));

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
      group.description = playerService.sanitize(description);
    }

    if (clanChat && clanChat.length !== 0) {
      group.clanChat = playerService.sanitize(clanChat);
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
 * Permanently delete a group and all associated memberships.
 */
async function destroy(group: Group): Promise<string> {
  const groupName = group.name;

  await group.destroy();
  return groupName;
}

/**
 * Resets a group's verification code by generating a new one
 * and updating the verificationHash field in the database.
 */
async function resetVerificationCode(group: Group): Promise<string> {
  const [code, hash] = await cryptService.generateVerification();
  await group.update({ verificationHash: hash });

  return code;
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
  const uniqueNames = uniqBy(members, m => playerService.standardize(m.username)).map(m => m.username);

  // Fetch (or create) player from the unique usernames
  const players = await playerService.findAllOrCreate(uniqueNames);

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

    if (!playerService.isValidUsername(m.username)) {
      throw new BadRequestError("At least one of the member's usernames is not a valid OSRS username.");
    }

    if (m.role && !GROUP_ROLES.includes(m.role as GroupRole)) {
      throw new BadRequestError(`${m.role} is not a valid role.`);
    }
  });

  // Find all existing members
  const existingIds = (await group.$get('members')).map(p => p.id);

  // Find or create all players with the given usernames
  const players = await playerService.findAllOrCreate(members.map(m => m.username));

  // Filter out any already existing usersnames to find the new unique usernames
  const newPlayers = players.filter(p => existingIds && !existingIds.includes(p.id));

  if (!newPlayers || !newPlayers.length) {
    throw new BadRequestError('All players given are already members.');
  }

  // Add the new players to the group (as members)
  await group.$add('members', newPlayers);

  const nonMemberRoleUsernames = members
    .filter(m => m.role && m.role !== 'member')
    .map(m => ({ ...m, username: playerService.standardize(m.username) }));

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

  const playersToRemove = await playerService.findAll(usernames);

  if (!playersToRemove || !playersToRemove.length) {
    throw new BadRequestError('No valid tracked players were given.');
  }

  // Remove all specific players, and return the removed count
  const removedPlayersCount = await group.$remove('members', playersToRemove);

  if (!removedPlayersCount) {
    throw new BadRequestError('None of the players given were members of that group.');
  }

  // Update the "updatedAt" timestamp on the group model
  group.changed('updatedAt', true);
  await group.save();

  return removedPlayersCount;
}

/**
 * Change the role of a given username, in a group.
 */
async function changeRole(group: Group, member: MemberFragment): Promise<[Player, string]> {
  const { username, role } = member;

  const membership = await Membership.findOne({
    where: { groupId: group.id },
    include: [{ model: Player, where: { username: playerService.standardize(username) } }]
  });

  if (!membership) {
    throw new BadRequestError(`${username} is not a member of ${group.name}.`);
  }

  if (membership.role === role) {
    throw new BadRequestError(`${username} is already a ${role}.`);
  }

  if (!GROUP_ROLES.includes(member.role as GroupRole)) {
    throw new BadRequestError(`${member.role} is not a valid role.`);
  }

  await membership.update({ role });

  // Update the "updatedAt" timestamp on the group model
  group.changed('updatedAt', true);
  await group.save();

  return [membership.player, role];
}

/**
 * Get all members for a specific group id.
 */
async function getMembers(groupId) {
  // Fetch all members
  const memberships = await Membership.findAll({
    where: { groupId },
    include: [{ model: Player }]
  });

  // Format the members
  const members = memberships.map(({ player, role }) => {
    return { ...player.toJSON(), role };
  });

  return members;
}

async function findOne(groupId) {
  const group = await Group.findOne({ where: { id: groupId } });
  return group;
}

/**
 * Update all members of a group.
 *
 * An update action must be supplied, to be executed for every member.
 * This is to prevent calling jobs from within the service (circular dependency).
 * I'd rather call them from the controller.
 */
async function updateAllMembers(group: Group, updateAction: (player: Player) => void) {
  const members = await getOutdatedMembers(group.id);

  if (!members || members.length === 0) {
    throw new BadRequestError('This group has no outdated members (updated over 1h ago).');
  }

  // Execute the update action for every member
  members.forEach(player => updateAction(player));

  return members;
}

/**
 * Get outdated members of a specific group id.
 * A member is considered outdated 24 hours after their last update.
 */
async function getOutdatedMembers(groupId) {
  if (!groupId) {
    throw new BadRequestError('Invalid group id.');
  }

  const hourAgo = moment().subtract(24, 'hour');

  const membersToUpdate = await Membership.findAll({
    attributes: ['groupId', 'playerId'],
    where: { groupId },
    include: [
      {
        model: Player,
        where: {
          updatedAt: { [Op.lt]: hourAgo.toDate() }
        }
      }
    ]
  });

  return membersToUpdate.map(({ player }) => player);
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
  getMembers,
  findOne,
  getList,
  getDetails,
  getPlayerGroups,
  getMonthlyTopPlayer,
  getGainedInPeriod,
  getGainedInTimeRange,
  getRecords,
  getHiscores,
  getMembersList,
  getStatistics,
  getNameChanges,
  create,
  edit,
  destroy,
  resetVerificationCode,
  addMembers,
  removeMembers,
  changeRole,
  updateAllMembers,
  importTempleGroup,
  importCMLGroup
};
