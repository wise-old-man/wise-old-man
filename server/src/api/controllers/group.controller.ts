import { NextFunction, Request, Response } from 'express';
import { BadRequestError, ForbiddenError } from '../errors';
import { Period, Metric } from '../../utils';
import * as adminGuard from '../guards/admin.guard';
import * as verificationGuard from '../guards/verification.guard';
import jobs from '../jobs';
import * as competitionService from '../services/internal/competition.service';
import * as groupService from '../services/internal/group.service';
import * as nameChangeServices from '../modules/name-changes/name-change.services';
import * as recordServices from '../modules/records/record.services';
import * as groupServices from '../modules/groups/group.services';
import * as deltaServices from '../modules/deltas/delta.services';
import * as achievementServices from '../modules/achievements/achievement.services';
import { extractNumber, extractString, extractStrings } from '../util/http';
import { getPaginationConfig } from '../util/pagination';
import { getNumber, getEnum, getDate, getString } from '../util/validation';
import { ControllerResponse } from '../util/routing';

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
async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const name = extractString(req.body, { key: 'name', required: true });
    const clanChat = extractString(req.body, { key: 'clanChat' });
    const homeworld = extractNumber(req.body, { key: 'homeworld' });
    const description = extractString(req.body, { key: 'description' });
    const members = req.body.members;

    const dto = { name, clanChat, homeworld, members, description };
    const [group, newMembers] = await groupService.create(dto);

    res.status(201).json({ ...group.toJSON(), members: newMembers });
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id
async function details(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });

    const group = await groupService.resolve(id);
    const groupDetails = await groupService.getDetails(group);

    res.json(groupDetails);
  } catch (e) {
    next(e);
  }
}

// PUT /groups/:id
async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const name = extractString(req.body, { key: 'name' });
    const clanChat = extractString(req.body, { key: 'clanChat' });
    const homeworld = extractNumber(req.body, { key: 'homeworld' });
    const description = extractString(req.body, { key: 'description' });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });
    const members = req.body.members;

    if (!name && !members && !clanChat && !homeworld && !description) {
      throw new BadRequestError('Nothing to update.');
    }

    const group = await groupService.resolve(id, true);
    const isVerifiedCode = await verificationGuard.verifyGroupCode(group, verificationCode);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }

    const dto = { name, clanChat, members, homeworld, description, verificationCode };
    const [editedGroup, newMembers] = await groupService.edit(group, dto);

    res.status(200).json({ ...editedGroup.toJSON(), members: newMembers });
  } catch (e) {
    next(e);
  }
}

// DELETE /groups/:id
async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });

    const group = await groupService.resolve(id, true);
    const isVerifiedCode = await verificationGuard.verifyGroupCode(group, verificationCode);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }

    const groupName = await groupService.destroy(group);
    const message = `Successfully deleted group '${groupName}'. (id: ${id})`;

    res.json({ message });
  } catch (e) {
    next(e);
  }
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

// PUT /groups/:id/change-role
async function changeRole(req: Request): Promise<ControllerResponse> {
  const id = extractNumber(req.params, { key: 'id', required: true });
  const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });

  const group = await groupService.resolve(id, true);
  const isVerifiedCode = await verificationGuard.verifyGroupCode(group, verificationCode);

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
async function updateAll(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });

    const group = await groupService.resolve(id, true);
    const isVerifiedCode = await verificationGuard.verifyGroupCode(group, verificationCode);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }

    const members = await groupService.updateAllMembers(group, ({ username }) => {
      jobs.add('UpdatePlayer', { username, source: 'Group:UpdateAll' });
    });

    const message = `${members.length} outdated (updated > 24h ago) players are being updated. This can take up to a few minutes.`;

    res.json({ message });
  } catch (e) {
    next(e);
  }
}

// POST /groups/:id/add-members
async function addMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });
    const members = req.body.members;

    const group = await groupService.resolve(id, true);
    const isVerifiedCode = await verificationGuard.verifyGroupCode(group, verificationCode);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }

    const result = await groupService.addMembers(group, members);

    res.json({ members: result });
  } catch (e) {
    next(e);
  }
}

// POST /groups/:id/remove-members
async function removeMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const members = extractStrings(req.body, { key: 'members', required: true });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });

    const group = await groupService.resolve(id, true);
    const isVerifiedCode = await verificationGuard.verifyGroupCode(group, verificationCode);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }

    const count = await groupService.removeMembers(group, members);
    const message = `Successfully removed ${count} members from group of id: ${id}`;

    res.json({ message });
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/members
async function listMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });

    const group = await groupService.resolve(id);
    const membersList = await groupService.getMembersList(group);

    res.json(membersList);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/competitions
async function competitions(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const limit = extractNumber(req.query, { key: 'limit' });
    const offset = extractNumber(req.query, { key: 'offset' });

    // Ensure this group Id exists (if not, it'll throw a 404 error)
    await groupService.resolve(id);

    const paginationConfig = getPaginationConfig(limit, offset);
    const groupCompetitions = await competitionService.getGroupCompetitions(id, paginationConfig);

    res.json(groupCompetitions);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/monthly-top
async function monthlyTop(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });

    // Ensure this group Id exists (if not, it'll throw a 404 error)
    await groupService.resolve(id);

    // Get the member with the most monthly overall gains
    const topPlayers = await deltaServices.findGroupDeltas({
      id,
      limit: 1,
      metric: Metric.OVERALL,
      period: Period.MONTH
    });

    res.json(topPlayers[0] || null);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/gained
async function gained(req: Request, res: Response, next: NextFunction) {
  try {
    const results = await deltaServices.findGroupDeltas({
      id: getNumber(req.params.id),
      metric: getEnum(req.query.metric),
      period: getEnum(req.query.period),
      minDate: getDate(req.query.startDate),
      maxDate: getDate(req.query.endDate),
      limit: getNumber(req.query.limit),
      offset: getNumber(req.query.offset)
    });

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/achievements
async function achievements(req: Request, res: Response, next: NextFunction) {
  try {
    const results = await achievementServices.findGroupAchievements({
      id: getNumber(req.params.id),
      limit: getNumber(req.query.limit),
      offset: getNumber(req.query.offset)
    });

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/records
async function records(req: Request, res: Response, next: NextFunction) {
  try {
    const results = await recordServices.findGroupRecords({
      id: getNumber(req.params.id),
      period: getEnum(req.query.period),
      metric: getEnum(req.query.metric),
      limit: getNumber(req.query.limit),
      offset: getNumber(req.query.offset)
    });

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/hiscores
async function hiscores(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const metric = extractString(req.query, { key: 'metric', required: true });
    const limit = extractNumber(req.query, { key: 'limit' });
    const offset = extractNumber(req.query, { key: 'offset' });

    // Ensure this group Id exists (if not, it'll throw a 404 error)
    await groupService.resolve(id);

    const paginationConfig = getPaginationConfig(limit, offset);
    const results = await groupService.getHiscores(id, metric, paginationConfig);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/name-changes
async function nameChanges(req: Request, res: Response, next: NextFunction) {
  try {
    const results = await nameChangeServices.findGroupNameChanges({
      id: getNumber(req.params.id),
      limit: getNumber(req.query.limit),
      offset: getNumber(req.query.offset)
    });

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/statistics
async function statistics(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });

    // Ensure this group Id exists (if not, it'll throw a 404 error)
    await groupService.resolve(id);

    const results = await groupService.getStatistics(id);
    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /groups/migrate/temple/:id
async function migrateTemple(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });

    // Ensure this group Id exists (if not, it'll throw a 404 error)
    const results = await groupService.importTempleGroup(id);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /groups/migrate/cml/:id
async function migrateCML(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });

    // Ensure this group Id exists (if not, it'll throw a 404 error)
    const results = await groupService.importCMLGroup(id);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

export {
  search,
  create,
  edit,
  remove,
  changeRole,
  updateAll,
  details,
  monthlyTop,
  gained,
  achievements,
  records,
  hiscores,
  nameChanges,
  statistics,
  competitions,
  listMembers,
  addMembers,
  removeMembers,
  migrateTemple,
  migrateCML,
  resetGroupCode,
  verifyGroup
};
