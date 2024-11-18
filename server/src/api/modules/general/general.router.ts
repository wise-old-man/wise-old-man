import { Router } from 'express';
import { z } from 'zod';
import { checkAdminPermission } from '../../util/middlewares';
import { executeRequest, validateRequest } from '../../util/routing';
import { fetchTableCounts } from './services/FetchTableCountsService';
import { blockUserActions } from './services/BlockUserActionsService';
import { allowUserActions } from './services/AllowUserActionsService';
import { BadRequestError } from 'src/api/errors';

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
  executeRequest(async () => {
    throw new BadRequestError('This endpoint is not available in leagues');
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
