import { Router } from 'express';
import { z } from 'zod';
import { checkAdminPermission } from '../../util/middlewares';
import { executeRequest, validateRequest } from '../../util/routing';
import { createAPIKey } from './services/CreateAPIKeyService';
import { fetchTableCounts } from './services/FetchTableCountsService';
import { toggleUnderAttackMode } from './services/ToggleUnderAttackModeService';

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

router.post(
  '/under-attack-mode',
  checkAdminPermission,
  validateRequest({
    body: z.object({
      state: z.boolean()
    })
  }),
  executeRequest(async (req, res) => {
    const { state } = req.body;
    await toggleUnderAttackMode(state);

    res.status(200).json(state);
  })
);

router.get(
  '/stats',
  executeRequest(async (_, res) => {
    const stats = await fetchTableCounts();
    res.status(200).json(stats);
  })
);

export default router;
