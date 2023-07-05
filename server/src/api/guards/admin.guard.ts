import { Request } from 'express';
import env from '../../env';
import { BadRequestError } from '../errors';

function checkAdminPermissions(req: Request) {
  const { adminPassword } = req.body;

  if (!adminPassword) {
    throw new BadRequestError("Required parameter 'adminPassword' is undefined.");
  }

  return String(adminPassword) === env.ADMIN_PASSWORD;
}

export { checkAdminPermissions };
