const { BadRequestError } = require('../../errors');
const service = require('./competition.service');
const jobs = require('../../jobs');

async function listCompetitions(req, res, next) {
  try {
    const { title, status, metric, playerId } = req.query;

    const results = playerId
      ? await service.findForPlayer(playerId)
      : await service.list(title, status, metric);

    res.json(results);
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
    const { title, metric, startsAt, endsAt, participants, groupId } = req.body;

    const competition = await service.create(title, metric, startsAt, endsAt, groupId, participants);
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
    res.json({ message: `Successfully removed ${count} participants from competition of id: ${id}` });
  } catch (e) {
    next(e);
  }
}

async function updateAllParticipants(req, res, next) {
  try {
    const { id } = req.params;
    const participants = await service.getParticipants(id);

    if (!participants || participants.length === 0) {
      throw new BadRequestError('This competition has no participants.');
    }

    participants.forEach(player => {
      // Attempt this 5 times per player, waiting 65 seconds in between
      jobs.add('UpdatePlayer', { player }, { attempts: 5, backoff: 65000 });
    });

    const message = `${participants.length} players are being updated. This can take up to a few minutes.`;
    res.json({ message });
  } catch (e) {
    next(e);
  }
}

exports.viewCompetition = viewCompetition;
exports.createCompetition = createCompetition;
exports.editCompetition = editCompetition;
exports.deleteCompetition = deleteCompetition;
exports.listCompetitions = listCompetitions;
exports.addParticipants = addParticipants;
exports.removeParticipants = removeParticipants;
exports.updateAllParticipants = updateAllParticipants;
