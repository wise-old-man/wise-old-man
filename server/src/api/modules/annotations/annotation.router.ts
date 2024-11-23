import { Router } from 'express';
import { z } from 'zod';
import { checkAdminPermission } from '../../util/middlewares';
import { PlayerAnnotations } from '../../../prisma';
import { executeRequest, validateRequest } from '../../util/routing';
import { createPlayerAnnotation, fetchPlayerAnnotations } from './services/index';

const router = Router();

router.post(
  '/players/:username/annotation',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      username: z.string().min(1)
    }),
    body: z.object({
      annotation: z.nativeEnum(PlayerAnnotations)
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { annotation } = req.body;

    const createdAnnotation = await createPlayerAnnotation(username, annotation);

    res.status(201).json(createdAnnotation);
  })
);

router.get('/players/:username/annotation', checkAdminPermission, async (req, res) => {
  const { username } = req.params;

  const annotations = await fetchPlayerAnnotations(username);

  res.json(annotations);
});

export default router;
