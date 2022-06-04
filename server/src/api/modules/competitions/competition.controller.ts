import { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';
import { BadRequestError, ForbiddenError } from '../../errors';
import * as adminGuard from '../../guards/admin.guard';
import * as verificationGuard from '../../guards/verification.guard';
import jobs from '../../jobs';
import * as service from '../../services/internal/competition.service';
import { extractDate, extractNumber, extractString, extractStrings } from '../../util/http';
import * as pagination from '../../util/pagination';

// GET /competitions
async function index(req: Request, res: Response, next: NextFunction) {
  try {
    // Search filter query
    const title = extractString(req.query, { key: 'title' });
    const status = extractString(req.query, { key: 'status' });
    const metric = extractString(req.query, { key: 'metric' });
    const type = extractString(req.query, { key: 'type' });
    // Pagination query
    const limit = extractNumber(req.query, { key: 'limit' });
    const offset = extractNumber(req.query, { key: 'offset' });

    const filter = { title, status, metric, type };
    const paginationConfig = pagination.getPaginationConfig(limit, offset);

    const results = await service.getList(filter, paginationConfig);
    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /competitions/:id
async function details(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const metric = extractString(req.query, { key: 'metric' });

    const competition = await service.resolve(id, { includeGroup: true });
    const competitionDetails = await service.getDetails(competition, metric);

    res.json(competitionDetails);
  } catch (e) {
    next(e);
  }
}

// GET /competitions/:id/csv
async function detailsCSV(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const table = extractString(req.query, { key: 'table', required: true });
    const teamName = extractString(req.query, { key: 'teamName' });
    const metric = extractString(req.query, { key: 'metric' });

    const competition = await service.resolve(id, { includeGroup: true });
    const competitionDetails = await service.getDetails(competition, metric);

    const csv = service.getCSV(competitionDetails, table, teamName);

    res.end(csv);
  } catch (e) {
    next(e);
  }
}

// POST /competitions
async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const title = extractString(req.body, { key: 'title', required: true });
    const metric = extractString(req.body, { key: 'metric', required: true });
    const startsAt = extractDate(req.body, { key: 'startsAt', required: true });
    const endsAt = extractDate(req.body, { key: 'endsAt', required: true });
    const groupId = extractNumber(req.body, { key: 'groupId' });
    const groupVerificationCode = extractString(req.body, { key: 'groupVerificationCode' });
    const participants = extractStrings(req.body, { key: 'participants' });
    const teams = req.body.teams;

    const dto = { title, metric, startsAt, endsAt, groupId, groupVerificationCode, participants, teams };
    const competition = await service.create(dto);

    // Omit some secrets from the response
    const response = omit(
      competition,
      groupId ? ['verificationHash', 'verificationCode'] : ['verificationHash']
    );

    res.status(201).json(response);
  } catch (e) {
    next(e);
  }
}

// PUT /competitions/:id
async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });
    const title = extractString(req.body, { key: 'title' });
    const metric = extractString(req.body, { key: 'metric' });
    const startsAt = extractDate(req.body, { key: 'startsAt' });
    const endsAt = extractDate(req.body, { key: 'endsAt' });
    const participants = extractStrings(req.body, { key: 'participants' });
    const teams = req.body.teams;

    const competition = await service.resolve(id, { includeHash: true });
    const isVerifiedCode = await verificationGuard.verifyCompetitionCode(competition, verificationCode);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }

    const dto = { verificationCode, title, metric, startsAt, endsAt, participants, teams };
    const editedCompetition = await service.edit(competition, dto);

    // Omit the hash from the response
    const response = omit(editedCompetition, ['verificationHash']);

    res.json(response);
  } catch (e) {
    next(e);
  }
}

// DELETE /competitions/:id
async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });

    const competition = await service.resolve(id, { includeHash: true });
    const isVerifiedCode = await verificationGuard.verifyCompetitionCode(competition, verificationCode);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }

    const competitionName = await service.destroy(competition);
    const message = `Successfully deleted competition '${competitionName}' (id: ${id})`;

    res.json({ message });
  } catch (e) {
    next(e);
  }
}

// PUT /competitions/:id/reset-code
async function resetVerificationCode(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });

    if (!adminGuard.checkAdminPermissions(req)) {
      throw new ForbiddenError('Incorrect admin password.');
    }

    const competition = await service.resolve(id, { includeHash: true });

    if (competition.groupId) {
      throw new BadRequestError('Cannot reset verification code for group competition.');
    }

    const newCode = await service.resetVerificationCode(competition);

    res.json({ newCode });
  } catch (e) {
    next(e);
  }
}

// POST /competitions/:id/add-participants
async function addParticipants(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });
    const participants = extractStrings(req.body, { key: 'participants', required: true });

    const competition = await service.resolve(id, { includeHash: true });
    const isVerifiedCode = await verificationGuard.verifyCompetitionCode(competition, verificationCode);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }

    const result = await service.addParticipants(competition, participants);

    res.json({ newParticipants: result });
  } catch (e) {
    next(e);
  }
}

// POST /competitions/:id/remove-participants
async function removeParticipants(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });
    const participants = extractStrings(req.body, { key: 'participants', required: true });

    const competition = await service.resolve(id, { includeHash: true });
    const isVerifiedCode = await verificationGuard.verifyCompetitionCode(competition, verificationCode);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }

    const count = await service.removeParticipants(competition, participants);
    const message = `Successfully removed ${count} participants from "${competition.title}".`;

    res.json({ message });
  } catch (e) {
    next(e);
  }
}

// POST /competitions/:id/add-teams
async function addTeams(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });
    const teams = req.body.teams;

    const competition = await service.resolve(id, { includeHash: true });
    const isVerifiedCode = await verificationGuard.verifyCompetitionCode(competition, verificationCode);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }

    const result = await service.addTeams(competition, teams);

    res.json({ newTeams: result });
  } catch (e) {
    next(e);
  }
}

// POST /competitions/:id/remove-teams
async function removeTeams(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });
    const teamNames = extractStrings(req.body, { key: 'teamNames', required: true });

    const competition = await service.resolve(id, { includeHash: true });
    const isVerifiedCode = await verificationGuard.verifyCompetitionCode(competition, verificationCode);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }

    const count = await service.removeTeams(competition, teamNames);
    const message = `Successfully removed ${count} participants from "${competition.title}".`;

    res.json({ message });
  } catch (e) {
    next(e);
  }
}

// POST /competitions/:id/update-all
async function updateAllParticipants(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });

    const competition = await service.resolve(id, { includeHash: true });
    const isVerifiedCode = await verificationGuard.verifyCompetitionCode(competition, verificationCode);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }

    const result = await service.updateAll(competition, false, ({ username }) => {
      jobs.add('UpdatePlayer', { username, source: 'Competition:UpdateAll' });
    });

    const { participants, cooldownDuration } = result;
    const message = `${participants.length} outdated (updated > ${cooldownDuration}h ago) players are being updated. This can take up to a few minutes.`;

    res.json({ message });
  } catch (e) {
    next(e);
  }
}

export {
  index,
  details,
  detailsCSV,
  create,
  edit,
  remove,
  resetVerificationCode,
  addParticipants,
  removeParticipants,
  addTeams,
  removeTeams,
  updateAllParticipants
};
