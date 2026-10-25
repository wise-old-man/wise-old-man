import { isErrored } from '@attio/fetchable';
import { Router } from 'express';
import { z } from 'zod';
import { assertNever } from '../../../utils/assert-never.util';
import { NotFoundErrorZ } from '../../errors';
import { checkAdminPermission } from '../../util/middlewares';
import { executeRequest, validateRequest } from '../../util/routing';
import { allowUserActions } from './services/AllowUserActionsService';
import { blockUserActions } from './services/BlockUserActionsService';
import { createAPIKey } from './services/CreateAPIKeyService';
import { fetchTableCounts } from './services/FetchTableCountsService';
import { revokeAPIKey } from './services/RevokeAPIKeyService';

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
