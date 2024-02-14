import { NextFunction, Request, Response } from 'express';
import env from '../../env';
import { isMetric, parseMetricAbbreviation } from '../../utils';
import { BadRequestError, ForbiddenError, ServerError } from '../errors';
import redisService from '../services/external/redis.service';
import logger from '../util/logging';
import { submitNameChange } from '../modules/name-changes/services/SubmitNameChangeService';

export function metricAbbreviation(req: Request, _res: Response, next: NextFunction) {
  if (!req) {
    return next();
  }

  // Swap any metric abbreviations in the request body
  if (req.body && req.body.metric) {
    const metric = req.body.metric.toLowerCase();

    if (!isMetric(metric)) {
      req.body.metric = parseMetricAbbreviation(metric) || metric;
    }
  }

  // Swap any metric abbreviations in the request query
  if (req.query && req.query.metric) {
    const metric = String(req.query.metric).toLowerCase();

    if (!isMetric(metric)) {
      req.query.metric = parseMetricAbbreviation(metric) || metric;
    }
  }

  next();
}

export async function detectRuneLiteNameChange(req: Request, res: Response, next: NextFunction) {
  if (!req) {
    return next();
  }

  const userAgent = res.locals.userAgent;

  const { accountHash } = req.body;
  const { username } = req.params;

  if ((userAgent !== 'RuneLite' && userAgent !== 'WiseOldMan RuneLite Plugin') || !accountHash) {
    return next();
  }

  // RuneLite requests include an "accountHash" body param that serves as a unique ID per OSRS account.
  // If this ID is linked to a different username than before, that means that account has changed
  // their name and we should automatically submit a name change for it.

  const storedUsername = await redisService.getValue('hash', accountHash);

  await redisService.setValue('hash', accountHash, username);

  if (storedUsername && storedUsername !== username) {
    logger.debug('Detected name change from account hash, auto-submitting name change.', {
      oldName: storedUsername,
      newName: username
    });

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
    next(new BadRequestError("Required parameter 'adminPassword' is undefined."));
  } else if (String(adminPassword) !== env.ADMIN_PASSWORD) {
    next(new ForbiddenError('Incorrect admin password.'));
  } else {
    next();
  }
}
