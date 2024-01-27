import { Request } from 'express';
import { ForbiddenError } from '../../errors';
import * as adminGuard from '../../guards/admin.guard';
import * as verificationGuard from '../../guards/verification.guard';
import { getNumber, getEnum, getString, getDate } from '../../util/validation';
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
async function details(req: Request): Promise<ControllerResponse> {
  const result = await competitionServices.fetchCompetitionDetails({
    id: getNumber(req.params.id),
    metric: getEnum(req.query.metric)
  });

  return { statusCode: 200, response: result };
}

// GET /competitions/:id/csv
async function detailsCSV(req: Request): Promise<ControllerResponse> {
  const result = await competitionServices.fetchCompetitionCSV({
    id: getNumber(req.params.id),
    metric: getEnum(req.query.metric),
    table: getEnum(req.query.table),
    teamName: getString(req.query.teamName)
  });

  return { statusCode: 200, response: result };
}

// GET /competitions/:id/top-history
async function topHistory(req: Request): Promise<ControllerResponse> {
  const result = await competitionServices.fetchCompetitionTop5Progress({
    id: getNumber(req.params.id),
    metric: getEnum(req.query.metric)
  });

  return { statusCode: 200, response: result };
}

// POST /competitions
async function create(req: Request): Promise<ControllerResponse> {
  const result = await competitionServices.createCompetition({
    title: getString(req.body.title),
    metric: getEnum(req.body.metric),
    startsAt: getDate(req.body.startsAt),
    endsAt: getDate(req.body.endsAt),
    participants: req.body.participants,
    teams: req.body.teams,
    groupId: req.body.groupId,
    groupVerificationCode: req.body.groupVerificationCode
  });

  return { statusCode: 201, response: result };
}

// PUT /competitions/:id
async function edit(req: Request): Promise<ControllerResponse> {
  const isVerifiedCode = await verificationGuard.verifyCompetitionCode(req);

  if (!isVerifiedCode) {
    throw new ForbiddenError('Incorrect verification code.');
  }

  const result = await competitionServices.editCompetition({
    id: getNumber(req.params.id),
    title: getString(req.body.title),
    metric: getEnum(req.body.metric),
    startsAt: getDate(req.body.startsAt),
    endsAt: getDate(req.body.endsAt),
    participants: req.body.participants,
    teams: req.body.teams
  });

  return { statusCode: 200, response: result };
}

// DELETE /competitions/:id
async function remove(req: Request): Promise<ControllerResponse> {
  if (!('adminPassword' in req.body) || !adminGuard.checkAdminPermissions(req)) {
    const isVerifiedCode = await verificationGuard.verifyCompetitionCode(req);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }
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

// POST /competitions/:id/participants
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

// DELETE /competitions/:id/participants
async function removeParticipants(req: Request): Promise<ControllerResponse> {
  if (!('adminPassword' in req.body) || !adminGuard.checkAdminPermissions(req)) {
    const isVerifiedCode = await verificationGuard.verifyCompetitionCode(req);

    if (!isVerifiedCode) {
      throw new ForbiddenError('Incorrect verification code.');
    }
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

// POST /competitions/:id/teams
async function addTeams(req: Request): Promise<ControllerResponse> {
  const isVerifiedCode = await verificationGuard.verifyCompetitionCode(req);

  if (!isVerifiedCode) {
    throw new ForbiddenError('Incorrect verification code.');
  }

  const result = await competitionServices.addTeams({
    id: getNumber(req.params.id),
    teams: req.body.teams
  });

  return {
    statusCode: 200,
    response: { count: result.count, message: `Successfully added ${result.count} participants.` }
  };
}

// DELETE /competitions/:id/teams
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

  return { statusCode: 400, response: { message: 'Tracking has been disabled.' } };
}

export {
  search,
  details,
  detailsCSV,
  topHistory,
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
