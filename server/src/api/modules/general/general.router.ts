import { Router } from 'express';
import { z } from 'zod';
import { checkAdminPermission } from '../../util/middlewares';
import { validateRequest } from '../../util/routing';
import { createAPIKey } from './services/CreateAPIKeyService';
import { fetchTableCounts } from './services/FetchTableCountsService';

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
  async (req, res) => {
    const { application, developer } = req.body;
    const key = await createAPIKey(application, developer);

    res.status(201).json(key);
  }
);

router.get('/stats', async (_, res) => {
  const stats = await fetchTableCounts();
  res.status(200).json(stats);
});

export default router;
