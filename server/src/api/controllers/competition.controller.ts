import { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';
import { ForbiddenError } from '../errors';
import * as guard from '../guards/competition.guards';
import jobs from '../jobs';
import * as service from '../services/internal/competition.service';
import { extractDate, extractNumber, extractString, extractStrings } from '../util/http';
import * as pagination from '../util/pagination';

// GET /competitions
async function index(req: Request, res: Response, next: NextFunction) {
  try {
    // Search filter query
    const title = extractString(req.query, { key: 'title' });
    const status = extractString(req.query, { key: 'status' });
    const metric = extractString(req.query, { key: 'metric' });
    // Pagination query
    const limit = extractNumber(req.query, { key: 'limit' });
    const offset = extractNumber(req.query, { key: 'offset' });

    const filter = { title, status, metric };
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

    const competition = await service.resolve(id, { includeGroup: true });
    const competitionDetails = await service.getDetails(competition);

    res.json(competitionDetails);
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
    const isVerifiedCode = await guard.verifyCompetitionCode(competition, verificationCode);

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
    const isVerifiedCode = await guard.verifyCompetitionCode(competition, verificationCode);

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

// POST /competitions/:id/add-participants
async function addParticipants(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });
    const participants = extractStrings(req.body, { key: 'participants', required: true });

    const competition = await service.resolve(id, { includeHash: true });
    const isVerifiedCode = await guard.verifyCompetitionCode(competition, verificationCode);

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
    const isVerifiedCode = await guard.verifyCompetitionCode(competition, verificationCode);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }

    const count = await service.removeParticipants(competition, participants);
    const message = `Successfully removed ${count} participants from competition of id: ${id}.`;

    res.json({ message });
  } catch (e) {
    next(e);
  }
}

// POST /competitions/:id/update-all
async function updateAllParticipants(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });

    const competition = await service.resolve(id);
    const participants = await service.updateAll(competition, false, player => {
      // Attempt this 3 times per player, waiting 65 seconds in between
      jobs.add('UpdatePlayer', { username: player.username }, { attempts: 3, backoff: 65000 });
    });

    const message = `${participants.length} outdated (updated < 60 mins ago) players are being updated. This can take up to a few minutes.`;

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
