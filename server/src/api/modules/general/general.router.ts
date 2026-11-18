import { isErrored } from '@attio/fetchable';
import { Router } from 'express';
import { z } from 'zod';
import { assertNever } from '../../../utils/assert-never.util';
import { NotFoundErrorZ } from '../../errors';
import { checkAdminPermission } from '../../util/middlewares';
import { executeRequest, validateRequest } from '../../util/routing';
import { getDateSchema } from '../../util/validation';
import { allowUserActions } from './services/AllowUserActionsService';
import { blockUserActions } from './services/BlockUserActionsService';
import { createAPIKey } from './services/CreateAPIKeyService';
import { fetchTableCounts } from './services/FetchTableCountsService';
import { findDeveloperAPIKeys } from './services/FindDeveloperAPIKeysService';
import { revokeAPIKey } from './services/RevokeAPIKeyService';
import { updateDeveloperAPIKeys } from './services/UpdateDeveloperAPIKeysService';

const router = Router();

router.post(
  '/api-keys',
  checkAdminPermission,
  validateRequest({
    body: z.object({
      application: z.string(),
      developer: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    const { application, developer } = req.body;
    const key = await createAPIKey(application, developer);

    res.status(201).json(key);
  })
);

router.put(
  '/api-keys/:id/revoke',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      id: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    const result = await revokeAPIKey(req.params.id);

    if (isErrored(result)) {
      switch (result.error.code) {
        case 'API_KEY_NOT_FOUND':
          throw new NotFoundErrorZ(result.error);
        case 'FAILED_TO_REVOKE_API_KEY':
          throw result.error;
        default:
          assertNever(result.error);
      }
    }

    res.status(200).json(result.value);
  })
);

router.get(
  '/api-keys',
  checkAdminPermission,
  validateRequest({
    query: z
      .object({
        developer: z.optional(z.string().min(1)),
        application: z.optional(z.string().min(1)),
        developerDiscordId: z.optional(z.string().regex(/^\d+$/)),
        createdAt: z.optional(getDateSchema('createdAt')),
        master: z.optional(z.enum(['true', 'false'])),
        active: z.optional(z.enum(['true', 'false']))
      })
      .refine(query => Object.values(query).some(value => value !== undefined), {
        message: 'Provide at least one API key filter.'
      })
  }),
  executeRequest(async (req, res) => {
    const { developer, application, developerDiscordId, createdAt, master, active } = req.query;
    const keys = await findDeveloperAPIKeys({
      developer,
      application,
      developerDiscordId,
      createdAt,
      master: master === undefined ? undefined : master === 'true',
      active: active === undefined ? undefined : active === 'true'
    });
    res.status(200).json(keys);
  })
);

router.put(
  '/api-keys/developer/:developer',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      developer: z.string().min(1)
    }),
    body: z
      .object({
        developerDiscordId: z.optional(z.string().regex(/^\d+$/)),
        createdAt: z.optional(getDateSchema('createdAt').nullable())
      })
      .refine(body => body.developerDiscordId !== undefined || body.createdAt !== undefined, {
        message: 'Provide developerDiscordId or createdAt.'
      })
  }),
  executeRequest(async (req, res) => {
    const { developerDiscordId, createdAt } = req.body;
    const result = await updateDeveloperAPIKeys(req.params.developer, { developerDiscordId, createdAt });

    if (result.updatedCount === 0) {
      throw new NotFoundErrorZ({ code: 'API_KEY_NOT_FOUND' });
    }

    res.status(200).json(result);
  })
);

router.get(
  '/stats',
  executeRequest(async (_, res) => {
    const stats = await fetchTableCounts();
    res.status(200).json(stats);
  })
);

router.post(
  '/block-actions',
  checkAdminPermission,
  validateRequest({
    body: z.object({
      ipHash: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    await blockUserActions(req.body.ipHash);
    res.status(200).json(true);
  })
);

router.post(
  '/allow-actions',
  checkAdminPermission,
  validateRequest({
    body: z.object({
      ipHash: z.string()
    })
  }),
  executeRequest(async (req, res) => {
    await allowUserActions(req.body.ipHash);
    res.status(200).json(true);
  })
);

export default router;
