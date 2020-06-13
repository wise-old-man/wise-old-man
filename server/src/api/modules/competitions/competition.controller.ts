import * as service from './competition.service';
import * as pagination from '../../util/pagination';
import { addJob } from '../../jobs';

async function listCompetitions(req, res, next) {
  try {
    const { title, status, metric, playerId, groupId, limit, offset } = req.query;
    const paginationConfig = pagination.getPaginationConfig(limit, offset);

    if (groupId) {
      const results = await service.findForGroup(groupId, paginationConfig);
      res.json(results);
    } else if (playerId) {
      const results = await service.findForPlayer(playerId, paginationConfig);
      res.json(results);
    } else {
      const results = await service.list(title, status, metric, paginationConfig);
      res.json(results);
    }
  } catch (e) {
    next(e);
  }
}

async function viewCompetition(req, res, next) {
  try {
    const { id } = req.params;

    const competition = await service.view(id);
    res.json(competition);
  } catch (e) {
    next(e);
  }
}

async function createCompetition(req, res, next) {
  try {
    const { title, metric, startsAt, endsAt, participants, groupId, groupVerificationCode } = req.body;

    const competition = await service.create(
      title,
      metric,
      startsAt,
      endsAt,
      groupId,
      groupVerificationCode,
      participants
    );

    res.status(201).json(competition);
  } catch (e) {
    next(e);
  }
}

async function editCompetition(req, res, next) {
  try {
    const { id } = req.params;
    const { title, metric, startsAt, endsAt, participants, verificationCode } = req.body;

    const competition = await service.edit(
      id,
      title,
      metric,
      startsAt,
      endsAt,
      participants,
      verificationCode
    );

    res.json(competition);
  } catch (e) {
    next(e);
  }
}

async function deleteCompetition(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationCode } = req.body;

    const competitionName = await service.destroy(id, verificationCode);
    res.json({ message: `Successfully deleted competition '${competitionName}' (id: ${id})` });
  } catch (e) {
    next(e);
  }
}

async function addParticipants(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationCode, participants } = req.body;

    const result = await service.addParticipants(id, verificationCode, participants);
    res.json({ newParticipants: result });
  } catch (e) {
    next(e);
  }
}

async function removeParticipants(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationCode, participants } = req.body;

    const count = await service.removeParticipants(id, verificationCode, participants);
    res.json({ message: `Successfully removed ${count} participants from competition of id: ${id}.` });
  } catch (e) {
    next(e);
  }
}

async function updateAllParticipants(req, res, next) {
  try {
    const { id } = req.params;

    const participants = await service.updateAllParticipants(id, player => {
      // Attempt this 5 times per player, waiting 65 seconds in between
      addJob('UpdatePlayer', { player }, { attempts: 5, backoff: 65000 });
    });

    const message = `${participants.length} players are being updated. This can take up to a few minutes.`;
    res.json({ message });
  } catch (e) {
    next(e);
  }
}

export {
  viewCompetition,
  createCompetition,
  editCompetition,
  deleteCompetition,
  listCompetitions,
  addParticipants,
  removeParticipants,
  updateAllParticipants
};
