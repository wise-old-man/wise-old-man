import { Router } from 'express';
import { z } from 'zod';
import { checkAdminPermission } from '../../util/middlewares';
import { executeRequest, validateRequest } from '../../util/routing';
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
  executeRequest(async (req, res) => {
    res.status(400).json({
      message: 'Not available in leagues.'
    });
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
    res.status(400).json({
      message: 'Not available in leagues.'
    });
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
    res.status(400).json({
      message: 'Not available in leagues.'
    });
  })
);

export default router;
