import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../../errors';
import { isValidUsername, standardize } from '../players/player.service';

async function submit(req: Request, _: Response, next: NextFunction) {
  const { oldName, newName } = req.body;

  try {
    if (!oldName) throw new BadRequestError('Invalid old name. (Undefined)');
    if (!newName) throw new BadRequestError('Invalid new name. (Undefined)');
    if (!isValidUsername(oldName)) throw new BadRequestError('Invalid old name.');
    if (!isValidUsername(newName)) throw new BadRequestError('Invalid new name.');

    // Standardize names to "username" sanitized format.
    if (standardize(oldName) === standardize(newName))
      throw new BadRequestError('Old and new names must be different.');

    next();
  } catch (e) {
    next(e);
  }
}

async function refresh(req: Request, _: Response, next: NextFunction) {
  const { id } = req.params;

  try {
    if (!id) throw new BadRequestError('Invalid name change id. (Undefined)');
    if (isNaN(id as any)) throw new BadRequestError('Invalid name change id. (Must be an integer)');

    next();
  } catch (e) {
    next(e);
  }
}

async function deny(req: Request, _: Response, next: NextFunction) {
  const { id } = req.params;
  const { adminPassword } = req.body;

  try {
    if (!id) throw new BadRequestError('Invalid name change id. (Undefined)');
    if (!adminPassword) throw new BadRequestError('Invalid admin password. (Undefined)');
    if (adminPassword.length === 0) throw new BadRequestError('Invalid admin password. (Empty)');
    if (isNaN(id as any)) throw new BadRequestError('Invalid name change id. Must be an integer.');

    next();
  } catch (e) {
    next(e);
  }
}

export { submit, refresh, deny };
