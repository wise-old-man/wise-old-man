import { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';
import { ForbiddenError } from '../../errors';
import * as adminGuard from '../../guards/admin.guard';
import * as verificationGuard from '../../guards/verification.guard';
import * as service from '../../services/internal/competition.service';
import { extractDate, extractNumber, extractString, extractStrings } from '../../util/http';
import { getNumber, getEnum, getString } from '../../util/validation';
import { ControllerResponse } from '../../util/routing';
import * as competitionServices from './competition.services';

// GET /competitions
async function search(req: Request): Promise<ControllerResponse> {
  const results = await competitionServices.searchCompetitions({
    title: getString(req.query.title),
    status: getEnum(req.query.status),
    metric: getEnum(req.query.metric),
    type: getEnum(req.query.type),
    limit: getNumber(req.query.limit),
    offset: getNumber(req.query.offset)
  });

  return { statusCode: 200, response: results };
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
    const isVerifiedCode = await verificationGuard.legacy_verifyCompetitionCode(
      competition,
      verificationCode
    );

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
async function remove(req: Request): Promise<ControllerResponse> {
  const isVerifiedCode = await verificationGuard.verifyCompetitionCode(req);

  if (!isVerifiedCode) {
    throw new ForbiddenError('Incorrect verification code.');
  }

  const deletedCompetition = await competitionServices.deleteCompetition({
    id: getNumber(req.params.id)
  });

  return {
    statusCode: 200,
    response: { message: `Successfully deleted competition: ${deletedCompetition.title}` }
  };
}

// PUT /competitions/:id/reset-code
async function resetVerificationCode(req: Request): Promise<ControllerResponse> {
  if (!adminGuard.checkAdminPermissions(req)) {
    throw new ForbiddenError('Incorrect admin password.');
  }

  const result = await competitionServices.resetCompetitionCode({
    id: getNumber(req.params.id)
  });

  return { statusCode: 200, response: result };
}

// POST /competitions/:id/add-participants
async function addParticipants(req: Request): Promise<ControllerResponse> {
  const isVerifiedCode = await verificationGuard.verifyCompetitionCode(req);

  if (!isVerifiedCode) {
    throw new ForbiddenError('Incorrect verification code.');
  }

  const result = await competitionServices.addParticipants({
    id: getNumber(req.params.id),
    participants: req.body.participants
  });

  return {
    statusCode: 200,
    response: { count: result.count, message: `Successfully added ${result.count} participants.` }
  };
}

// POST /competitions/:id/remove-participants
async function removeParticipants(req: Request): Promise<ControllerResponse> {
  const isVerifiedCode = await verificationGuard.verifyCompetitionCode(req);

  if (!isVerifiedCode) {
    throw new ForbiddenError('Incorrect verification code.');
  }

  const result = await competitionServices.removeParticipants({
    id: getNumber(req.params.id),
    participants: req.body.participants
  });

  return {
    statusCode: 200,
    response: { count: result.count, message: `Successfully removed ${result.count} participants.` }
  };
}

// POST /competitions/:id/add-teams
async function addTeams(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const verificationCode = extractString(req.body, { key: 'verificationCode', required: true });
    const teams = req.body.teams;

    const competition = await service.resolve(id, { includeHash: true });
    const isVerifiedCode = await verificationGuard.legacy_verifyCompetitionCode(
      competition,
      verificationCode
    );

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
async function removeTeams(req: Request): Promise<ControllerResponse> {
  const isVerifiedCode = await verificationGuard.verifyCompetitionCode(req);

  if (!isVerifiedCode) {
    throw new ForbiddenError('Incorrect verification code.');
  }

  const result = await competitionServices.removeTeams({
    id: getNumber(req.params.id),
    teamNames: req.body.teamNames
  });

  return {
    statusCode: 200,
    response: { count: result.count, message: `Successfully removed ${result.count} participants.` }
  };
}

// POST /competitions/:id/update-all
async function updateAllParticipants(req: Request): Promise<ControllerResponse> {
  const isVerifiedCode = await verificationGuard.verifyCompetitionCode(req);

  if (!isVerifiedCode) {
    throw new ForbiddenError('Incorrect verification code.');
  }

  const { outdatedCount, cooldownDuration } = await competitionServices.updateAllParticipants({
    competitionId: getNumber(req.params.id)
  });

  const message = `${outdatedCount} outdated (updated > ${cooldownDuration}h ago) players are being updated. This can take up to a few minutes.`;

  return { statusCode: 200, response: { message } };
}

export {
  search,
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
