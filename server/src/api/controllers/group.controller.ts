import { NextFunction, Request, Response } from 'express';
import { Player } from '../../database/models';
import { BadRequestError, ForbiddenError } from '../errors';
import * as guard from '../guards/group.guards';
import jobs from '../jobs';
import * as competitionService from '../services/internal/competition.service';
import * as groupService from '../services/internal/group.service';
import { extractNumber, extractString, extractStrings } from '../util/http';
import { getPaginationConfig } from '../util/pagination';

// GET /groups
async function index(req: Request, res: Response, next: NextFunction) {
  try {
    // Search filter query
    const name = extractString(req.query, { key: 'name' });
    // Pagination query
    const limit = extractNumber(req.query, { key: 'limit' });
    const offset = extractNumber(req.query, { key: 'offset' });

    const paginationConfig = getPaginationConfig(limit, offset);
    const results = await groupService.getList(name, paginationConfig);

    res.json(results);
  } catch (e) {
    next(e);
  }
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
    const isVerifiedCode = await guard.verifyGroupCode(group, verificationCode);

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
    const isVerifiedCode = await guard.verifyGroupCode(group, verificationCode);

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

// PUT /groups/:id/change-role
async function changeRole(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const username = extractString(req.body, { key: 'username', required: true });
    const role = extractString(req.body, { key: 'role', required: true });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });

    const group = await groupService.resolve(id, true);
    const isVerifiedCode = await guard.verifyGroupCode(group, verificationCode);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }

    const [player, newRole] = await groupService.changeRole(group, { username, role });

    res.json({ ...player.toJSON(), role: newRole });
  } catch (e) {
    next(e);
  }
}

// POST /groups/:id/update-all
async function updateAll(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });

    const group = await groupService.resolve(id);
    const members = await groupService.updateAllMembers(group, (player: Player) => {
      // Attempt this 3 times per player, waiting 65 seconds in between
      jobs.add('UpdatePlayer', { username: player.username }, { attempts: 3, backoff: 65000 });
    });

    const message = `${members.length} outdated (updated < 60 mins ago) players are being updated. This can take up to a few minutes.`;

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
    const isVerifiedCode = await guard.verifyGroupCode(group, verificationCode);

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
    const isVerifiedCode = await guard.verifyGroupCode(group, verificationCode);

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
    const topPlayer = await groupService.getMonthlyTopPlayer(id);

    res.json(topPlayer);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/gained
async function gained(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const metric = extractString(req.query, { key: 'metric', required: true });
    const period = extractString(req.query, { key: 'period', required: true });
    const limit = extractNumber(req.query, { key: 'limit' });
    const offset = extractNumber(req.query, { key: 'offset' });

    // Ensure this group Id exists (if not, it'll throw a 404 error)
    await groupService.resolve(id);

    const paginationConfig = getPaginationConfig(limit, offset);
    const results = await groupService.getGained(id, period, metric, paginationConfig);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/achievements
async function achievements(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const limit = extractNumber(req.query, { key: 'limit' });
    const offset = extractNumber(req.query, { key: 'offset' });

    // Ensure this group Id exists (if not, it'll throw a 404 error)
    await groupService.resolve(id);

    const paginationConfig = getPaginationConfig(limit, offset);
    const results = await groupService.getAchievements(id, paginationConfig);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/records
async function records(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const metric = extractString(req.query, { key: 'metric', required: true });
    const period = extractString(req.query, { key: 'period', required: true });
    const limit = extractNumber(req.query, { key: 'limit' });
    const offset = extractNumber(req.query, { key: 'offset' });

    // Ensure this group Id exists (if not, it'll throw a 404 error)
    await groupService.resolve(id);

    const paginationConfig = getPaginationConfig(limit, offset);
    const results = await groupService.getRecords(id, metric, period, paginationConfig);

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
    const id = extractNumber(req.params, { key: 'id', required: true });
    const limit = extractNumber(req.query, { key: 'limit' });
    const offset = extractNumber(req.query, { key: 'offset' });

    // Ensure this group Id exists (if not, it'll throw a 404 error)
    await groupService.resolve(id);

    const paginationConfig = getPaginationConfig(limit, offset);
    const results = await groupService.getNameChanges(id, paginationConfig);

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

export {
  index,
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
  removeMembers
};
