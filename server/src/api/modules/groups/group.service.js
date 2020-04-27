const _ = require('lodash');
const { Op } = require('sequelize');
const { Group, Membership, Player, Snapshot } = require('../../../database');
const { generateVerification, verifyCode } = require('../../util/verification');
const { BadRequestError } = require('../../errors');
const playerService = require('../players/player.service');
const deltaService = require('../deltas/delta.service');

function sanitizeName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/ +(?= )/g, '')
    .trim();
}

function format(group) {
  return _.omit(group.toJSON(), ['verificationHash']);
}

/**
 * Returns a list of all groups that partially match the given name.
 */
async function list(name) {
  // Fetch all groups that match the name, limited to 20 results
  const groups = await Group.findAll({
    where: name && { name: { [Op.iLike]: `%${sanitizeName(name)}%` } },
    limit: 20
  });

  // Find all memberships for the searched groups.
  const filteredMemberships = await Membership.findAll({
    include: [{ model: Group, where: { id: groups.map(g => g.id) } }]
  });

  // Store in this variable the members count for each group id
  const membersMap = {};

  filteredMemberships.forEach(m => {
    if (!membersMap[m.groupId]) {
      membersMap[m.groupId] = 1;
    } else {
      const curCount = membersMap[m.groupId];
      membersMap[m.groupId] = curCount + 1;
    }
  });

  return groups.map(format).map(g => ({ ...g, memberCount: membersMap[g.id] || 0 }));
}

/**
 * Returns a list of all groups of which a given player is a member.
 */
async function findForPlayer(playerId) {
  if (!playerId) {
    throw new BadRequestError(`Invalid player id.`);
  }

  // Find all memberships for the player
  const memberships = await Membership.findAll({
    where: { playerId },
    include: [{ model: Group }]
  });

  // Extract all the unique groups from the memberships, and format them.
  const groups = _.uniqBy(memberships, m => m.group.id).map(m => format(m.group));

  // Find all memberships for the searched groups.
  const filteredMemberships = await Membership.findAll({
    include: [{ model: Group, where: { id: groups.map(g => g.id) } }]
  });

  // Store in this variable the members count for each group id
  const membersMap = {};

  filteredMemberships.forEach(m => {
    if (!membersMap[m.groupId]) {
      membersMap[m.groupId] = 1;
    } else {
      const curCount = membersMap[m.groupId];
      membersMap[m.groupId] = curCount + 1;
    }
  });

  return groups.map(g => ({ ...g, memberCount: membersMap[g.id] || 0 }));
}

/**
 * Get all the data on a given group. (Info and members)
 */
async function view(id) {
  if (!id) {
    throw new BadRequestError('Invalid group id.');
  }

  const group = await Group.findOne({ where: { id } });

  if (!group) {
    throw new BadRequestError(`Group of id ${id} was not found.`);
  }

  // Fetch all members, and their latest snapshot
  const memberships = await Membership.findAll({
    where: { groupId: id },
    include: [
      {
        model: Player,
        include: [
          {
            model: Snapshot,
            attributes: ['overallExperience', 'overallRank', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 1
          }
        ]
      }
    ]
  });

  // Format the members
  const members = memberships
    .map(({ player, role }) => {
      const { snapshots } = player;

      const overallExperience = snapshots && snapshots.length ? snapshots[0].overallExperience : -1;
      const overallRank = snapshots && snapshots.length ? snapshots[0].overallRank : -1;

      return { ..._.omit(player.toJSON(), ['snapshots']), role, overallExperience, overallRank };
    })
    .sort((a, b) => b.overallExperience - a.overallExperience);

  const memberIds = members.map(m => m.id);

  const totalExperience = memberships
    .filter(({ player }) => player.snapshots && player.snapshots.length > 0)
    .map(({ player }) => parseInt(player.snapshots[0].overallExperience, 10))
    .reduce((acc, cur) => acc + cur, 0);

  const monthlyTopPlayer = members.length ? await deltaService.getMonthlyTop(memberIds) : null;

  return { ...format(group), members, totalExperience, monthlyTopPlayer };
}

async function create(name, members) {
  if (!name) {
    throw new BadRequestError('Invalid group name.');
  }

  const sanitizedName = sanitizeName(name);

  if (await Group.findOne({ where: { name: sanitizedName } })) {
    throw new BadRequestError(`Group name '${sanitizedName}' is already taken.`);
  }

  // If not all elements of members array have a "username" key.
  if (members && members.filter(m => m.username).length !== members.length) {
    throw new BadRequestError('Invalid members list. Each array element must have a username key.');
  }

  const [verificationCode, verificationHash] = await generateVerification();
  const group = await Group.create({ name: sanitizedName, verificationCode, verificationHash });

  if (!members) {
    return { ...format(group), members: [] };
  }

  const newMembers = await setMembers(group, members);

  return { ...format(group), members: newMembers };
}

/**
 * Edit a group
 *
 * Note: If "members" is defined, it will replace the existing members.
 */
async function edit(id, name, verificationCode, members) {
  if (!id) {
    throw new BadRequestError('Invalid group id.');
  }

  if (!verificationCode) {
    throw new BadRequestError('Invalid verification code.');
  }

  if (!name && !members) {
    throw new BadRequestError('You must either include a new name or a new member list.');
  }

  if (name) {
    const sanitizedName = sanitizeName(name);
    const matchingGroup = await Group.findOne({ where: { name: sanitizedName } });

    // If attempting to change to some other group's name.
    if (matchingGroup && matchingGroup.id !== parseInt(id, 10)) {
      throw new BadRequestError(`Group name '${sanitizedName}' is already taken.`);
    }
  }

  const group = await Group.findOne({ where: { id } });

  if (!group) {
    throw new BadRequestError(`Group of id ${id} was not found.`);
  }

  const verified = await verifyCode(group.verificationHash, verificationCode);

  if (!verified) {
    throw new BadRequestError('Incorrect verification code.');
  }

  if (name) {
    await group.update({ name: sanitizeName(name) });
  }

  if (members) {
    const newMembers = await setMembers(group, members);
    return { ...format(group), members: newMembers };
  }

  const memberships = await group.getMembers();

  return {
    ...format(group),
    members: memberships.map(p => ({ ...p.toJSON(), memberships: undefined }))
  };
}

/**
 * Permanently delete a group and all associated memberships.
 */
async function destroy(id, verificationCode) {
  if (!id) {
    throw new BadRequestError('Invalid group id.');
  }

  if (!verificationCode) {
    throw new BadRequestError('Invalid verification code.');
  }

  const group = await Group.findOne({ where: { id } });

  if (!group) {
    throw new BadRequestError(`Group of id ${id} was not found.`);
  }

  const { name } = group;
  const verified = await verifyCode(group.verificationHash, verificationCode);

  if (!verified) {
    throw new BadRequestError('Incorrect verification code.');
  }

  await group.destroy();
  return name;
}

/**
 * Set the members of a group.
 *
 * Note: This will replace any existing members.
 * Note: The members array should have this format:
 * [{username: "ABC", role: "member"}]
 */
async function setMembers(group, members) {
  if (!group) {
    throw new BadRequestError(`Invalid group.`);
  }

  const players = await playerService.findAll(members.map(m => m.username));

  const newMemberships = players.map((p, i) => ({
    playerId: p.id,
    groupId: group.id,
    role: members[i].role || 'member'
  }));

  // Remove all existing memberships
  await Membership.destroy({ where: { groupId: group.id } });

  // Add all the new memberships
  await Membership.bulkCreate(newMemberships, { ignoreDuplicates: true });

  const allMembers = await group.getMembers();

  const formatted = allMembers.map(member =>
    _.omit({ ...member.toJSON(), role: member.memberships.role }, ['memberships'])
  );

  return formatted;
}

/**
 * Adds all the usernames as group members.
 *
 * Note: The members array should have this format:
 * [{username: "ABC", role: "member"}]
 */
async function addMembers(id, verificationCode, members) {
  if (!id) {
    throw new BadRequestError('Invalid group id.');
  }

  if (!verificationCode) {
    throw new BadRequestError('Invalid verification code.');
  }

  if (!members || members.length === 0) {
    throw new BadRequestError('Invalid members list.');
  }

  // If not all elements of members array have a "username" key.
  if (members.filter(m => m.username).length !== members.length) {
    throw new BadRequestError('Invalid members list. Each array element must have a username key.');
  }

  const group = await Group.findOne({ where: { id } });

  if (!group) {
    throw new BadRequestError(`Group of id ${id} was not found.`);
  }

  const verified = await verifyCode(group.verificationHash, verificationCode);

  if (!verified) {
    throw new BadRequestError('Incorrect verification code.');
  }

  // Find all existing members
  const existingIds = (await group.getMembers()).map(p => p.id);

  // Find or create all players with the given usernames
  const players = await playerService.findAllOrCreate(members.map(m => m.username));

  const newPlayers = players.filter(p => existingIds && !existingIds.includes(p.id));

  if (!newPlayers || !newPlayers.length) {
    throw new BadRequestError('All players given are already members.');
  }

  await group.addMembers(newPlayers);

  const leaderUsernames = members
    .filter(m => m.role === 'leader')
    .map(m => playerService.formatUsername(m.username));

  // If there's any new leaders, we have to re-add them, forcing the leader role
  if (leaderUsernames && leaderUsernames.length > 0) {
    const allMembers = await group.getMembers();
    const leaders = allMembers.filter(m => leaderUsernames.includes(m.username));
    await group.addMembers(leaders, { through: { role: 'leader' } });
  }

  // Update the "updatedAt" timestamp on the group model
  await group.changed('updatedAt', true);
  await group.save();

  const allMembers = await group.getMembers();

  const formatted = allMembers.map(member =>
    _.omit({ ...member.toJSON(), role: member.memberships.role }, ['memberships'])
  );

  return formatted;
}

/**
 * Removes all the usernames (members) from a group.
 */
async function removeMembers(id, verificationCode, usernames) {
  if (!id) {
    throw new BadRequestError('Invalid group id.');
  }

  if (!verificationCode) {
    throw new BadRequestError('Invalid verification code.');
  }

  if (!usernames || usernames.length === 0) {
    throw new BadRequestError('Invalid members list.');
  }

  const group = await Group.findOne({ where: { id } });

  if (!group) {
    throw new BadRequestError(`Group of id ${id} was not found.`);
  }

  const verified = await verifyCode(group.verificationHash, verificationCode);

  if (!verified) {
    throw new BadRequestError('Incorrect verification code.');
  }

  const playersToRemove = await playerService.findAll(usernames);

  if (!playersToRemove || !playersToRemove.length) {
    throw new BadRequestError('No valid tracked players were given.');
  }

  // Remove all specific players, and return the removed count
  const removedPlayersCount = await group.removeMembers(playersToRemove);

  if (!removedPlayersCount) {
    throw new BadRequestError('None of the players given were members of that group.');
  }

  // Update the "updatedAt" timestamp on the group model
  await group.changed('updatedAt', true);
  await group.save();

  return removedPlayersCount;
}

/**
 * Change the role of a given username, in a group.
 */
async function changeRole(id, username, role, verificationCode) {
  if (!id) {
    throw new BadRequestError('Invalid group id.');
  }

  if (!username) {
    throw new BadRequestError('Invalid username.');
  }

  if (!role) {
    throw new BadRequestError(`Invalid group role.`);
  }

  if (!verificationCode) {
    throw new BadRequestError('Invalid verification code.');
  }

  const group = await Group.findOne({ where: { id } });

  if (!group) {
    throw new BadRequestError(`Group of id ${id} was not found.`);
  }

  const verified = await verifyCode(group.verificationHash, verificationCode);

  if (!verified) {
    throw new BadRequestError('Incorrect verification code.');
  }

  const membership = await Membership.findOne({
    where: { groupId: id },
    include: [
      {
        model: Player,
        where: { username: playerService.formatUsername(username) }
      }
    ]
  });

  if (!membership) {
    throw new BadRequestError(`'${username}' is not a member of ${group.name}.`);
  }

  const oldRole = membership.role;

  if (membership.role === role) {
    throw new BadRequestError(`'${username}' already has the role of ${role}.`);
  }

  await membership.update({ role });

  // Update the "updatedAt" timestamp on the group model
  await group.changed('updatedAt', true);
  await group.save();

  return { player: { ...membership.player.toJSON(), role: membership.role }, newRole: role, oldRole };
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

exports.format = format;
exports.list = list;
exports.findForPlayer = findForPlayer;
exports.view = view;
exports.create = create;
exports.edit = edit;
exports.destroy = destroy;
exports.addMembers = addMembers;
exports.removeMembers = removeMembers;
exports.changeRole = changeRole;
exports.getMembers = getMembers;
exports.findOne = findOne;
