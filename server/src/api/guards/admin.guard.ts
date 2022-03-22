import { Request } from 'express';
import env from '../../env';
import { BadRequestError } from '../errors';

function checkAdminPermissions(req: Request) {
  const passwordInput = req?.body?.adminPassword;

  if (!passwordInput) {
    throw new BadRequestError("Required parameter 'adminPassword' is undefined.");
  }

  return String(passwordInput) === env.ADMIN_PASSWORD;
}

export { checkAdminPermissions };
