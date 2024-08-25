import { Router } from 'express';
import { z } from 'zod';
import { checkAdminPermission } from '../../util/middlewares';
import { executeRequest, validateRequest } from '../../util/routing';
import { createAPIKey } from './services/CreateAPIKeyService';
import { fetchTableCounts } from './services/FetchTableCountsService';
import { blockUserActions } from './services/BlockUserActionsService';
import { getRequestIpHash } from 'src/api/util/request';
import { allowUserActions } from './services/AllowUserActionsService';

const router = Router();

router.post(
  '/api-key',
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

router.get(
  '/stats',
  executeRequest(async (_, res) => {
    const stats = await fetchTableCounts();
    res.status(200).json(stats);
  })
);

router.get(
  '/block-actions',
  checkAdminPermission,
  executeRequest(async (req, res) => {
    await blockUserActions(getRequestIpHash(req));
    res.status(200).json(true);
  })
);

router.get(
  '/allow-actions',
  checkAdminPermission,
  executeRequest(async (req, res) => {
    await allowUserActions(getRequestIpHash(req));
    res.status(200).json(true);
  })
);

export default router;
