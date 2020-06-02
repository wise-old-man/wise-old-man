import * as service from './group.service';
import * as pagination from '../../util/pagination';
import { add } from '../../jobs';

async function listGroups(req, res, next) {
  try {
    const { name, playerId, limit, offset } = req.query;
    const paginationConfig = pagination.getPaginationConfig(limit, offset);

    if (playerId) {
      const results = await service.findForPlayer(playerId, paginationConfig);
      res.json(results);
    } else {
      const results = await service.list(name, paginationConfig);
      res.json(results);
    }
  } catch (e) {
    next(e);
  }
}

async function viewGroup(req, res, next) {
  try {
    const { id } = req.params;

    const group = await service.view(id);
    res.json(group);
  } catch (e) {
    next(e);
  }
}

async function monthlyTop(req, res, next) {
  try {
    const { id } = req.params;

    const topPlayer = await service.getMonthlyTopPlayer(id);
    res.json(topPlayer);
  } catch (e) {
    next(e);
  }
}

async function leaderboard(req, res, next) {
  try {
    const { id } = req.params;
    const { metric, period } = req.query;

    const results = await service.getLeaderboard(id, period, metric);

    res.status(200).json(results);
  } catch (e) {
    next(e);
  }
}

async function listMembers(req, res, next) {
  try {
    const { id } = req.params;

    const membersList = await service.getMembersList(id);
    res.json(membersList);
  } catch (e) {
    next(e);
  }
}

async function createGroup(req, res, next) {
  try {
    const { name, clanChat, members } = req.body;

    const group = await service.create(name, clanChat, members);
    res.status(201).json(group);
  } catch (e) {
    next(e);
  }
}

async function editGroup(req, res, next) {
  try {
    const { id } = req.params;
    const { name, clanChat, members, verificationCode } = req.body;

    const group = await service.edit(id, name, clanChat, verificationCode, members);
    res.json(group);
  } catch (e) {
    next(e);
  }
}

async function deleteGroup(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationCode } = req.body;

    const groupName = await service.destroy(id, verificationCode);
    res.json({ message: `Successfully deleted group '${groupName}'. (id: ${id})` });
  } catch (e) {
    next(e);
  }
}

async function addMembers(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationCode, members } = req.body;

    const result = await service.addMembers(id, verificationCode, members);
    res.json({ members: result });
  } catch (e) {
    next(e);
  }
}

async function removeMembers(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationCode, members } = req.body;

    const count = await service.removeMembers(id, verificationCode, members);
    res.json({ message: `Successfully removed ${count} members from group of id: ${id}` });
  } catch (e) {
    next(e);
  }
}

async function changeRole(req, res, next) {
  try {
    const { id } = req.params;
    const { username, role, verificationCode } = req.body;

    const result = await service.changeRole(id, username, role, verificationCode);
    res.json(result);
  } catch (e) {
    next(e);
  }
}
async function updateAllMembers(req, res, next) {
  try {
    const { id } = req.params;

    const members = await service.updateAllMembers(id, player => {
      // Attempt this 5 times per player, waiting 65 seconds in between
      add('UpdatePlayer', { player }, { attempts: 5, backoff: 65000 });
    });

    const message = `${members.length} players are being updated. This can take up to a few minutes.`;
    res.json({ message });
  } catch (e) {
    next(e);
  }
}

export {
  listGroups,
  viewGroup,
  monthlyTop,
  leaderboard,
  listMembers,
  createGroup,
  editGroup,
  deleteGroup,
  addMembers,
  removeMembers,
  changeRole,
  updateAllMembers
}
