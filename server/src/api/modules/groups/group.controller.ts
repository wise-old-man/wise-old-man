import { Request } from 'express';
import { ForbiddenError } from '../../errors';
import * as adminGuard from '../../guards/admin.guard';
import * as verificationGuard from '../../guards/verification.guard';
import * as nameChangeServices from '../name-changes/name-change.services';
import * as recordServices from '../records/record.services';
import * as groupServices from './group.services';
import * as deltaServices from '../deltas/delta.services';
import * as achievementServices from '../achievements/achievement.services';
import * as competitionServices from '../competitions/competition.services';
import { getNumber, getEnum, getDate, getString } from '../../util/validation';
import { ControllerResponse } from '../../util/routing';
import { MigrationDataSource } from './group.types';

// GET /groups
async function search(req: Request): Promise<ControllerResponse> {
  const results = await groupServices.searchGroups({
    name: getString(req.query.name),
    limit: getNumber(req.query.limit),
    offset: getNumber(req.query.offset)
  });

  return { statusCode: 200, response: results };
}

// POST /groups
async function create(req: Request): Promise<ControllerResponse> {
  const result = await groupServices.createGroup({
    name: getString(req.body.name),
    clanChat: getString(req.body.clanChat),
    homeworld: req.body.homeworld,
    description: getString(req.body.description),
    members: req.body.members
  });

  return { statusCode: 201, response: result };
}

// PUT /groups/:id
async function edit(req: Request): Promise<ControllerResponse> {
  const isVerifiedCode = await verificationGuard.verifyGroupCode(req);

  if (!isVerifiedCode) {
    throw new ForbiddenError('Incorrect verification code.');
  }

  const result = await groupServices.editGroup({
    id: getNumber(req.params.id),
    name: getString(req.body.name),
    clanChat: getString(req.body.clanChat),
    description: getString(req.body.description),
    homeworld: getNumber(req.body.homeworld),
    bannerImage: getString(req.body.bannerImage),
    profileImage: getString(req.body.profileImage),
    socialLinks: req.body.socialLinks,
    members: req.body.members
  });

  return { statusCode: 200, response: result };
}

// GET /groups/:id
async function details(req: Request): Promise<ControllerResponse> {
  const result = await groupServices.fetchGroupDetails({
    id: getNumber(req.params.id)
  });

  return { statusCode: 200, response: result };
}

// GET /groups/:id/csv
async function membersCSV(req: Request): Promise<ControllerResponse> {
  const result = await groupServices.fetchGroupMembersCSV({
    id: getNumber(req.params.id)
  });

  return { statusCode: 200, response: result };
}

// DELETE /groups/:id
async function remove(req: Request): Promise<ControllerResponse> {
  if (!('adminPassword' in req.body) || !adminGuard.checkAdminPermissions(req)) {
    const isVerifiedCode = await verificationGuard.verifyGroupCode(req);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }
  }

  const deletedGroup = await groupServices.deleteGroup({
    id: getNumber(req.params.id)
  });

  return {
    statusCode: 200,
    response: { message: `Successfully deleted group: ${deletedGroup.name}` }
  };
}

// PUT /groups/:id/reset-code
async function resetGroupCode(req: Request): Promise<ControllerResponse> {
  if (!adminGuard.checkAdminPermissions(req)) {
    throw new ForbiddenError('Incorrect admin password.');
  }

  const result = await groupServices.resetGroupCode({
    id: getNumber(req.params.id)
  });

  return { statusCode: 200, response: result };
}

// PUT /groups/:id/verify
async function verifyGroup(req: Request): Promise<ControllerResponse> {
  if (!adminGuard.checkAdminPermissions(req)) {
    throw new ForbiddenError('Incorrect admin password.');
  }

  const result = await groupServices.verifyGroup({
    id: getNumber(req.params.id)
  });

  return { statusCode: 200, response: result };
}

// PUT /groups/:id/role
async function changeRole(req: Request): Promise<ControllerResponse> {
  const isVerifiedCode = await verificationGuard.verifyGroupCode(req);

  if (!isVerifiedCode) {
    throw new ForbiddenError('Incorrect verification code.');
  }

  const result = await groupServices.changeMemberRole({
    id: getNumber(req.params.id),
    role: getEnum(req.body.role),
    username: getString(req.body.username)
  });

  return { statusCode: 200, response: result };
}

// POST /groups/:id/update-all
async function updateAll(req: Request): Promise<ControllerResponse> {
  const isVerifiedCode = await verificationGuard.verifyGroupCode(req);

  if (!isVerifiedCode) {
    throw new ForbiddenError('Incorrect verification code.');
  }

  const outdatedCount = await groupServices.updateAllMembers({
    groupId: getNumber(req.params.id)
  });

  const message = `${outdatedCount} outdated (updated > 24h ago) players are being updated. This can take up to a few minutes.`;

  return { statusCode: 200, response: { message } };
}

// POST /groups/:id/members
async function addMembers(req: Request): Promise<ControllerResponse> {
  const isVerifiedCode = await verificationGuard.verifyGroupCode(req);

  if (!isVerifiedCode) {
    throw new ForbiddenError('Incorrect verification code.');
  }

  const result = await groupServices.addMembers({
    id: getNumber(req.params.id),
    members: req.body.members
  });

  return {
    statusCode: 200,
    response: { count: result.count, message: `Successfully added ${result.count} members.` }
  };
}

// DELETE /groups/:id/members
async function removeMembers(req: Request): Promise<ControllerResponse> {
  if (!('adminPassword' in req.body) || !adminGuard.checkAdminPermissions(req)) {
    const isVerifiedCode = await verificationGuard.verifyGroupCode(req);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }
  }

  const result = await groupServices.removeMembers({
    id: getNumber(req.params.id),
    usernames: req.body.members
  });

  return {
    statusCode: 200,
    response: { count: result.count, message: `Successfully removed ${result.count} members.` }
  };
}

// GET /groups/:id/competitions
async function competitions(req: Request): Promise<ControllerResponse> {
  const results = await competitionServices.findGroupCompetitions({
    groupId: getNumber(req.params.id)
  });

  return { statusCode: 200, response: results };
}

// GET /groups/:id/activity
async function activity(req: Request): Promise<ControllerResponse> {
  const results = await groupServices.fetchGroupActivity({
    groupId: getNumber(req.params.id),
    limit: getNumber(req.query.limit),
    offset: getNumber(req.query.offset)
  });

  return { statusCode: 200, response: results };
}

// GET /groups/:id/gained
async function gained(req: Request): Promise<ControllerResponse> {
  const results = await deltaServices.findGroupDeltas({
    id: getNumber(req.params.id),
    metric: getEnum(req.query.metric),
    period: getEnum(req.query.period),
    minDate: getDate(req.query.startDate),
    maxDate: getDate(req.query.endDate),
    limit: getNumber(req.query.limit),
    offset: getNumber(req.query.offset)
  });

  return { statusCode: 200, response: results };
}

// GET /groups/:id/achievements
async function achievements(req: Request): Promise<ControllerResponse> {
  const results = await achievementServices.findGroupAchievements({
    id: getNumber(req.params.id),
    limit: getNumber(req.query.limit),
    offset: getNumber(req.query.offset)
  });

  return { statusCode: 200, response: results };
}

// GET /groups/:id/records
async function records(req: Request): Promise<ControllerResponse> {
  const results = await recordServices.findGroupRecords({
    id: getNumber(req.params.id),
    period: getEnum(req.query.period),
    metric: getEnum(req.query.metric),
    limit: getNumber(req.query.limit),
    offset: getNumber(req.query.offset)
  });

  return { statusCode: 200, response: results };
}

// GET /groups/:id/hiscores
async function hiscores(req: Request): Promise<ControllerResponse> {
  const results = await groupServices.fetchGroupHiscores({
    id: getNumber(req.params.id),
    metric: getEnum(req.query.metric),
    limit: getNumber(req.query.limit),
    offset: getNumber(req.query.offset)
  });

  return { statusCode: 200, response: results };
}

// GET /groups/:id/name-changes
async function nameChanges(req: Request): Promise<ControllerResponse> {
  const results = await nameChangeServices.findGroupNameChanges({
    id: getNumber(req.params.id),
    limit: getNumber(req.query.limit),
    offset: getNumber(req.query.offset)
  });

  return { statusCode: 200, response: results };
}

// GET /groups/:id/statistics
async function statistics(req: Request): Promise<ControllerResponse> {
  const result = await groupServices.fetchGroupStatistics({
    id: getNumber(req.params.id)
  });

  return { statusCode: 200, response: result };
}

// GET /groups/migrate/temple/:id
async function migrateTemple(req: Request): Promise<ControllerResponse> {
  const result = await groupServices.migrateGroup({
    externalId: getNumber(req.params.id),
    externalSource: MigrationDataSource.TEMPLE_OSRS
  });

  return { statusCode: 200, response: result };
}

// GET /groups/migrate/cml/:id
async function migrateCML(req: Request): Promise<ControllerResponse> {
  const result = await groupServices.migrateGroup({
    externalId: getNumber(req.params.id),
    externalSource: MigrationDataSource.CRYSTAL_MATH_LABS
  });

  return { statusCode: 200, response: result };
}

export {
  search,
  create,
  edit,
  remove,
  changeRole,
  updateAll,
  details,
  membersCSV,
  gained,
  achievements,
  records,
  hiscores,
  nameChanges,
  statistics,
  competitions,
  activity,
  addMembers,
  removeMembers,
  migrateTemple,
  migrateCML,
  resetGroupCode,
  verifyGroup
};
