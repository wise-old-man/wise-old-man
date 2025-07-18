import { isErrored } from '@attio/fetchable';
import { NextFunction, Request, Response } from 'express';
import prisma from '../../prisma';
import * as cryptService from '../../services/crypt.service';
import logger from '../../services/logging.service';
import { buildCompoundRedisKey, redisClient } from '../../services/redis.service';
import { BadRequestError, ForbiddenError, NotFoundError, ServerError } from '../errors';
import { submitNameChange } from '../modules/name-changes/services/SubmitNameChangeService';

export async function detectRuneLiteNameChange(req: unknown, res: Response, next: NextFunction) {
  if (!req) {
    return next();
  }

  const userAgent = res.locals.userAgent;

  const { accountHash } = (req as Request).body;
  const { username } = (req as Request).params;

  if ((userAgent !== 'RuneLite' && userAgent !== 'WiseOldMan RuneLite Plugin') || !accountHash) {
    return next();
  }

  // RuneLite requests include an "accountHash" body param that serves as a unique ID per OSRS account.
  // If this ID is linked to a different username than before, that means that account has changed
  // their name and we should automatically submit a name change for it.

  const storedUsername = await redisClient.get(buildCompoundRedisKey('hash', accountHash));

  await redisClient.set(buildCompoundRedisKey('hash', accountHash), username);

  // Also write to this key, so that we can slowly migrate to a new naming convention
  // In the future, we can remove the version above, and move all reads to this new version
  await redisClient.set(buildCompoundRedisKey('runelite_hash', accountHash), username);

  if (storedUsername && storedUsername !== username) {
    try {
      await submitNameChange(storedUsername, username);

      // Interrupt the player update by forwarding an error.
      // This prevent a race condition where the player is updated during a name change's data transfer.
      return next(new ServerError('Failed to update: Name change detected.'));
    } catch (error) {
      logger.error('Failed to auto-submit name changed from account hash.', error);
    }
  }

  next();
}

export function checkAdminPermission(req: unknown, _res: Response, next: NextFunction) {
  const { adminPassword } = (req as Request).body;

  if (!adminPassword) {
    return next(new BadRequestError("Required parameter 'adminPassword' is undefined."));
  }

  if (String(adminPassword) !== process.env.ADMIN_PASSWORD) {
    return next(new ForbiddenError('Incorrect admin password.'));
  }

  next();
}

export async function checkCompetitionVerificationCode(req: unknown, _res: Response, next: NextFunction) {
  const { id } = (req as Request).params;
  const { verificationCode, adminPassword } = (req as Request).body;

  // Override verification code checks for admins
  if (adminPassword && String(adminPassword) === process.env.ADMIN_PASSWORD) {
    return next();
  }

  if (!id) {
    return next(new BadRequestError("Parameter 'id' is required."));
  }

  if (!verificationCode) {
    return next(new BadRequestError("Parameter 'verificationCode' is required."));
  }

  const competition = await prisma.competition.findFirst({
    where: { id: Number(id) },
    select: { verificationHash: true, group: { select: { verificationHash: true } } }
  });

  if (!competition) {
    return next(new NotFoundError('Competition not found.'));
  }

  // If it is a group competition, use the group's code to verify instead
  const hash = competition.group ? competition.group.verificationHash : competition.verificationHash;

  const verificationResult = await cryptService.verifyCode(hash, verificationCode);

  if (isErrored(verificationResult)) {
    return next(new ForbiddenError('Incorrect verification code.'));
  }

  next();
}

export async function checkGroupVerificationCode(req: unknown, _res: Response, next: NextFunction) {
  const { id } = (req as Request).params;
  const { verificationCode, adminPassword } = (req as Request).body;

  // Override verification code checks for admins
  if (adminPassword && String(adminPassword) === process.env.ADMIN_PASSWORD) {
    return next();
  }

  if (!id) {
    return next(new BadRequestError("Parameter 'id' is required."));
  }

  if (!verificationCode) {
    return next(new BadRequestError("Parameter 'verificationCode' is required."));
  }

  const group = await prisma.group.findFirst({
    where: { id: Number(id) },
    select: { verificationHash: true }
  });

  if (!group) {
    return next(new NotFoundError('Group not found.'));
  }

  const verificationResult = await cryptService.verifyCode(group.verificationHash, String(verificationCode));

  if (isErrored(verificationResult)) {
    return next(new ForbiddenError('Incorrect verification code.'));
  }

  next();
}
