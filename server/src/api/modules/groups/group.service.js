const _ = require('lodash');
const { Op } = require('sequelize');
const { Group, Membership, Player } = require('../../../database');
const { generateVerification, verifyCode } = require('../../util/verification');
const { BadRequestError } = require('../../errors');
const playerService = require('../players/player.service');

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
 * Returns a list of all competitions that partially match
 * the given name and/or includes a player whose username partially
 * matches the given username.
 */
async function list(name, username) {
  const formattedName = name && sanitizeName(name);
  const formattedUsername = username && playerService.formatUsername(username);

  const nameQuery = name && { name: { [Op.iLike]: `%${formattedName}%` } };
  const usernameQuery = username && { username: { [Op.iLike]: `%${formattedUsername}%` } };

  const memberships = await Membership.findAll({
    include: [
      { model: Group, where: nameQuery },
      { model: Player, attributes: ['username'], where: usernameQuery }
    ]
  });

  const groupMap = {};

  memberships.forEach(({ group }) => {
    if (!groupMap[group.id]) {
      groupMap[group.id] = group;
    }
  });

  return Object.values(groupMap).map(format);
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

  // Fetch all members
  const memberships = await Membership.findAll({
    where: { groupId: id },
    include: [{ model: Player }]
  });

  // Format the members
  const members = memberships.map(({ player, role }) => {
    return { ...player.toJSON(), role };
  });

  return { ...format(group), members };
}

async function create(name, members) {
  if (!name) {
    throw new BadRequestError('Invalid group name.');
  }

  const sanitizedName = sanitizeName(name);

  if (await Group.findOne({ where: { name: sanitizedName } })) {
    throw new BadRequestError(`Group name '${sanitizedName}' is already taken.`);
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
    return { ...format(group), participants: newMembers };
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
 * This will replace any existing members.
 */
async function setMembers(group, usernames) {
  if (!group) {
    throw new BadRequestError(`Invalid group.`);
  }

  const existingMembers = await group.getMembers();
  const existingUsernames = existingMembers.map(e => e.username);

  const usernamesToAdd = usernames.filter(u => !existingUsernames.includes(u));

  const playersToRemove = existingMembers.filter(p => !usernames.includes(p.username));
  const playersToAdd = await playerService.findAllOrCreate(usernamesToAdd);

  if (playersToRemove && playersToRemove.length > 0) {
    await group.removeMembers(playersToRemove);
  }

  if (playersToAdd && playersToAdd.length > 0) {
    await group.addMembers(playersToAdd);
  }

  const members = (await group.getMembers()).map(member => {
    return _.omit({ ...member.toJSON(), role: member.memberships.role }, ['memberships']);
  });

  return members;
}

/**
 * Adds all the usernames as group members.
 */
async function addMembers(id, verificationCode, usernames) {
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

  // Find all existing members
  const existingIds = (await group.getMembers()).map(p => p.id);

  // Find or create all players with the given usernames
  const players = await playerService.findAllOrCreate(usernames);

  const newPlayers = players.filter(p => existingIds && !existingIds.includes(p.id));

  if (!newPlayers || !newPlayers.length) {
    throw new BadRequestError('All players given are already members.');
  }

  await group.addMembers(newPlayers);

  // Update the "updatedAt" timestamp on the group model
  await group.changed('updatedAt', true);
  await group.save();

  // TODO: for now, all new players are just members,
  // this should be changed to allow for other roles at creation
  return newPlayers.map(n => ({ ...n.toJSON(), role: 'member' }));
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

exports.list = list;
exports.view = view;
exports.create = create;
exports.edit = edit;
exports.destroy = destroy;
exports.addMembers = addMembers;
exports.removeMembers = removeMembers;
exports.changeRole = changeRole;
exports.getMembers = getMembers;
