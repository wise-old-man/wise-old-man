import { Request } from 'express';
import { ForbiddenError } from '../../errors';
import * as adminGuard from '../../guards/admin.guard';
import { getString } from '../../util/validation';
import { ControllerResponse } from '../../util/routing';
import * as generalServices from './general.services';

// POST /api-key
async function createApiKey(req: Request): Promise<ControllerResponse> {
  if (!adminGuard.checkAdminPermissions(req)) {
    throw new ForbiddenError('Incorrect admin password.');
  }

  const key = await generalServices.createAPIKey({
    application: getString(req.body.application),
    developer: getString(req.body.developer)
  });

  return { statusCode: 201, response: key };
}

// GET /stats
async function stats(): Promise<ControllerResponse> {
  const stats = await generalServices.fetchTableCounts();

  return { statusCode: 200, response: stats };
}

export { createApiKey, stats };
