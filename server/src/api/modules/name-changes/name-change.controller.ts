import { Request } from 'express';
import { ForbiddenError } from '../../errors';
import * as nameChangeServices from './name-change.services';
import * as playerUtils from '../players/player.utils';
import * as adminGuard from '../../guards/admin.guard';
import { getNumber, getString, getEnum } from '../../util/validation';
import { ControllerResponse } from '../../util/routing';

// GET /names
async function index(req: Request): Promise<ControllerResponse> {
  const results = await nameChangeServices.searchNameChanges({
    username: getString(req.query.username),
    status: getEnum(req.query.status),
    limit: getNumber(req.query.limit),
    offset: getNumber(req.query.offset)
  });

  return { statusCode: 200, response: results };
}

// POST /names
async function submit(req: Request): Promise<ControllerResponse> {
  const result = await nameChangeServices.submitNameChange(req.body);

  return { statusCode: 201, response: result };
}

// POST /names/bulk
async function bulkSubmit(req: Request): Promise<ControllerResponse> {
  const result = await nameChangeServices.bulkSubmitNameChanges(req.body);

  return { statusCode: 201, response: result };
}

// GET /names/:id
async function details(req: Request): Promise<ControllerResponse> {
  const result = await nameChangeServices.fetchNameChangeDetails({
    id: getNumber(req.params.id)
  });

  return { statusCode: 200, response: result };
}

// POST /names/:id/approve
// REQUIRES ADMIN PASSWORD
async function approve(req: Request): Promise<ControllerResponse> {
  if (!adminGuard.checkAdminPermissions(req)) {
    throw new ForbiddenError('Incorrect admin password.');
  }

  const result = await nameChangeServices.approveNameChange({
    id: getNumber(req.params.id)
  });

  return { statusCode: 200, response: result };
}

// POST /names/:id/deny
// REQUIRES ADMIN PASSWORD
async function deny(req: Request): Promise<ControllerResponse> {
  if (!adminGuard.checkAdminPermissions(req)) {
    throw new ForbiddenError('Incorrect admin password.');
  }

  const result = await nameChangeServices.denyNameChange({
    id: getNumber(req.params.id)
  });

  return { statusCode: 200, response: result };
}

// POST /names/:username/clear-history
// REQUIRES ADMIN PASSWORD
async function clearHistory(req: Request): Promise<ControllerResponse> {
  if (!adminGuard.checkAdminPermissions(req)) {
    throw new ForbiddenError('Incorrect admin password.');
  }

  const playerId = await playerUtils.resolvePlayerId(getString(req.params.username));
  const { count } = await nameChangeServices.clearNameChangeHistory({ playerId });

  return {
    statusCode: 200,
    response: { count, message: `Successfully deleted ${count} name changes.` }
  };
}

export { index, submit, bulkSubmit, details, approve, deny, clearHistory };
