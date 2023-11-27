import { Request } from 'express';
import { ForbiddenError } from '../../errors';
import { getNumber, getString } from '../../util/validation';
import { ControllerResponse } from '../../util/routing';
import * as adminGuard from '../../guards/admin.guard';
import { claimPatreonBenefits } from './services/ClaimPatreonBenefitsService';

// PUT /patrons/claim/:discordId
// REQUIRES ADMIN PASSWORD
async function claimBenefits(req: Request): Promise<ControllerResponse> {
  if (!adminGuard.checkAdminPermissions(req)) {
    throw new ForbiddenError('Incorrect admin password.');
  }

  const result = await claimPatreonBenefits({
    discordId: getString(req.params.discordId),
    username: getString(req.body.username),
    groupId: getNumber(req.body.groupId)
  });

  return { statusCode: 200, response: result };
}

export { claimBenefits };
