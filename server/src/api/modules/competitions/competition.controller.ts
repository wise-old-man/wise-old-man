import * as service from './competition.service';
import * as pagination from '../../util/pagination';
import { addJob } from '../../jobs';

// GET /competitions
async function index(req, res, next) {
  try {
    const { title, status, metric, limit, offset } = req.query;
    const paginationConfig = pagination.getPaginationConfig(limit, offset);

    const results = await service.getList(title, status, metric, paginationConfig);
    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /competitions/:id
async function details(req, res, next) {
  try {
    const { id } = req.params;

    const competition = await service.getDetails(id);
    res.json(competition);
  } catch (e) {
    next(e);
  }
}

// POST /competitions
async function create(req, res, next) {
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

// PUT /competitions/:id
async function edit(req, res, next) {
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

// DELETE /competitions/:id
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationCode } = req.body;

    const competitionName = await service.destroy(id, verificationCode);
    const message = `Successfully deleted competition '${competitionName}' (id: ${id})`;

    res.json({ message });
  } catch (e) {
    next(e);
  }
}

// POST /competitions/:id/add-participants
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

// POST /competitions/:id/remove-participants
async function removeParticipants(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationCode, participants } = req.body;

    const count = await service.removeParticipants(id, verificationCode, participants);
    const message = `Successfully removed ${count} participants from competition of id: ${id}.`;

    res.json({ message });
  } catch (e) {
    next(e);
  }
}

// POST /competitions/:id/update-all
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
  index,
  details,
  create,
  edit,
  remove,
  addParticipants,
  removeParticipants,
  updateAllParticipants
};
