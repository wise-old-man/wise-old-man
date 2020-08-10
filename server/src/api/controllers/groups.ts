import * as competitionService from 'api/services/internal/competitions';
import * as groupService from 'api/services/internal/groups';
import jobs from '../jobs';
import { getPaginationConfig } from '../util/pagination';

// GET /groups
async function index(req, res, next) {
  try {
    const { name, limit, offset } = req.query;
    const paginationConfig = getPaginationConfig(limit, offset);

    /*
    if (playerId) {
      const results = await groupService.findForPlayer(playerId, paginationConfig);
      res.json(results);
    } else {
      */
    const results = await groupService.getList(name, paginationConfig);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// POST /groups
async function create(req, res, next) {
  try {
    const { name, clanChat, members } = req.body;

    // Create a new group, with the given params
    const group = await groupService.create(name, clanChat, members);

    res.status(201).json(group);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id
async function details(req, res, next) {
  try {
    const { id } = req.params;
    const group = await groupService.getDetails(id);

    res.json(group);
  } catch (e) {
    next(e);
  }
}

// PUT /groups/:id
async function edit(req, res, next) {
  try {
    const { id } = req.params;
    const { name, clanChat, members, verificationCode } = req.body;

    // Edit the group with the given params (these will override any existing properties)
    const group = await groupService.edit(id, name, clanChat, verificationCode, members);

    res.json(group);
  } catch (e) {
    next(e);
  }
}

// DELETE /groups/:id
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationCode } = req.body;

    const groupName = await groupService.destroy(id, verificationCode);
    const message = `Successfully deleted group '${groupName}'. (id: ${id})`;

    res.json({ message });
  } catch (e) {
    next(e);
  }
}

// PUT /groups/:id/change-role
async function changeRole(req, res, next) {
  try {
    const { id } = req.params;
    const { username, role, verificationCode } = req.body;

    const result = await groupService.changeRole(id, username, role, verificationCode);

    res.json(result);
  } catch (e) {
    next(e);
  }
}

// POST /groups/:id/update-all
async function updateAll(req, res, next) {
  try {
    const { id } = req.params;

    const members = await groupService.updateAllMembers(id, player => {
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
async function addMembers(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationCode, members } = req.body;

    const result = await groupService.addMembers(id, verificationCode, members);

    res.json({ members: result });
  } catch (e) {
    next(e);
  }
}

// POST /groups/:id/remove-members
async function removeMembers(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationCode, members } = req.body;

    const count = await groupService.removeMembers(id, verificationCode, members);
    const message = `Successfully removed ${count} members from group of id: ${id}`;

    res.json({ message });
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/members
async function listMembers(req, res, next) {
  try {
    const { id } = req.params;

    const membersList = await groupService.getMembersList(id);
    res.json(membersList);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/competitions
async function competitions(req, res, next) {
  try {
    const { id } = req.params;

    // Get all group competitions (by group id)
    const groupCompetitions = await competitionService.getGroupCompetitions(id);

    res.json(groupCompetitions);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/monthly-top
async function monthlyTop(req, res, next) {
  try {
    const { id } = req.params;

    // Get the member with the most monthly overall gains
    const topPlayer = await groupService.getMonthlyTopPlayer(id);

    res.json(topPlayer);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/gained
async function gained(req, res, next) {
  try {
    const { id } = req.params;
    const { metric, period, limit, offset } = req.query;
    const paginationConfig = getPaginationConfig(limit, offset);

    const results = await groupService.getGained(id, period, metric, paginationConfig);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/achievements
async function achievements(req, res, next) {
  try {
    const { id } = req.params;
    const { limit, offset } = req.query;
    const paginationConfig = getPaginationConfig(limit, offset);

    const results = await groupService.getAchievements(id, paginationConfig);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/records
async function records(req, res, next) {
  try {
    const { id } = req.params;
    const { metric, period, limit, offset } = req.query;
    const paginationConfig = getPaginationConfig(limit, offset);

    const results = await groupService.getRecords(id, metric, period, paginationConfig);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/hiscores
async function hiscores(req, res, next) {
  try {
    const { id } = req.params;
    const { metric, limit, offset } = req.query;
    const paginationConfig = getPaginationConfig(limit, offset);

    const results = await groupService.getHiscores(id, metric, paginationConfig);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /groups/:id/statistics
async function statistics(req, res, next) {
  try {
    const { id } = req.params;

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
  statistics,
  competitions,
  listMembers,
  addMembers,
  removeMembers
};
